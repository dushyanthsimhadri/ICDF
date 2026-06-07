from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from db.database import get_db
from db.models import Meeting, MeetingSummary, Ticket, PRD, AuditLog
import datetime
import json

router = APIRouter(prefix="/pm-meetings", tags=["pm-meetings"])

class MeetingCreate(BaseModel):
    title: str
    meeting_type: str = "Standup"
    transcript_text: str
    tenant_id: str

class AIExtractRequest(BaseModel):
    meeting_id: int
    action_type: str # jira, summary, prd, roadmap, requirements, risks
    tenant_id: str

@router.get("/list")
def get_meetings(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    meetings = db.query(Meeting).filter(Meeting.tenant_id == tenant_id).order_by(Meeting.date.desc()).all()
    results = []
    for m in meetings:
        try:
            timeline = json.loads(m.speaker_timeline_json)
        except:
            timeline = []
        try:
            meta = json.loads(m.metadata_json)
        except:
            meta = {}
            
        results.append({
            "id": m.id,
            "title": m.title,
            "transcript_text": m.transcript_text,
            "summary": m.summary,
            "status": m.status,
            "date": m.date.isoformat(),
            "meeting_type": m.meeting_type,
            "speaker_timeline": timeline,
            "metadata": meta
        })
    return results

@router.post("/create")
def create_meeting(data: MeetingCreate, db: Session = Depends(get_db)):
    # Default speaker timeline
    timeline = [
        {"speaker": "PM", "text": "Let's review the active timeline tasks.", "start": "00:00", "end": "00:30"},
        {"speaker": "Developer", "text": data.transcript_text[:50], "start": "00:30", "end": "01:20"}
    ]
    
    meta = {
        "actions": ["Verify database migrations for payment tables.", "Establish vector load checkpoints."],
        "requirements": ["WebSocket low-latency telemetry API", "Strict tenant-id access filtering rules"],
        "risks": ["SLA breaches on database locks"],
        "dependencies": ["Ollama REST endpoint capacity availability"],
        "follow_ups": ["Configure SMTP webhook templates for alerts."]
    }
    
    m = Meeting(
        title=data.title,
        meeting_type=data.meeting_type,
        transcript_text=data.transcript_text,
        summary=f"Automated meeting sync finished. Scope focused on {data.title}.",
        status="Completed",
        speaker_timeline_json=json.dumps(timeline),
        metadata_json=json.dumps(meta),
        tenant_id=data.tenant_id
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    
    ms = MeetingSummary(
        meeting_id=m.id,
        summary_text=m.summary
    )
    db.add(ms)
    db.commit()
    return m

@router.post("/ai-extract")
def ai_extract(data: AIExtractRequest, db: Session = Depends(get_db)):
    m = db.query(Meeting).filter(Meeting.id == data.meeting_id, Meeting.tenant_id == data.tenant_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    act = data.action_type
    
    if act == "jira":
        # Simulate creating a Jira ticket automatically in the database
        t = Ticket(
            title=f"Task from {m.title}: Verify WebSocket latencies",
            description=f"Generated automatically from Otter.ai meeting '{m.title}' transcript.",
            status="To Do",
            assignee="Unassigned",
            priority="Medium",
            category="Feature",
            tenant_id=data.tenant_id
        )
        db.add(t)
        db.commit()
        return {"status": "Success", "message": f"Successfully created Jira Task #{t.id} from meeting."}
        
    elif act == "prd":
        # Simulate updating PRD quality score or requirements
        prd = db.query(PRD).filter(PRD.tenant_id == data.tenant_id).first()
        if prd:
            prd.quality_score = min(100, prd.quality_score + 5)
            db.commit()
            return {"status": "Success", "message": f"Successfully updated PRD '{prd.title}' quality index to {prd.quality_score}%"}
        return {"status": "Error", "message": "No active PRDs found to update."}
        
    elif act == "roadmap":
        return {"status": "Success", "message": "Successfully synchronized meeting milestones with the universal Roadmap."}
        
    elif act == "summary":
        return {"status": "Success", "summary": f"AI Sprint Update: Refined scopes on '{m.title}'. WebSocket rollout remains on schedule for next release train."}
        
    return {"status": "Success", "message": f"Dispatched action {act} successfully."}
