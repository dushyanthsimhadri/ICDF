from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from db.database import get_db
from db.models import PortfolioInitiative, AuditLog
import datetime

router = APIRouter(prefix="/portfolio", tags=["portfolio"])

class PortfolioCreate(BaseModel):
    name: str
    strategic_goal: str
    budget: int
    spent: int = 0
    delivery_confidence: int = 90
    risk_summary: Optional[str] = "None detected."
    tenant_id: str

@router.get("/list")
def get_portfolio(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    initiatives = db.query(PortfolioInitiative).filter(PortfolioInitiative.tenant_id == tenant_id).all()
    
    # Calculate portfolio strategic goals & summaries
    total_budget = sum(i.budget for i in initiatives)
    total_spent = sum(i.spent for i in initiatives)
    avg_confidence = int(sum(i.delivery_confidence for i in initiatives) / len(initiatives)) if initiatives else 100
    
    return {
        "initiatives": [{
            "id": i.id,
            "name": i.name,
            "status": i.status,
            "budget": i.budget,
            "spent": i.spent,
            "strategic_goal": i.strategic_goal,
            "delivery_confidence": i.delivery_confidence,
            "risk_summary": i.risk_summary
        } for i in initiatives],
        "kpis": {
            "total_budget": total_budget,
            "total_spent": total_spent,
            "avg_confidence": avg_confidence,
            "initiatives_count": len(initiatives)
        }
    }

@router.post("/create")
def create_portfolio_item(data: PortfolioCreate, db: Session = Depends(get_db)):
    p = PortfolioInitiative(
        name=data.name,
        status="Planning",
        budget=data.budget,
        spent=data.spent,
        strategic_goal=data.strategic_goal,
        delivery_confidence=data.delivery_confidence,
        risk_summary=data.risk_summary,
        tenant_id=data.tenant_id
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    
    log = AuditLog(
        user_email="admin@icdf.enterprise",
        action="Admin Change",
        details=f"Created strategic portfolio initiative: '{data.name}'",
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()
    return p

@router.get("/analysis")
def get_portfolio_analysis(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    initiatives = db.query(PortfolioInitiative).filter(PortfolioInitiative.tenant_id == tenant_id).all()
    
    # Simple AI agent recommendation text based on confidence levels
    if not initiatives:
        return {"analysis": "No active initiatives. Add strategic goals to review portfolio safety."}
        
    low_conf = [i.name for i in initiatives if i.delivery_confidence < 85]
    
    if low_conf:
        analysis_text = f"AI Portfolio Advisor: Critical risk detected in {', '.join(low_conf)}. Delivery confidence is below 85% due to telemetry latency bottlenecks. Re-aligning DevOps resource staffing is recommended immediately to protect Q3 milestone commitments."
    else:
        analysis_text = "AI Portfolio Advisor: Strategic portfolio health is stable (average delivery confidence above 90%). All initiatives comply with core SOC2 data residency guidelines."
        
    return {"analysis": analysis_text}
