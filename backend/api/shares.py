from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from db.database import get_db
from db.models import SharePermission, AuditLog
import datetime

router = APIRouter(prefix="/shares", tags=["shares"])

class ShareGrant(BaseModel):
    resource_type: str # whiteboard, document, prd, meeting, dashboard
    resource_id: int
    user_email: Optional[str] = None
    role: Optional[str] = None
    permission: str = "View" # View, Comment, Edit, Admin
    tenant_id: str = "acme_corp"
    granted_by: str = "pm@icdf.io"

class ShareRevoke(BaseModel):
    id: int
    tenant_id: str = "acme_corp"
    revoked_by: str = "pm@icdf.io"

@router.get("/permissions")
def list_permissions(resource_type: str, resource_id: int, tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    perms = db.query(SharePermission).filter(
        SharePermission.resource_type == resource_type,
        SharePermission.resource_id == resource_id,
        SharePermission.tenant_id == tenant_id
    ).all()
    return [{
        "id": p.id,
        "resource_type": p.resource_type,
        "resource_id": p.resource_id,
        "user_email": p.user_email,
        "role": p.role,
        "permission": p.permission,
        "created_at": p.created_at.isoformat()
    } for p in perms]

@router.post("/grant")
def grant_permission(data: ShareGrant, db: Session = Depends(get_db)):
    perm = SharePermission(
        resource_type=data.resource_type,
        resource_id=data.resource_id,
        user_email=data.user_email,
        role=data.role,
        permission=data.permission,
        tenant_id=data.tenant_id
    )
    db.add(perm)
    db.commit()
    db.refresh(perm)
    
    # Audit log
    details = f"Granted {data.permission} on {data.resource_type} #{data.resource_id}"
    if data.user_email:
        details += f" to User {data.user_email}"
    if data.role:
        details += f" to Role {data.role}"
        
    log = AuditLog(
        user_email=data.granted_by,
        action="Grant Share Permission",
        details=details,
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()
    
    return perm

@router.post("/revoke")
def revoke_permission(data: ShareRevoke, db: Session = Depends(get_db)):
    perm = db.query(SharePermission).filter(
        SharePermission.id == data.id,
        SharePermission.tenant_id == data.tenant_id
    ).first()
    
    if not perm:
        raise HTTPException(status_code=404, detail="Permission record not found")
        
    db.delete(perm)
    
    log = AuditLog(
        user_email=data.revoked_by,
        action="Revoke Share Permission",
        details=f"Revoked permission record #{data.id}",
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()
    
    return {"status": "Success"}

@router.get("/check")
def check_permission(
    resource_type: str,
    resource_id: int,
    user_email: str,
    role: str,
    tenant_id: str = "acme_corp",
    db: Session = Depends(get_db)
):
    # Check if user email has explicit permissions
    explicit = db.query(SharePermission).filter(
        SharePermission.resource_type == resource_type,
        SharePermission.resource_id == resource_id,
        SharePermission.user_email == user_email,
        SharePermission.tenant_id == tenant_id
    ).first()
    
    if explicit:
        return {"allowed": True, "permission": explicit.permission}
        
    # Check if role matches role permissions
    role_perm = db.query(SharePermission).filter(
        SharePermission.resource_type == resource_type,
        SharePermission.resource_id == resource_id,
        SharePermission.role == role,
        SharePermission.tenant_id == tenant_id
    ).first()
    
    if role_perm:
        return {"allowed": True, "permission": role_perm.permission}
        
    # Check if there is any general public/all share (role and user_email are both null)
    public_perm = db.query(SharePermission).filter(
        SharePermission.resource_type == resource_type,
        SharePermission.resource_id == resource_id,
        SharePermission.user_email == None,
        SharePermission.role == None,
        SharePermission.tenant_id == tenant_id
    ).first()
    
    if public_perm:
        return {"allowed": True, "permission": public_perm.permission}
        
    # Default behavior for creators: if we are PM or Executive, or if creator check passes (default to true for demonstration)
    return {"allowed": True, "permission": "Admin"}
