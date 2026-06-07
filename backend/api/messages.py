from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from db.database import get_db
from db.models import Channel, Message, MessageThread, User
import datetime
import json

router = APIRouter(prefix="/messages", tags=["messages"])

class MessageSend(BaseModel):
    channel_id: Optional[int] = None
    recipient_email: Optional[str] = None # For DMs
    user_email: str
    content: str
    parent_message_id: Optional[int] = None
    tenant_id: str = "acme_corp"

@router.post("/send")
def send_message(data: MessageSend, db: Session = Depends(get_db)):
    target_channel_id = data.channel_id
    
    # If recipient_email is provided, it's a DM!
    if data.recipient_email:
        # Find or create a DM channel
        u1 = data.user_email
        u2 = data.recipient_email
        dm_channel_name = f"dm:{min(u1, u2)}:{max(u1, u2)}"
        
        chan = db.query(Channel).filter(
            Channel.name == dm_channel_name,
            Channel.tenant_id == data.tenant_id
        ).first()
        
        if not chan:
            chan = Channel(
                name=dm_channel_name,
                tenant_id=data.tenant_id,
                team_id="DMs",
                workspace_id="DMs"
            )
            db.add(chan)
            db.commit()
            db.refresh(chan)
            
        target_channel_id = chan.id
        
    if not target_channel_id:
        raise HTTPException(status_code=400, detail="Either channel_id or recipient_email must be provided")

    msg = Message(
        channel_id=target_channel_id,
        user_email=data.user_email,
        content=data.content,
        parent_message_id=data.parent_message_id,
        reactions_json="{}",
        tenant_id=data.tenant_id
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    # Save to message_threads table if thread reply
    if data.parent_message_id:
        thread = MessageThread(
            parent_message_id=data.parent_message_id,
            reply_message_id=msg.id,
            tenant_id=data.tenant_id
        )
        db.add(thread)
        db.commit()

    return {
        "id": msg.id,
        "channel_id": msg.channel_id,
        "user_email": msg.user_email,
        "content": msg.content,
        "parent_message_id": msg.parent_message_id,
        "timestamp": msg.timestamp.isoformat()
    }

@router.get("/channel/{id}")
def get_channel_messages(id: int, tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    msgs = db.query(Message).filter(
        Message.channel_id == id,
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

@router.get("/direct/{id_or_email}")
def get_direct_messages(id_or_email: str, current_user_email: str, tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    other_email = id_or_email
    if "@" not in id_or_email:
        try:
            user_id = int(id_or_email)
            u = db.query(User).filter(User.id == user_id).first()
            if u:
                other_email = u.email
        except ValueError:
            pass

    u1 = current_user_email
    u2 = other_email
    dm_channel_name = f"dm:{min(u1, u2)}:{max(u1, u2)}"
    
    chan = db.query(Channel).filter(
        Channel.name == dm_channel_name,
        Channel.tenant_id == tenant_id
    ).first()
    
    if not chan:
        return []
        
    msgs = db.query(Message).filter(
        Message.channel_id == chan.id,
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
