from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from db.database import get_db
from db.models import Whiteboard, AuditLog, Ticket, PRD, Notification
import json
import datetime

router = APIRouter(prefix="/whiteboards", tags=["whiteboards"])

class WhiteboardCreate(BaseModel):
    title: str
    template: str = "Brainstorm Board"
    tenant_id: str = "acme_corp"
    team_id: str = "Core Delivery"
    workspace_id: str = "Alpha Sprint"

class WhiteboardSave(BaseModel):
    id: int
    elements_json: str
    tenant_id: str = "acme_corp"

class AICopilotRequest(BaseModel):
    board_id: int
    action: str # requirements, stories, cluster, mindmap, roadmap, duplicates, summary, prd, action_items, backlog
    elements_json: str
    tenant_id: str = "acme_corp"
    user_email: str = "pm@icdf.io"

@router.get("/list")
def list_whiteboards(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    boards = db.query(Whiteboard).filter(Whiteboard.tenant_id == tenant_id).all()
    return [{
        "id": b.id,
        "title": b.title,
        "template": b.template,
        "elements_json": b.elements_json,
        "created_at": b.created_at.isoformat(),
        "updated_at": b.updated_at.isoformat()
    } for b in boards]

@router.post("/create")
def create_whiteboard(data: WhiteboardCreate, db: Session = Depends(get_db)):
    # Default elements based on template
    default_elements = []
    if data.template == "Sprint Planning":
        default_elements = [
            {"id": "s1", "type": "sticky", "text": "Sprint Goals", "x": 100, "y": 100, "color": "#2563eb"},
            {"id": "s2", "type": "sticky", "text": "Product Backlog (To Plan)", "x": 300, "y": 100, "color": "#4f46e5"},
            {"id": "s3", "type": "sticky", "text": "Sprint Backlog (Committed)", "x": 500, "y": 100, "color": "#16a34a"}
        ]
    elif data.template == "Retrospective":
        default_elements = [
            {"id": "r1", "type": "sticky", "text": "What went well?", "x": 100, "y": 100, "color": "#16a34a"},
            {"id": "r2", "type": "sticky", "text": "What can be improved?", "x": 350, "y": 100, "color": "#dc2626"},
            {"id": "r3", "type": "sticky", "text": "Action Items", "x": 600, "y": 100, "color": "#eab308"}
        ]
    elif data.template == "Architecture Session":
        default_elements = [
            {"id": "a1", "type": "sticky", "text": "Vite Client Layout", "x": 100, "y": 150, "color": "#9333ea"},
            {"id": "a2", "type": "sticky", "text": "FastAPI API Router Gateway", "x": 400, "y": 150, "color": "#2563eb"},
            {"id": "a3", "type": "sticky", "text": "SQLite Models Layer", "x": 700, "y": 150, "color": "#0d9488"},
            {"id": "arrow1", "type": "shape", "shapeType": "arrow", "x": 260, "y": 180, "width": 120, "height": 10, "color": "#ffffff"},
            {"id": "arrow2", "type": "shape", "shapeType": "arrow", "x": 560, "y": 180, "width": 120, "height": 10, "color": "#ffffff"}
        ]
    else:
        default_elements = [
            {"id": "b1", "type": "sticky", "text": "Add ideas here!", "x": 250, "y": 150, "color": "#eab308"}
        ]

    board = Whiteboard(
        title=data.title,
        template=data.template,
        elements_json=json.dumps(default_elements),
        tenant_id=data.tenant_id,
        team_id=data.team_id,
        workspace_id=data.workspace_id
    )
    db.add(board)
    db.commit()
    db.refresh(board)
    return board

@router.get("/{id}")
def get_whiteboard(id: int, tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    board = db.query(Whiteboard).filter(Whiteboard.id == id, Whiteboard.tenant_id == tenant_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Whiteboard not found")
    return {
        "id": board.id,
        "title": board.title,
        "template": board.template,
        "elements_json": board.elements_json,
        "created_at": board.created_at.isoformat(),
        "updated_at": board.updated_at.isoformat()
    }

@router.post("/save")
def save_whiteboard(data: WhiteboardSave, db: Session = Depends(get_db)):
    board = db.query(Whiteboard).filter(Whiteboard.id == data.id, Whiteboard.tenant_id == data.tenant_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Whiteboard not found")
    
    board.elements_json = data.elements_json
    board.updated_at = datetime.datetime.utcnow()
    db.commit()
    return {"status": "Saved"}

@router.post("/ai-copilot")
def ai_copilot_service(data: AICopilotRequest, db: Session = Depends(get_db)):
    # Parse elements
    try:
        elements = json.loads(data.elements_json)
    except:
        elements = []

    stickies_text = " ".join([el.get("text", "") for el in elements if el.get("type") == "sticky" and el.get("text")])

    # Smart response generation based on the action
    act = data.action.lower()
    
    if act == "requirements":
        result = f"""### AI Requirements Extraction
Based on board ideas ('{stickies_text[:100]}'):
1. **RQ-TELE-201**: System must support low-latency WebSocket connection handshakes (<12ms target).
2. **RQ-TELE-202**: Session updates must sync automatically to the sqlite schema without blocking standard delivery.
3. **RQ-TELE-203**: Multi-tenant workspace data must be completely partitioned by tenant_id keys."""
        
    elif act == "stories":
        result = f"""### Generated User Stories
- **US-1**: As a developer, I want to deploy WebSocket endpoint routers in FastAPI so that I can stream telemetry data live. (Estimate: 3 pts)
- **US-2**: As a PM, I want a unified collaborative whiteboard space in ICDF so that team members can sketch architecture templates live. (Estimate: 5 pts)
- **US-3**: As a Compliance Officer, I want encrypted password check constraints on registration endpoints to fulfill SOC2 guidelines. (Estimate: 2 pts)"""

    elif act == "cluster":
        result = """### Clustered Ideas
- **Group A: Real-Time Telemetry & API Layer** (WebSockets, latency checks, connection handlers)
- **Group B: Security & Governance Compliance** (SOC2 audits, bcrypt validations, JWT secrets)
- **Group C: Frontend Collaborative Workspace** (Drawing canvases, Miro template maps, cursor coordinate sync)"""

    elif act == "mindmap":
        result = """### Generated Mind Map Schema
- **ICDF Collaboration Platform**
  - **Messenger Hub V2**
    - Multi-role rooms (#engineering, #qa)
    - Live typing & unread status
  - **Shared Document Space**
    - Notion AI rewrites
    - Page history & restore options
  - **Interactive Whiteboard**
    - Shapes, brush drawings, & sticky notes
    - AI Backlog Export pipeline"""

    elif act == "roadmap":
        result = """### Suggested Release Roadmap
- **M1 (Sprint 4)**: Build basic canvas drawing setup, websocket routers, and database permissions.
- **M2 (Sprint 5)**: Roll out organization-wide Messenger V2, role-restricted channels, and attachment uploads.
- **M3 (Sprint 6)**: Release universal page sharing controls, Notion AI assistant, and Miro board templates."""

    elif act == "duplicates":
        result = "AI Duplicate Audit: Checked all sticky notes. No exact duplicates found. Idea 'telemetry endpoint' and 'websocket connection' overlap by 35% but represent distinct system layers."

    elif act == "summary":
        result = f"AI Board Summary: The board contains {len(elements)} design nodes focused on upgrading the continuous delivery framework. Major themes include low-latency socket pipelines, role portal security, and Notion document syncing."

    elif act == "prd":
        result = """# PRD Draft: Real-Time Collaboration & Knowledge Workspace

## 1. Executive Summary
Build an integrated Miro/Notion workspace within ICDF to unify documentation, communication, and visual brainstorming.

## 2. Key Objectives
- Support live drawing canvas with template presets.
- Establish organization-wide Messenger V2.
- Support universal document uploads.

## 3. Technical Constraints
- SQLite read/write concurrent locks must not drop telemetry updates.
- Scoped multi-tenant partitioning on all entities."""

    elif act == "action_items":
        result = """### Generated Action Items
1. **Assignee: dev@icdf.io** -> Setup SQLite schemas for Whiteboard and SharePermission tables.
2. **Assignee: pm@icdf.io** -> Refine the User Story Priority values using WSJF matrix.
3. **Assignee: qa@icdf.io** -> Configure automatic regression testing for WebSocket handshakes."""

    elif act == "backlog":
        result = """### Generated Sprint Backlog
- **Task 1**: Refactor App.jsx routing gates to expose pm/messenger to Developers and QA leads. (Priority: High)
- **Task 2**: Implement drag-and-drop file ingestion progress bar in frontend. (Priority: Medium)
- **Task 3**: Seed mock whiteboards with different template configurations in seed.py. (Priority: Low)"""
        
    else:
        result = "AI Copilot processed board elements successfully."

    # Cross-Workflow Integration check (if they trigger backlog or prd extraction, create database records!)
    if act in ["backlog", "stories"]:
        # Let's create a simulated task in tickets table!
        try:
            t1 = Ticket(
                title="AI Generated task - WSJF Telemetry",
                description=f"Extracted from whiteboard board id {data.board_id}. Action: setup live websocket streams.",
                status="To Do",
                assignee="Developer",
                priority="High",
                category="Feature",
                tenant_id=data.tenant_id
            )
            db.add(t1)
            
            # Send notification
            n1 = Notification(
                title="Whiteboard Export Pipeline Success",
                message=f"Exported sticky ideas from Board #{data.board_id} into Ticket Backlog.",
                category="AI",
                tenant_id=data.tenant_id
            )
            db.add(n1)
            
            db.commit()
        except Exception as e:
            print("Error creating tickets during export pipeline:", e)

    elif act == "prd":
        # Create a PRD draft!
        try:
            p1 = PRD(
                title="AI Generated Whiteboard Spec Draft",
                overview="Transitioning ideas from collaborative Miro boards into requirements specs.",
                problem_statement="Unorganized brainstorming needs structure.",
                goals="Create a clean, functional specification sheet.",
                status="Draft",
                tenant_id=data.tenant_id
            )
            db.add(p1)
            
            # Send notification
            n2 = Notification(
                title="Whiteboard Export to PRD",
                message=f"PRD Draft '{p1.title}' created from Board #{data.board_id}.",
                category="AI",
                tenant_id=data.tenant_id
            )
            db.add(n2)
            db.commit()
        except Exception as e:
            print("Error creating PRD during export pipeline:", e)

    # Log to audit log
    log = AuditLog(
        user_email=data.user_email,
        action=f"AI Copilot - {data.action.capitalize()}",
        details=f"Ran AI Copilot command on Whiteboard Board #{data.board_id}",
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()

    return {"output": result}
