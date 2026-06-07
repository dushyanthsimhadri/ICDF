from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Ticket, MeetingTranscript, VectorDocument, PortfolioInitiative, ReleaseTrain, WorkflowAction
from typing import List

router = APIRouter(prefix="/search", tags=["search"])

@router.get("/global")
def global_search(query: str = "", tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    if not query.strip():
        return []
        
    search_results = []
    q_lower = query.lower()

    # 1. Search Tickets
    tickets = db.query(Ticket).filter(
        Ticket.tenant_id == tenant_id,
        (Ticket.title.contains(query)) | (Ticket.assignee.contains(query))
    ).limit(5).all()
    for t in tickets:
        search_results.append({
            "type": "Task / Ticket",
            "title": f"#{t.id}: {t.title}",
            "details": f"Assignee: {t.assignee} | Status: {t.status}",
            "view": "workflows"
        })

    # 2. Search Meetings
    meetings = db.query(MeetingTranscript).filter(
        MeetingTranscript.title.contains(query) | MeetingTranscript.transcript_text.contains(query)
    ).limit(5).all()
    for m in meetings:
        search_results.append({
            "type": "Meeting Intelligence",
            "title": m.title,
            "details": m.summary or "Otter.ai transcript alignment notes",
            "view": "meetings"
        })

    # 3. Search Vector Documents (RAG)
    docs = db.query(VectorDocument).filter(
        VectorDocument.tenant_id == tenant_id,
        VectorDocument.file_name.contains(query) | VectorDocument.text_content.contains(query)
    ).limit(5).all()
    for d in docs:
        search_results.append({
            "type": "Knowledge Hub",
            "title": d.file_name,
            "details": d.text_content[:80] + "...",
            "view": "knowledge"
        })

    # 4. Search Portfolio Initiatives
    ports = db.query(PortfolioInitiative).filter(
        PortfolioInitiative.tenant_id == tenant_id,
        PortfolioInitiative.name.contains(query) | PortfolioInitiative.strategic_goal.contains(query)
    ).limit(5).all()
    for p in ports:
        search_results.append({
            "type": "Portfolio Initiative",
            "title": p.name,
            "details": f"Goal: {p.strategic_goal} | Confidence: {p.delivery_confidence}%",
            "view": "portfolio"
        })

    # 5. Search Release Trains
    releases = db.query(ReleaseTrain).filter(
        ReleaseTrain.tenant_id == tenant_id,
        ReleaseTrain.name.contains(query) | ReleaseTrain.environment.contains(query)
    ).limit(5).all()
    for r in releases:
        search_results.append({
            "type": "Release Train",
            "title": r.name,
            "details": f"Environment: {r.environment} | Status: {r.status}",
            "view": "releases"
        })

    # 6. Search Approvals
    approvals = db.query(WorkflowAction).filter(
        WorkflowAction.tenant_id == tenant_id,
        WorkflowAction.action_type.contains(query)
    ).limit(5).all()
    for a in approvals:
        search_results.append({
            "type": "Approval Workbench",
            "title": f"Approval #{a.id}: {a.action_type}",
            "details": f"Status: {a.status} | Escalation: {a.escalation_status}",
            "view": "approvals"
        })

    return search_results[:20] # Cap total global search items at 20
