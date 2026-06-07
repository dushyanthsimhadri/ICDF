from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from db.database import get_db
from db.models import Document, DocumentVersion, AuditLog, Attachment
import datetime
import os
import shutil

router = APIRouter(prefix="/pm-documents", tags=["pm-documents"])

class DocumentCreate(BaseModel):
    title: str
    content: str
    folder: str = "Strategy Docs"
    tenant_id: str

class DocumentEdit(BaseModel):
    id: int
    content: str
    user_email: str
    tenant_id: str

class AIRewriteRequest(BaseModel):
    text: str
    action_type: str # summarize, rewrite, expand, explain, improve, strategy

@router.get("/list")
def get_documents(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.tenant_id == tenant_id).all()
    return [{
        "id": d.id,
        "title": d.title,
        "content": d.content,
        "folder": d.folder,
        "is_pinned": d.is_pinned
    } for d in docs]

@router.post("/create")
def create_document(data: DocumentCreate, db: Session = Depends(get_db)):
    doc = Document(
        title=data.title,
        content=data.content,
        folder=data.folder,
        tenant_id=data.tenant_id
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # Save first version
    ver = DocumentVersion(
        document_id=doc.id,
        version_num=1,
        content=doc.content,
        updated_by="pm@icdf.io"
    )
    db.add(ver)
    db.commit()
    return doc

@router.post("/edit")
def edit_document(data: DocumentEdit, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == data.id, Document.tenant_id == data.tenant_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    doc.content = data.content
    
    # Find next version number
    latest_ver = db.query(DocumentVersion).filter(DocumentVersion.document_id == doc.id).order_by(DocumentVersion.version_num.desc()).first()
    next_ver_num = (latest_ver.version_num + 1) if latest_ver else 1
    
    ver = DocumentVersion(
        document_id=doc.id,
        version_num=next_ver_num,
        content=data.content,
        updated_by=data.user_email
    )
    db.add(ver)
    db.commit()
    db.refresh(doc)
    
    return doc

@router.post("/ai-rewrite")
def ai_rewrite(data: AIRewriteRequest):
    t = data.text
    act = data.action_type
    
    if act == "summarize":
        result = f"Summary: {t[:60]}... Focuses on WebSocket performance target metrics."
    elif act == "rewrite":
        result = f"Rephrased: {t} We aim to transition ingestion protocols to live socket events to reduce CPU workload."
    elif act == "expand":
        result = f"Expanded: {t} This transition will reduce REST endpoint load, prevent connection spikes, and decrease database reads by 40%."
    elif act == "explain":
        result = f"Explanation: Explaining '{t}' - Websockets create a persistent connection channel between Vite and FastAPI backend, reducing handshakes."
    elif act == "improve":
        result = f"Improved: We are optimizing telemetry speeds to guarantee sub-12ms event latencies."
    elif act == "strategy":
        result = "AI Strategic Recommendation: Launch WebSocket endpoints in v2.5.0 release train. Shift 20% frontend bandwidth to backend setup."
    else:
        result = t
        
    return {"text": result}

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    tenant_id: str = Form("acme_corp"),
    organization_id: str = Form("acme_corp"),
    workspace_id: str = Form("Alpha Sprint"),
    uploader_id: str = Form("pm@icdf.io"),
    folder: str = Form("Strategy Docs"),
    tags: Optional[str] = Form("[]"),
    permissions: Optional[str] = Form("[]"),
    db: Session = Depends(get_db)
):
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    content = ""
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext in [".txt", ".md", ".json", ".csv"]:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
        except:
            content = f"[Unreadable text file: {file.filename}]"
    else:
        content = f"[File Attachment: {file.filename} stored at {file_path}]"

    doc = Document(
        title=file.filename,
        content=content,
        folder=folder,
        tenant_id=tenant_id,
        team_id=organization_id,
        workspace_id=workspace_id,
        uploader_id=uploader_id,
        storage_path=file_path,
        file_type=file_ext.replace(".", "").upper() or "BINARY",
        created_at=datetime.datetime.utcnow(),
        file_size_bytes=os.path.getsize(file_path),
        tags_json=tags,
        permissions_json=permissions
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    ver = DocumentVersion(
        document_id=doc.id,
        version_num=1,
        content=content,
        updated_by=uploader_id,
        updated_at=datetime.datetime.utcnow()
    )
    db.add(ver)
    
    att = Attachment(
        name=file.filename,
        file_type=file_ext.replace(".", "").upper(),
        file_size_bytes=os.path.getsize(file_path),
        url=f"/uploads/{file.filename}",
        document_id=doc.id,
        tenant_id=tenant_id
    )
    db.add(att)
    
    db.commit()
    
    log = AuditLog(
        user_email=uploader_id,
        action="Upload Document",
        details=f"Uploaded {file.filename} to folder {folder}",
        tenant_id=tenant_id
    )
    db.add(log)
    db.commit()
    
    return {
        "id": doc.id,
        "title": doc.title,
        "content": doc.content,
        "folder": doc.folder,
        "uploader_id": doc.uploader_id,
        "storage_path": doc.storage_path,
        "file_type": doc.file_type,
        "created_at": doc.created_at.isoformat(),
        "file_size_bytes": doc.file_size_bytes
      }

@router.get("/versions/{doc_id}")
def get_document_versions(doc_id: int, tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    vers = db.query(DocumentVersion).filter(DocumentVersion.document_id == doc_id).order_by(DocumentVersion.version_num.desc()).all()
    return [{
        "id": v.id,
        "version_num": v.version_num,
        "content": v.content,
        "updated_by": v.updated_by,
        "updated_at": v.updated_at.isoformat()
    } for v in vers]

class RestoreRequest(BaseModel):
    doc_id: int
    version_num: int
    tenant_id: str = "acme_corp"

@router.post("/restore-version")
def restore_version(data: RestoreRequest, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == data.doc_id, Document.tenant_id == data.tenant_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    ver = db.query(DocumentVersion).filter(DocumentVersion.document_id == data.doc_id, DocumentVersion.version_num == data.version_num).first()
    if not ver:
        raise HTTPException(status_code=404, detail="Version not found")
    
    doc.content = ver.content
    db.commit()
    return {
        "id": doc.id,
        "title": doc.title,
        "content": doc.content,
        "folder": doc.folder
    }

