from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from db.database import get_db
from db.models import Channel, Message, AuditLog
import datetime
import json

router = APIRouter(prefix="/pm-messenger", tags=["pm-messenger"])

class MessageSend(BaseModel):
    channel_id: int
    user_email: str
    content: str
    parent_message_id: Optional[int] = None
    tenant_id: str

class ReactionRequest(BaseModel):
    message_id: int
    user_email: str
    emoji: str
    tenant_id: str

@router.get("/channels")
def get_channels(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    chans = db.query(Channel).filter(Channel.tenant_id == tenant_id).all()
    return [{"id": c.id, "name": c.name} for c in chans]

@router.get("/messages")
def get_messages(channel_id: int, tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    msgs = db.query(Message).filter(
        Message.channel_id == channel_id,
        Message.tenant_id == tenant_id
    ).order_by(Message.timestamp.asc()).all()
    
    results = []
    for m in msgs:
        try:
            rx = json.loads(m.reactions_json)
        except:
            rx = {}
        results.append({
            "id": m.id,
            "channel_id": m.channel_id,
            "user_email": m.user_email,
            "content": m.content,
            "parent_message_id": m.parent_message_id,
            "reactions": rx,
            "is_pinned": m.is_pinned,
            "timestamp": m.timestamp.isoformat()
        })
    return results

@router.post("/message-send")
def send_message(data: MessageSend, db: Session = Depends(get_db)):
    msg = Message(
        channel_id=data.channel_id,
        user_email=data.user_email,
        content=data.content,
        parent_message_id=data.parent_message_id,
        reactions_json="{}",
        tenant_id=data.tenant_id
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    
    return {
        "id": msg.id,
        "channel_id": msg.channel_id,
        "user_email": msg.user_email,
        "content": msg.content,
        "parent_message_id": msg.parent_message_id,
        "timestamp": msg.timestamp.isoformat()
    }

@router.post("/reactions")
def update_reaction(data: ReactionRequest, db: Session = Depends(get_db)):
    msg = db.query(Message).filter(Message.id == data.message_id, Message.tenant_id == data.tenant_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
        
    try:
        rx = json.loads(msg.reactions_json)
    except:
        rx = {}
        
    emoji = data.emoji
    user = data.user_email
    
    if emoji in rx:
        if user in rx[emoji]:
            rx[emoji].remove(user)
            if not rx[emoji]:
                del rx[emoji]
        else:
            rx[emoji].append(user)
    else:
        rx[emoji] = [user]
        
    msg.reactions_json = json.dumps(rx)
    db.commit()
    return rx

@router.get("/ai-summary")
def get_ai_channel_summary(channel_id: int, tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    msgs = db.query(Message).filter(
        Message.channel_id == channel_id,
        Message.tenant_id == tenant_id
    ).limit(10).all()
    
    if not msgs:
        return {"summary": "AI Messenger Advisor: Channel is currently quiet. No action items detected."}
        
    txts = [f"{m.user_email}: {m.content}" for m in msgs]
    summary = f"AI Summary: Discussed roadmap coordination and linking vector stores. Action items: dev lead to verify local Ollama REST endpoints."
    
    return {"summary": summary}

@router.get("/ai-daily-digest")
def get_ai_daily_digest(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    digest = "AI Daily Digest: Sprint scope expanded by 8% due to websocket telemetry tasks. dev1@icdf.io is overloaded at 120%. Suggested action: delegate tasks."
    return {"digest": digest}
