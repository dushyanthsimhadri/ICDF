from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from db.database import get_db
from db.models import PRD, PRDVersion, AuditLog
import datetime
import json

router = APIRouter(prefix="/pm-prds", tags=["pm-prds"])

class PRDCreate(BaseModel):
    title: str
    overview: str
    problem_statement: str
    goals: str
    scope: str
    tenant_id: str

class PRDEdit(BaseModel):
    id: int
    title: str
    overview: str
    problem_statement: str
    goals: str
    scope: str
    requirements: List[str]
    user_stories: List[str]
    acceptance_criteria: List[str]
    tenant_id: str

class AIGenerateRequest(BaseModel):
    title: str
    overview: str
    action_type: str # stories, acceptance, risk, kpis, full

@router.get("/list")
def get_prds(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    prds = db.query(PRD).filter(PRD.tenant_id == tenant_id).all()
    results = []
    for p in prds:
        try:
            reqs = json.loads(p.requirements_json)
        except:
            reqs = []
        try:
            stories = json.loads(p.user_stories_json)
        except:
            stories = []
        try:
            criteria = json.loads(p.acceptance_criteria_json)
        except:
            criteria = []
            
        results.append({
            "id": p.id,
            "title": p.title,
            "overview": p.overview,
            "problem_statement": p.problem_statement,
            "goals": p.goals,
            "objectives": p.objectives,
            "scope": p.scope,
            "requirements": reqs,
            "user_stories": stories,
            "acceptance_criteria": criteria,
            "dependencies": p.dependencies,
            "risks": p.risks,
            "kpis": p.kpis,
            "success_metrics": p.success_metrics,
            "timeline": p.timeline,
            "release_plan": p.release_plan,
            "status": p.status,
            "stakeholders": p.stakeholders,
            "quality_score": p.quality_score
        })
    return results

@router.post("/create")
def create_prd(data: PRDCreate, db: Session = Depends(get_db)):
    prd = PRD(
        title=data.title,
        overview=data.overview,
        problem_statement=data.problem_statement,
        goals=data.goals,
        scope=data.scope,
        requirements_json=json.dumps([]),
        user_stories_json=json.dumps([]),
        acceptance_criteria_json=json.dumps([]),
        status="Draft",
        quality_score=60,
        tenant_id=data.tenant_id
    )
    db.add(prd)
    db.commit()
    db.refresh(prd)
    
    ver = PRDVersion(
        prd_id=prd.id,
        version_num=1,
        prd_data_json=json.dumps({"title": prd.title, "overview": prd.overview}),
        updated_by="pm@icdf.io"
    )
    db.add(ver)
    db.commit()
    return prd

@router.post("/edit")
def edit_prd(data: PRDEdit, db: Session = Depends(get_db)):
    p = db.query(PRD).filter(PRD.id == data.id, PRD.tenant_id == data.tenant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="PRD not found")
        
    p.title = data.title
    p.overview = data.overview
    p.problem_statement = data.problem_statement
    p.goals = data.goals
    p.scope = data.scope
    p.requirements_json = json.dumps(data.requirements)
    p.user_stories_json = json.dumps(data.user_stories)
    p.acceptance_criteria_json = json.dumps(data.acceptance_criteria)
    
    # Recalculate basic quality score based on section completions
    score = 40
    if len(data.requirements) > 0: score += 20
    if len(data.user_stories) > 0: score += 20
    if len(data.acceptance_criteria) > 0: score += 20
    p.quality_score = min(100, score)
    
    latest_ver = db.query(PRDVersion).filter(PRDVersion.prd_id == p.id).order_by(PRDVersion.version_num.desc()).first()
    next_ver_num = (latest_ver.version_num + 1) if latest_ver else 1
    
    ver = PRDVersion(
        prd_id=p.id,
        version_num=next_ver_num,
        prd_data_json=json.dumps({
            "title": p.title,
            "overview": p.overview,
            "requirements": data.requirements
        }),
        updated_by="pm@icdf.io"
    )
    db.add(ver)
    db.commit()
    db.refresh(p)
    return p

@router.post("/ai-generate")
def ai_generate(data: AIGenerateRequest):
    act = data.action_type
    
    if act == "stories":
        return {
            "user_stories": [
                f"As a Product Manager, I want to review '{data.title}' details so that I can coordinate release schedules.",
                "As an engineer, I want structured specs so that I can implement connections safely."
            ]
        }
    elif act == "acceptance":
        return {
            "acceptance_criteria": [
                "Handshake latency conforms to SLA bounds (<15ms)",
                "Double-submission validation prevents duplication errors"
            ]
        }
    elif act == "risk":
        return {
            "risks": "Local container model capacity constraints. Connection overhead on concurrency checks."
        }
    elif act == "kpis":
        return {
            "kpis": "WebSocket Handshake Speed, Active Connector Load Ratio, Message Delivery Success Uptime"
        }
    else: # full
        return {
            "overview": f"Strategic product design brief covering {data.title} metrics. Targeted to roll out in Q3 sprint schedules.",
            "goals": "Bypass legacy REST bottlenecks, scale active connections to 10k/sec, and preserve client-side responsiveness."
        }
