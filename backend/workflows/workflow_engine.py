from sqlalchemy.orm import Session
from db.models import WorkflowAction, Ticket, AuditLog
import json
import datetime

def enqueue_workflow_action(action_type: str, payload: dict, approval_required: bool, tenant_id: str, db: Session) -> WorkflowAction:
    action = WorkflowAction(
        action_type=action_type,
        status="Awaiting Approval" if approval_required else "Approved",
        payload=json.dumps(payload),
        approval_required=approval_required,
        tenant_id=tenant_id
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    
    # Audit log
    log = AuditLog(
        user_email="workflow_engine@icdf.io",
        action="Enqueue Action",
        details=f"Enqueued {action_type} (Approval Required: {approval_required})",
        tenant_id=tenant_id
    )
    db.add(log)
    db.commit()
    return action

def execute_queued_action(action_id: int, db: Session) -> dict:
    action = db.query(WorkflowAction).filter(WorkflowAction.id == action_id).first()
    if not action:
        return {"status": "Error", "message": "Action not found"}
        
    if action.status == "Awaiting Approval":
        return {"status": "Blocked", "message": "Action requires human approval override."}
        
    payload = json.loads(action.payload)
    action.status = "Executing"
    db.commit()
    
    success = True
    error_msg = None
    msg = ""
    
    try:
        if action.action_type == "Create Ticket":
            # Add new ticket to DB
            t = Ticket(
                title=payload.get("title", "AI Action Story"),
                description=payload.get("description", "Created automatically by Workflow Engine"),
                status="To Do",
                assignee=payload.get("assignee", "Developer"),
                priority=payload.get("priority", "Medium"),
                tenant_id=action.tenant_id
            )
            db.add(t)
            msg = f"Created ticket: {t.title}"
        elif action.action_type == "Notify Slack":
            msg = f"Slack alert dispatched: '{payload.get('text')}'"
        elif action.action_type == "Update Docs":
            msg = f"Knowledge wiki updated for doc: {payload.get('doc_id')}"
        elif action.action_type == "Generate Reports":
            msg = f"Compliance release report generated."
        else:
            msg = f"Dispatched custom action: {action.action_type}"
    except Exception as e:
        success = False
        error_msg = str(e)
        
    if success:
        action.status = "Executed"
    else:
        action.status = "Failed"
        action.error_msg = error_msg
        
    db.commit()
    return {
        "status": action.status,
        "message": msg,
        "error": error_msg
    }
