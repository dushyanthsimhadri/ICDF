from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from db.database import get_db
from db.models import Notification, AuditLog
import datetime

router = APIRouter(prefix="/notifications", tags=["notifications"])

class MarkReadRequest(BaseModel):
    id: Optional[int] = None # If None, mark all as read for the tenant
    tenant_id: str

class NotificationCreate(BaseModel):
    title: str
    message: str
    category: str # Alert, Connector, Risk, Workflow, AI, Release
    tenant_id: str

@router.get("/list")
def get_notifications(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    notifs = db.query(Notification).filter(Notification.tenant_id == tenant_id).order_by(Notification.created_at.desc()).limit(100).all()
    return [{
        "id": n.id,
        "title": n.title,
        "message": n.message,
        "category": n.category,
        "is_read": n.is_read,
        "created_at": n.created_at.isoformat(),
        "tenant_id": n.tenant_id
    } for n in notifs]

@router.post("/mark-read")
def mark_notifications_read(data: MarkReadRequest, db: Session = Depends(get_db)):
    if data.id is not None:
        notif = db.query(Notification).filter(Notification.id == data.id, Notification.tenant_id == data.tenant_id).first()
        if not notif:
            raise HTTPException(status_code=404, detail="Notification not found")
        notif.is_read = True
    else:
        # Mark all as read
        db.query(Notification).filter(Notification.tenant_id == data.tenant_id).update({Notification.is_read: True})
    
    db.commit()
    return {"status": "Success"}

@router.post("/create")
def create_notification(data: NotificationCreate, db: Session = Depends(get_db)):
    n = Notification(
        title=data.title,
        message=data.message,
        category=data.category,
        is_read=False,
        tenant_id=data.tenant_id
    )
    db.add(n)
    db.commit()
    db.refresh(n)
    
    # Log audit trail
    log = AuditLog(
        user_email="system@icdf.io",
        action="Trigger Notification",
        details=f"Notification triggered: '{data.title}' under tenant '{data.tenant_id}'",
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()
    
    return n
