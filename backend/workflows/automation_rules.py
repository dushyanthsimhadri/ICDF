from sqlalchemy.orm import Session
from .workflow_engine import enqueue_workflow_action
from db.models import GovernancePolicy

def evaluate_automation_rules(event_type: str, event_data: dict, tenant_id: str, db: Session) -> list:
    triggered_actions = []
    
    if event_type == "build_stability_breach":
        # Rule: If latency target is breached, trigger Slack notification and rollback action
        latency = event_data.get("latency_ms", 0)
        if latency > 100: # Latency target breached
            act = enqueue_workflow_action(
                action_type="Notify Slack",
                payload={"text": f"[CRITICAL SLA BREACH] API latency reached {latency}ms (Target: <15ms). Rolling back latest deploy."},
                approval_required=False,
                tenant_id=tenant_id,
                db=db
            )
            triggered_actions.append(act.id)
            
    elif event_type == "code_coverage_drop":
        coverage = event_data.get("coverage", 100.0)
        if coverage < 90.0:
            act = enqueue_workflow_action(
                action_type="Create Ticket",
                payload={
                    "title": f"Fix test suite coverage - currently {coverage}%",
                    "priority": "High",
                    "assignee": "Dev Lead"
                },
                approval_required=True, # Requires human lead approval
                tenant_id=tenant_id,
                db=db
            )
            triggered_actions.append(act.id)
            
    elif event_type == "policy_violation":
        policy_name = event_data.get("policy_name")
        act = enqueue_workflow_action(
            action_type="Notify Slack",
            payload={"text": f"[POLICY ALERT] Security violation detected on standard rule: '{policy_name}'."},
            approval_required=False,
            tenant_id=tenant_id,
            db=db
        )
        triggered_actions.append(act.id)
        
    return triggered_actions
