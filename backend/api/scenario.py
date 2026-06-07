from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from db.models import ScenarioSimulation, AuditLog
from db.database import get_db

router = APIRouter(prefix="/scenario", tags=["scenario"])

class ScenarioRequest(BaseModel):
    scenario_name: str # sprint_slip_2w, capacity_drop_20, dependency_unresolved
    tenant_id: str

@router.post("/simulate")
def simulate_scenario(data: ScenarioRequest, db: Session = Depends(get_db)):
    simulation = db.query(ScenarioSimulation).filter(
        ScenarioSimulation.scenario_name == data.scenario_name,
        ScenarioSimulation.tenant_id == data.tenant_id
    ).first()
    
    if not simulation:
        # Default fallback scenario
        return {
            "scenario_name": data.scenario_name,
            "forecast_summary": f"Simulating custom scenario '{data.scenario_name}'. AI predicts minor velocity impact.",
            "risk_impact_level": "Medium",
            "timeline_delay_days": 4,
            "recommendation": "Review active sprint capacity metrics and verify connector endpoints health."
        }
        
    # Log simulation query audit
    log = AuditLog(
        user_email="pm@icdf.enterprise",
        action="Workflow Execution",
        details=f"Ran scenario simulation model: '{data.scenario_name}'",
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()
    
    return {
        "scenario_name": simulation.scenario_name,
        "forecast_summary": simulation.forecast_summary,
        "risk_impact_level": simulation.risk_impact_level,
        "timeline_delay_days": simulation.timeline_delay_days,
        "recommendation": simulation.recommendation
    }
