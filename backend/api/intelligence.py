from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from db.database import get_db
from db.models import MeetingTranscript, AuditLog, VectorDocument, Ticket, IntegrationConnector
from rag.document_ingestion import ingest_document
from rag.retriever import retrieve_context
import datetime
import json

router = APIRouter(prefix="/intelligence", tags=["intelligence"])

class MeetingCreate(BaseModel):
    title: str
    transcript_text: str
    tenant_id: str = "acme_corp"

class KnowledgeUpload(BaseModel):
    title: str
    content: str
    source_type: str = "Docs"
    tenant_id: str = "acme_corp"

@router.get("/metrics")
def get_executive_metrics(tenant_id: str = "acme_corp"):
    # Return different metrics based on tenant to showcase dynamic dashboards
    if tenant_id == "globex_corp":
        return {
            "delivery_health": 85.4,
            "velocity_score": 79.2,
            "release_confidence": 76.0,
            "risk_score": 38.2,
            "program_health": 82.5,
            "kpi_impact": 12.1,
            "weekly_velocity": [50, 58, 62, 70, 75, 79.2],
            "weekly_risk": [55, 48, 44, 42, 40, 38.2],
            "weekly_health": [80, 81, 83, 84, 85, 85.4],
            "weekly_confidence": [65, 68, 70, 72, 74, 76.0]
        }
    elif tenant_id == "initech":
        return {
            "delivery_health": 91.2,
            "velocity_score": 83.0,
            "release_confidence": 88.0,
            "risk_score": 10.4,
            "program_health": 89.8,
            "kpi_impact": 15.5,
            "weekly_velocity": [60, 68, 72, 78, 80, 83.0],
            "weekly_risk": [20, 18, 16, 14, 12, 10.4],
            "weekly_health": [86, 88, 89, 90, 91, 91.2],
            "weekly_confidence": [80, 82, 84, 85, 87, 88.0]
        }
    else: # acme_corp or default
        return {
            "delivery_health": 94.2,
            "velocity_score": 88.5,
            "release_confidence": 91.0,
            "risk_score": 14.5,
            "program_health": 95.8,
            "kpi_impact": 18.3,
            "weekly_velocity": [65, 72, 70, 81, 84, 88.5],
            "weekly_risk": [28, 24, 20, 18, 16, 14.5],
            "weekly_health": [90, 91, 93, 94, 94, 94.2],
            "weekly_confidence": [82, 85, 87, 89, 90, 91.0]
        }

@router.get("/meetings")
def get_meetings(db: Session = Depends(get_db)):
    meetings = db.query(MeetingTranscript).all()
    if not meetings:
        # Seed default meetings
        defaults = [
            MeetingTranscript(
                title="ICDF Core Architecture Alignment",
                transcript_text="PM: We need to transition from standard polling in the telemetry module to dynamic streaming via websockets. Architect: Yes, that will reduce system overhead by 40%. Dev Lead: I can start implementing this tomorrow. QA Lead: Make sure we write integration tests to capture memory leakage under high load.",
                summary="Discussed telemetry migration to websockets. Agreed on timeline and testing requirements.",
                requirements="Requirement 1: Implement WebSockets for real-time telemetry data. Requirement 2: Memory leak automated unit tests.",
                action_items="Action Item 1: Dev Lead to draft telemetry architecture by Tuesday. Action Item 2: QA Lead to configure memory profiling tool.",
                date=datetime.datetime.utcnow() - datetime.timedelta(days=1)
            )
        ]
        for m in defaults:
            db.add(m)
        db.commit()
        meetings = db.query(MeetingTranscript).all()
        
    return [{
        "id": m.id,
        "title": m.title,
        "transcript_text": m.transcript_text,
        "summary": m.summary,
        "requirements": m.requirements,
        "action_items": m.action_items,
        "date": m.date.isoformat()
    } for m in meetings]

@router.post("/meeting-create")
def create_meeting(data: MeetingCreate, db: Session = Depends(get_db)):
    summary = f"Summary of: {data.title}. Automated extraction finished."
    reqs = f"Requirement: Extracted from transcript '{data.transcript_text[:50]}...'"
    actions = f"Action Item: Assigned to Dev Lead to review '{data.title}' details."
    
    m = MeetingTranscript(
        title=data.title,
        transcript_text=data.transcript_text,
        summary=summary,
        requirements=reqs,
        action_items=actions
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    
    log = AuditLog(
        user_email="meeting_intel@icdf.enterprise",
        action="Extract Meeting Intelligence",
        details=f"Processed meeting '{data.title}' and populated transcript metrics.",
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()
    return m

@router.get("/engines")
def get_engine_states():
    return {
        "Unified Context Engine": {"status": "ACTIVE", "desc": "Aggregates events from multi-source connectors into JSON logs.", "load": "12%"},
        "Meeting Intelligence Engine": {"status": "ACTIVE", "desc": "Uses NLP to extract action items, requirements, and summaries.", "load": "4%"},
        "Continuous Delivery Engine": {"status": "ACTIVE", "desc": "Monitors deployment workflows, automating rollbacks.", "load": "18%"},
        "Velocity Intelligence Engine": {"status": "ACTIVE", "desc": "Calculates lead times and predicts future completion.", "load": "7%"},
        "Program Intelligence Engine": {"status": "ACTIVE", "desc": "Cross-references multi-project backlog blocks.", "load": "9%"},
        "Product Intelligence Layer": {"status": "ACTIVE", "desc": "Guides PMs in roadmap creation, refining PRDs.", "load": "15%"},
        "Governance Engine": {"status": "ACTIVE", "desc": "Enforces SOC2, GDPR, and AI compliance policies.", "load": "3%"},
        "Workflow Automation Engine": {"status": "ACTIVE", "desc": "Triggers automated Slack notifications, PR integrations.", "load": "22%"},
        "Knowledge + Memory Layer": {"status": "ACTIVE", "desc": "Provides persistent embeddings vector storage.", "load": "6%"}
    }

# RAG Knowledge Hub endpoints
@router.get("/knowledge")
def get_knowledge_documents(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    docs = db.query(VectorDocument).filter(VectorDocument.tenant_id == tenant_id).all()
    # Group chunks by file name
    grouped = {}
    for d in docs:
        if d.file_name not in grouped:
            # Parse metadata
            try:
                meta = json.loads(d.metadata_json)
            except:
                meta = {}
            grouped[d.file_name] = {
                "id": f"doc-{d.id}",
                "title": d.file_name,
                "category": d.source_type,
                "content": d.text_content,
                "author": "AI Context Ingestor" if meta.get("seeded") else "Product Manager",
                "updated": "Seeded" if meta.get("seeded") else "Just Now"
            }
        else:
            # Concatenate chunk texts for full display
            grouped[d.file_name]["content"] += "\n\n" + d.text_content
            
    return list(grouped.values())

@router.post("/knowledge/upload")
def upload_knowledge_document(data: KnowledgeUpload, db: Session = Depends(get_db)):
    chunks_count = ingest_document(
        file_name=data.title,
        source_type=data.source_type,
        content=data.content,
        db=db,
        tenant_id=data.tenant_id,
        metadata={"uploaded_by": "Enterprise Admin"}
    )
    
    log = AuditLog(
        user_email="admin@icdf.enterprise",
        action="Admin Change",
        details=f"Uploaded and vector-indexed document '{data.title}' into {chunks_count} chunks.",
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()
    
    return {"status": "Success", "chunks_indexed": chunks_count}

@router.get("/knowledge/search")
def search_knowledge(query: str, tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    results = retrieve_context(query=query, db=db, tenant_id=tenant_id, limit=5)
    return results

@router.get("/usage-stats")
def get_usage_statistics(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    # Query database counts to build dynamic usage indicators
    tickets_count = db.query(Ticket).filter(Ticket.tenant_id == tenant_id).count()
    connectors_count = db.query(IntegrationConnector).filter(IntegrationConnector.tenant_id == tenant_id, IntegrationConnector.status == "Connected").count()
    audit_count = db.query(AuditLog).filter(AuditLog.tenant_id == tenant_id).count()
    
    # Calculate some simulated metrics mapped to count ratios for realistic wow factors
    if tenant_id == "globex_corp":
        tokens = "92.4K Tokens"
        calls = f"{300 + audit_count * 2} Calls"
        events = f"{120 + connectors_count * 8} Events"
        actions = "18 Executions"
        model_shares = [
            {"name": "Qwen2.5-Coder (14B)", "percentage": 55, "color": "bg-purple-500"},
            {"name": "Llama3 (8B)", "percentage": 30, "color": "bg-blue-500"},
            {"name": "Mistral (7B)", "percentage": 10, "color": "bg-teal-500"},
            {"name": "DeepSeek (8B)", "percentage": 5, "color": "bg-rose-500"}
        ]
        weekly_timeline = [
            {"day": "Mon", "load": 40, "val": "80K"},
            {"day": "Tue", "load": 55, "val": "110K"},
            {"day": "Wed", "load": 60, "val": "120K"},
            {"day": "Thu", "load": 75, "val": "150K"},
            {"day": "Fri", "load": 65, "val": "130K"},
            {"day": "Sat", "load": 20, "val": "40K"},
            {"day": "Sun", "load": 15, "val": "30K"}
        ]
    elif tenant_id == "initech":
        tokens = "42.1K Tokens"
        calls = f"{150 + audit_count} Calls"
        events = f"{50 + connectors_count * 5} Events"
        actions = "8 Executions"
        model_shares = [
            {"name": "Mistral (7B)", "percentage": 50, "color": "bg-teal-500"},
            {"name": "Llama3 (8B)", "percentage": 30, "color": "bg-blue-500"},
            {"name": "Qwen2.5-Coder (14B)", "percentage": 15, "color": "bg-purple-500"},
            {"name": "DeepSeek (8B)", "percentage": 5, "color": "bg-rose-500"}
        ]
        weekly_timeline = [
            {"day": "Mon", "load": 20, "val": "40K"},
            {"day": "Tue", "load": 35, "val": "70K"},
            {"day": "Wed", "load": 30, "val": "60K"},
            {"day": "Thu", "load": 45, "val": "90K"},
            {"day": "Fri", "load": 40, "val": "80K"},
            {"day": "Sat", "load": 10, "val": "20K"},
            {"day": "Sun", "load": 5, "val": "10K"}
        ]
    else: # acme_corp
        tokens = "148.5K Tokens"
        calls = f"{800 + audit_count * 4} Calls"
        events = f"{320 + connectors_count * 10} Events"
        actions = f"{30 + tickets_count} Executions"
        model_shares = [
            {"name": "Llama3 (8B)", "percentage": 45, "color": "bg-blue-500"},
            {"name": "Qwen2.5-Coder (14B)", "percentage": 35, "color": "bg-purple-500"},
            {"name": "Mistral (7B)", "percentage": 15, "color": "bg-teal-500"},
            {"name": "DeepSeek (8B)", "percentage": 5, "color": "bg-rose-500"}
        ]
        weekly_timeline = [
            {"day": "Mon", "load": 60, "val": "120K"},
            {"day": "Tue", "load": 85, "val": "170K"},
            {"day": "Wed", "load": 75, "val": "150K"},
            {"day": "Thu", "load": 95, "val": "190K"},
            {"day": "Fri", "load": 88, "val": "176K"},
            {"day": "Sat", "load": 30, "val": "60K"},
            {"day": "Sun", "load": 20, "val": "40K"}
        ]
        
    return {
        "tokensConsumed": tokens,
        "apiRequests": calls,
        "connectorsSyncCount": events,
        "workflowActionsCount": actions,
        "modelShares": model_shares,
        "weeklyTimeline": weekly_timeline,
        "kpis": {
            "ticketsCount": tickets_count,
            "connectorsCount": connectors_count,
            "auditCount": audit_count
        }
    }
