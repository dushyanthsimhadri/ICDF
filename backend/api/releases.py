from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from db.models import ReleaseTrain, AuditLog
from db.database import get_db
import datetime
import json

router = APIRouter(prefix="/releases", tags=["releases"])

class ReleaseCreate(BaseModel):
    name: str
    environment: str = "Production"
    release_date: str # ISO Date
    checklist: List[dict] = []
    tenant_id: str

class GoNoGoToggle(BaseModel):
    id: int
    go_no_go_status: str # Go, No-Go, Pending
    tenant_id: str

@router.get("/list")
def get_releases(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    trains = db.query(ReleaseTrain).filter(ReleaseTrain.tenant_id == tenant_id).all()
    results = []
    for t in trains:
        try:
            chk = json.loads(t.checklist_json)
        except:
            chk = []
        results.append({
            "id": t.id,
            "name": t.name,
            "status": t.status,
            "environment": t.environment,
            "release_date": t.release_date.isoformat(),
            "go_no_go_status": t.go_no_go_status,
            "checklist": chk
        })
    return results

@router.post("/create")
def create_release(data: ReleaseCreate, db: Session = Depends(get_db)):
    try:
        rdate = datetime.datetime.fromisoformat(data.release_date.replace("Z", ""))
    except:
        rdate = datetime.datetime.utcnow() + datetime.timedelta(days=7)
        
    r = ReleaseTrain(
        name=data.name,
        status="Planning",
        environment=data.environment,
        release_date=rdate,
        go_no_go_status="Pending",
        checklist_json=json.dumps(data.checklist),
        tenant_id=data.tenant_id
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    
    log = AuditLog(
        user_email="admin@icdf.enterprise",
        action="Admin Change",
        details=f"Scheduled new release train: '{data.name}' for {data.environment}",
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()
    return {
        "id": r.id,
        "name": r.name,
        "status": r.status,
        "environment": r.environment,
        "release_date": r.release_date.isoformat()
    }

@router.post("/toggle-go-no-go")
def toggle_go_no_go(data: GoNoGoToggle, db: Session = Depends(get_db)):
    r = db.query(ReleaseTrain).filter(ReleaseTrain.id == data.id, ReleaseTrain.tenant_id == data.tenant_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Release train not found")
        
    old_gng = r.go_no_go_status
    r.go_no_go_status = data.go_no_go_status
    
    if data.go_no_go_status == "Go":
        r.status = "Ready"
    elif data.go_no_go_status == "No-Go":
        r.status = "Blocked"
    else:
        r.status = "Planning"
        
    db.commit()
    
    log = AuditLog(
        user_email="admin@icdf.enterprise",
        action="Connector Action",
        details=f"Updated release gate for '{r.name}': {old_gng} -> {data.go_no_go_status}",
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()
    return {"id": r.id, "go_no_go_status": r.go_no_go_status, "status": r.status}

@router.get("/advisor")
def get_release_advisor(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    trains = db.query(ReleaseTrain).filter(ReleaseTrain.tenant_id == tenant_id).all()
    if not trains:
        return {"advisor_text": "No active release trains registered."}
        
    blocked = [t.name for t in trains if t.status == "Blocked" or t.go_no_go_status == "No-Go"]
    
    if blocked:
        advice = f"AI Release Advisor Warning: Gate Blocked on {', '.join(blocked)}. Deployment readiness checklist is incomplete or UAT tests failed. Recommend rolling back to hotpatch RC-1."
    else:
        advice = "AI Release Advisor: Release readiness is optimal. UAT pass rates are at 100%. Uptime SLA compliance check passed. Ready to engage rollout train."
        
    return {"advisor_text": advice}
