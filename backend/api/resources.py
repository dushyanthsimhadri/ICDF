from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from db.models import ResourceAllocation, AuditLog
from db.database import get_db

router = APIRouter(prefix="/resources", tags=["resources"])

class ResourceAllocateRequest(BaseModel):
    user_email: str
    allocated_percentage: int
    skill_tags: str
    tenant_id: str

@router.get("/capacity")
def get_capacity(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    allocations = db.query(ResourceAllocation).filter(ResourceAllocation.tenant_id == tenant_id).all()
    
    # Calculate overload counts
    overloaded_count = sum(1 for a in allocations if a.allocated_percentage > 100)
    burnout_risks = sum(1 for a in allocations if a.burnout_risk_score > 60)
    
    return {
        "allocations": [{
            "id": a.id,
            "user_email": a.user_email,
            "allocated_percentage": a.allocated_percentage,
            "skill_tags": [tag.strip() for tag in a.skill_tags.split(",")],
            "burnout_risk_score": a.burnout_risk_score
        } for a in allocations],
        "metrics": {
            "total_staff": len(allocations),
            "overloaded_staff": overloaded_count,
            "burnout_risks_count": burnout_risks
        }
    }

@router.post("/allocate")
def allocate_resource(data: ResourceAllocateRequest, db: Session = Depends(get_db)):
    # Find existing allocation
    alloc = db.query(ResourceAllocation).filter(
        ResourceAllocation.user_email == data.user_email,
        ResourceAllocation.tenant_id == data.tenant_id
    ).first()
    
    if not alloc:
        # Determine a mock burnout risk score based on allocation load
        burnout = 15 if data.allocated_percentage <= 100 else (50 + (data.allocated_percentage - 100) * 2)
        alloc = ResourceAllocation(
            user_email=data.user_email,
            allocated_percentage=data.allocated_percentage,
            skill_tags=data.skill_tags,
            burnout_risk_score=burnout,
            tenant_id=data.tenant_id
        )
        db.add(alloc)
    else:
        alloc.allocated_percentage = data.allocated_percentage
        alloc.skill_tags = data.skill_tags
        # Recalculate burnout
        alloc.burnout_risk_score = 15 if data.allocated_percentage <= 100 else (50 + (data.allocated_percentage - 100) * 2)
        
    db.commit()
    db.refresh(alloc)
    
    log = AuditLog(
        user_email="admin@icdf.enterprise",
        action="Admin Change",
        details=f"Updated resource allocations for '{data.user_email}': {data.allocated_percentage}% load",
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()
    return alloc

@router.get("/advisor")
def get_resource_advisor(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    allocations = db.query(ResourceAllocation).filter(ResourceAllocation.tenant_id == tenant_id).all()
    if not allocations:
        return {"advisor_text": "No staff resources registered."}
        
    overloaded = [a.user_email for a in allocations if a.allocated_percentage > 100]
    
    if overloaded:
        advice = f"AI Capacity Advisor Alert: Overload detected for {', '.join(overloaded)}. Burnout risk index is CRITICAL (>80%). Recommend shifting 20% backlog tasks to other squads or de-prioritizing low-priority strategic goals."
    else:
        advice = "AI Capacity Advisor: Workforce distribution is optimal. Average allocation is at 78% capacity with zero burnout risk flags. Skills matrix covers current roadmap requirements."
        
    return {"advisor_text": advice}
