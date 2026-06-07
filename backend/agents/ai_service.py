from sqlalchemy.orm import Session
from db.models import ProductBrainConfig, WorkflowAction
from .agent_runtime import BaseAgent
import json

def get_agent_config(role: str, db: Session, tenant_id: str = "acme_corp") -> dict:
    cfg = db.query(ProductBrainConfig).filter(
        ProductBrainConfig.role_name == role,
        ProductBrainConfig.tenant_id == tenant_id
    ).first()
    if not cfg:
        return {"mode": "Hybrid", "model": "Llama3"}
    return {"mode": cfg.operating_mode, "model": cfg.ai_model}

def run_agent_service(role: str, input_text: str, context: str, db: Session, tenant_id: str = "acme_corp") -> dict:
    cfg = get_agent_config(role, db, tenant_id)
    
    if cfg["mode"] == "Disabled":
        return {
            "role": role,
            "status": "Disabled",
            "mode": "Disabled",
            "output": f"The {role} agent is disabled in admin portal configs."
        }
        
    if cfg["mode"] == "Human":
        return {
            "role": role,
            "status": "Human Required",
            "mode": "Human",
            "output": f"Awaiting input from designated Human operator for {role} role. No autonomous action will be taken."
        }

    if cfg["mode"] == "Hybrid":
        # 1. Run agent to draft output
        agent = BaseAgent(role=role, db=db, model_name=cfg["model"])
        res = agent.run(input_text, context)
        
        # 2. Queue in WorkflowAction for Approval Gates Console
        action = WorkflowAction(
            action_type=f"{role} Agent Action",
            status="Awaiting Approval",
            payload=json.dumps({
                "role": role,
                "input": input_text,
                "output": res["output"],
                "model": cfg["model"]
            }),
            approval_required=True,
            tenant_id=tenant_id,
            comments=f"Agent Drafted Response: {res['output'][:100]}...",
            escalation_status="Standard",
            sla_deadline_hours=24
        )
        db.add(action)
        db.commit()
        
        res["output"] = f"[HYBRID WORKFLOW QUEUED FOR APPROVAL]\n\n{res['output']}"
        res["status"] = "Pending Approval"
        res["mode"] = "Hybrid"
        res["action_id"] = action.id
        return res

    # AI Agent (Fully AI)
    agent = BaseAgent(role=role, db=db, model_name=cfg["model"])
    res = agent.run(input_text, context)
    res["status"] = "Success"
    res["mode"] = cfg["mode"]
    return res
