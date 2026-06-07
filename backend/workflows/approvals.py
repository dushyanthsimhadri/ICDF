from sqlalchemy.orm import Session
from db.models import WorkflowAction, AuditLog
from .workflow_engine import execute_queued_action
import datetime

def approve_action(action_id: int, user_email: str, db: Session) -> dict:
    action = db.query(WorkflowAction).filter(WorkflowAction.id == action_id).first()
    if not action:
        return {"status": "Error", "message": "Action not found"}
        
    action.status = "Approved"
    action.approved_by = user_email
    action.approved_at = datetime.datetime.utcnow()
    db.commit()
    
    # Audit log
    log = AuditLog(
        user_email=user_email,
        action="Approve Action Override",
        details=f"Approved action #{action_id} ({action.action_type})"
    )
    db.add(log)
    db.commit()
    
    # Execute immediately now that it's approved
    res = execute_queued_action(action_id, db)
    return res

def reject_action(action_id: int, user_email: str, db: Session) -> dict:
    action = db.query(WorkflowAction).filter(WorkflowAction.id == action_id).first()
    if not action:
        return {"status": "Error", "message": "Action not found"}
        
    action.status = "Rejected"
    action.approved_by = user_email
    action.approved_at = datetime.datetime.utcnow()
    db.commit()
    
    # Audit log
    log = AuditLog(
        user_email=user_email,
        action="Reject Action Override",
        details=f"Rejected and cancelled action #{action_id} ({action.action_type})"
    )
    db.add(log)
    db.commit()
    
    return {"status": "Rejected", "message": f"Action #{action_id} rejected and cancelled."}
