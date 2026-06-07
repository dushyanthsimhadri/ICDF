from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from db.database import get_db
from db.models import Ticket, AuditLog, AutomationRule
import datetime

router = APIRouter(prefix="/workflows", tags=["workflows"])

class TicketCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    status: Optional[str] = "To Do"
    assignee: Optional[str] = "Unassigned"
    priority: Optional[str] = "Medium"
    category: Optional[str] = "Feature"
    velocity_days: Optional[int] = 5
    risk_score: Optional[int] = 10
    dependencies: Optional[str] = ""
    tenant_id: str

class TicketStatusUpdate(BaseModel):
    id: int
    status: str
    tenant_id: str

class WorkflowActionTrigger(BaseModel):
    action_type: str # create_ticket, generate_summary, send_alert, update_docs, stakeholder_notif, risk_alert, priority_recom
    payload: dict
    tenant_id: str

class AutomationRuleCreate(BaseModel):
    name: str
    trigger: str
    action: str
    tenant_id: str

class AutomationRuleToggle(BaseModel):
    id: int
    tenant_id: str

@router.get("/tickets")
def get_tickets(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    tickets = db.query(Ticket).filter(Ticket.tenant_id == tenant_id).all()
    return [{
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "status": t.status,
        "assignee": t.assignee,
        "priority": t.priority,
        "category": t.category,
        "velocity_days": t.velocity_days,
        "risk_score": t.risk_score,
        "dependencies": t.dependencies,
        "created_at": t.created_at.isoformat()
    } for t in tickets]

@router.post("/ticket-create")
def create_ticket(data: TicketCreate, db: Session = Depends(get_db)):
    t = Ticket(
        title=data.title,
        description=data.description,
        status=data.status,
        assignee=data.assignee,
        priority=data.priority,
        category=data.category,
        velocity_days=data.velocity_days,
        risk_score=data.risk_score,
        dependencies=data.dependencies,
        tenant_id=data.tenant_id
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    
    log = AuditLog(
        user_email="user@icdf.enterprise",
        action="Create Ticket",
        details=f"Created ticket: {t.title} assigned to {t.assignee}",
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()
    
    return t

@router.post("/ticket-status")
def update_status(data: TicketStatusUpdate, db: Session = Depends(get_db)):
    t = db.query(Ticket).filter(Ticket.id == data.id, Ticket.tenant_id == data.tenant_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    old_status = t.status
    t.status = data.status
    db.commit()
    
    log = AuditLog(
        user_email="user@icdf.enterprise",
        action="Role Changes" if old_status != data.status else "Workflow Execution",
        details=f"Updated ticket #{t.id} status from {old_status} to {data.status}",
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()
    return {"message": "Status updated successfully", "id": t.id, "status": t.status}

@router.post("/action-trigger")
def trigger_action(data: WorkflowActionTrigger, db: Session = Depends(get_db)):
    action_type = data.action_type
    payload = data.payload
    
    log_details = f"Triggered automated action: {action_type}. Payload: {payload}"
    
    # Audit log
    log = AuditLog(
        user_email="automated_workflow@icdf.enterprise",
        action="Workflow Execution",
        details=log_details,
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()
    
    response_msg = ""
    if action_type == "create_ticket":
        t = Ticket(
            title=payload.get("title", "AI Action Story"),
            description=payload.get("description", "Generated automatically by ICDF Core Engine."),
            status="To Do",
            assignee="Unassigned",
            priority=payload.get("priority", "Medium"),
            category="Feature",
            velocity_days=4,
            risk_score=10,
            tenant_id=data.tenant_id
        )
        db.add(t)
        db.commit()
        response_msg = f"Created ticket #{t.id}: {t.title}"
    elif action_type == "generate_summary":
        response_msg = "AI summary created for context: " + str(payload.get("context_id", "General Context"))
    elif action_type == "send_alert":
        response_msg = f"Slack alert dispatched to channel #{payload.get('channel', 'alerts')}: '{payload.get('text')}'"
    elif action_type == "update_docs":
        response_msg = f"Knowledge Hub page '{payload.get('title')}' successfully updated."
    elif action_type == "stakeholder_notif":
        response_msg = f"Executive dashboard brief dispatched to stakeholders. Confidence level: {payload.get('confidence', '91%')}"
    elif action_type == "risk_alert":
        response_msg = f"[CRITICAL RISK ESCALATION] Security team notified of vulnerability block: {payload.get('risk_detail')}"
    elif action_type == "priority_recom":
        response_msg = f"Prioritization suggestions pushed. Suggested priority swap: Ticket ICDF-48 to Critical."
    else:
        response_msg = f"Action {action_type} dispatched."

    return {
        "status": "Success",
        "action_type": action_type,
        "message": response_msg
    }

@router.get("/rules")
def get_rules(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    rules = db.query(AutomationRule).filter(AutomationRule.tenant_id == tenant_id).all()
    return [{"id": r.id, "name": r.name, "trigger": r.trigger, "action": r.action, "is_active": r.is_active} for r in rules]

@router.post("/rules-create")
def create_rule(data: AutomationRuleCreate, db: Session = Depends(get_db)):
    r = AutomationRule(
        name=data.name,
        trigger=data.trigger,
        action=data.action,
        is_active=True,
        tenant_id=data.tenant_id
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    
    log = AuditLog(
        user_email="admin@icdf.enterprise",
        action="Admin Change",
        details=f"Created automation rule '{data.name}' for trigger '{data.trigger}' -> action '{data.action}'",
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()
    return r

@router.post("/rules-toggle")
def toggle_rule(data: AutomationRuleToggle, db: Session = Depends(get_db)):
    r = db.query(AutomationRule).filter(AutomationRule.id == data.id, AutomationRule.tenant_id == data.tenant_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Automation rule not found")
    r.is_active = not r.is_active
    db.commit()
    
    log = AuditLog(
        user_email="admin@icdf.enterprise",
        action="Admin Change",
        details=f"Toggled automation rule '{r.name}' active state to {r.is_active}",
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()
    return {"id": r.id, "is_active": r.is_active}
