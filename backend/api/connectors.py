from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any
from db.database import get_db
from db.models import IntegrationConnector, AuditLog
import datetime

router = APIRouter(prefix="/connectors", tags=["connectors"])

class ModeUpdate(BaseModel):
    mode: str # Integration, Native, Hybrid

class ConnectorToggle(BaseModel):
    name: str
    status: str # Connected, Disconnected
    tenant_id: str

# In-memory platform mode (fallback to DB settings in prod, here simple global)
CURRENT_PLATFORM_MODE = "Hybrid"

@router.get("/mode")
def get_platform_mode():
    global CURRENT_PLATFORM_MODE
    return {"mode": CURRENT_PLATFORM_MODE}

@router.post("/mode-update")
def update_platform_mode(data: ModeUpdate, db: Session = Depends(get_db)):
    global CURRENT_PLATFORM_MODE
    if data.mode not in ["Integration", "Native", "Hybrid"]:
        raise HTTPException(status_code=400, detail="Invalid platform mode")
    CURRENT_PLATFORM_MODE = data.mode
    
    log = AuditLog(
        user_email="admin@icdf.enterprise",
        action="Admin Change",
        details=f"Platform mode toggled to {data.mode}"
    )
    db.add(log)
    db.commit()
    return {"message": f"Platform mode updated to {data.mode}", "mode": CURRENT_PLATFORM_MODE}

@router.get("/list")
def get_connectors(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    connectors = db.query(IntegrationConnector).filter(IntegrationConnector.tenant_id == tenant_id).all()
    return [{"name": c.name, "status": c.status, "last_sync": c.last_sync.isoformat() if c.last_sync else None} for c in connectors]

@router.get("/health")
def get_connectors_health(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    connectors = db.query(IntegrationConnector).filter(IntegrationConnector.tenant_id == tenant_id).all()
    results = []
    for c in connectors:
        # Calculate pretty time ago
        last_sync_str = "Never"
        if c.last_sync:
            diff = datetime.datetime.utcnow() - c.last_sync
            mins = int(diff.total_seconds() / 60)
            if mins < 1:
                last_sync_str = "Just Now"
            elif mins < 60:
                last_sync_str = f"{mins}m ago"
            else:
                hours = int(mins / 60)
                if hours < 24:
                    last_sync_str = f"{hours}h ago"
                else:
                    last_sync_str = c.last_sync.strftime("%Y-%m-%d")
        
        results.append({
            "name": c.name,
            "status": c.status,
            "health_score": c.health_score,
            "last_sync": last_sync_str
        })
    return results

@router.post("/toggle")
def toggle_connector(data: ConnectorToggle, db: Session = Depends(get_db)):
    conn = db.query(IntegrationConnector).filter(
        IntegrationConnector.name == data.name,
        IntegrationConnector.tenant_id == data.tenant_id
    ).first()
    if not conn:
        conn = IntegrationConnector(
            name=data.name, 
            status=data.status, 
            last_sync=datetime.datetime.utcnow(),
            tenant_id=data.tenant_id
        )
        db.add(conn)
    else:
        conn.status = data.status
        conn.last_sync = datetime.datetime.utcnow()
    db.commit()
    
    log = AuditLog(
        user_email="admin@icdf.enterprise",
        action="Connector Action",
        details=f"Toggled connector '{data.name}' status to '{data.status}'",
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()
    return {"name": conn.name, "status": conn.status}

@router.get("/pipeline-telemetry")
def get_pipeline_telemetry(db: Session = Depends(get_db)):
    # Returns simulated telemetry events showing normalization of data
    return {
        "nodes": [
            {"id": "connectors", "label": "Connectors Ingestion Layer", "status": "active", "metrics": "Ingested 1.4k events/min"},
            {"id": "normalize", "label": "Normalization Engine", "status": "active", "metrics": "Schema validation: 100%"},
            {"id": "enrichment", "label": "Context Enrichment Store", "status": "active", "metrics": "Elastic RAM: 14.2GB"},
            {"id": "brain", "label": "Product Brain Router", "status": "active", "metrics": "Ollama LLM confidence score: 0.94"},
            {"id": "dashboards", "label": "Executive & Workspace Dashboards", "status": "active", "metrics": "UI Latency: 12ms"}
        ],
        "events": [
            {"source": "Slack", "target": "connectors", "event": "Threaded message #deployment", "timestamp": "Just Now"},
            {"source": "GitHub", "target": "connectors", "event": "PR #104 opened: security audit", "timestamp": "1s ago"},
            {"source": "Jira", "target": "connectors", "event": "Issue ICDF-48 transition to IN_PROGRESS", "timestamp": "3s ago"},
            {"source": "Otter.ai", "target": "connectors", "event": "Meeting transcript finalized: Standup", "timestamp": "5s ago"},
            {"source": "connectors", "target": "normalize", "event": "Normalized Jira ticket schema: JSON format", "timestamp": "Just Now"},
            {"source": "normalize", "target": "enrichment", "event": "Unified context index refreshed", "timestamp": "Just Now"},
            {"source": "enrichment", "target": "brain", "event": "Enriched dev context matching dev lead workspace", "timestamp": "Just Now"},
            {"source": "brain", "target": "dashboards", "event": "Refreshed sprint status: ROAD vehicle velocity calculated", "timestamp": "Just Now"}
        ]
    }
