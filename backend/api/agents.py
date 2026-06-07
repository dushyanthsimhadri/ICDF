from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from db.database import get_db
from agents.product_brain import query_brain

router = APIRouter(prefix="/agents", tags=["agents"])

class AgentQueryRequest(BaseModel):
    role: str
    query: str
    context: str = ""
    tenant_id: str = "acme_corp"

@router.post("/query")
def run_agent_query(data: AgentQueryRequest, db: Session = Depends(get_db)):
    result = query_brain(
        role=data.role,
        query=data.query,
        context=data.context,
        db=db,
        tenant_id=data.tenant_id
    )
    return result

@router.get("/config/{role}")
def get_role_agent_config(role: str, tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    from db.models import ProductBrainConfig
    cfg = db.query(ProductBrainConfig).filter(
        ProductBrainConfig.role_name == role,
        ProductBrainConfig.tenant_id == tenant_id
    ).first()
    if not cfg:
        return {"role_name": role, "operating_mode": "Hybrid", "ai_model": "Llama3"}
    return {"role_name": cfg.role_name, "operating_mode": cfg.operating_mode, "ai_model": cfg.ai_model}
