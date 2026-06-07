from sqlalchemy.orm import Session
from .document_ingestion import ingest_document
from .retriever import retrieve_context
from db.models import VectorDocument

def populate_sample_knowledge(db: Session):
    # Check if database is already populated
    count = db.query(VectorDocument).count()
    if count > 0:
        return
        
    # Seed knowledge layers
    samples = [
        ("PRD_websocket_specs.txt", "PRD", "Vite React client needs websocket handlers. Auto reconnect on 404. Latency target under 12ms. Relies on FastAPI routers in core backend api gateway."),
        ("Notion_SOC2_plan.md", "Docs", "All password columns must employ bcrypt. Passwords should never be stored in plain text. JWT secret token must be loaded from environment settings."),
        ("Slack_standup_logs.txt", "Slack", "PM: Discussed moving roadmap. Dev Lead says we need to configure local Ollama DeepSeek engine before finishing socket telemetry."),
        ("Jira_ticket_ICDF-48.txt", "Jira", "ICDF-48 ticket tracking oauth setup. Human approval loops required before merging code into staging pipelines.")
    ]
    
    for title, src, text in samples:
        ingest_document(
            file_name=title,
            source_type=src,
            content=text,
            db=db,
            metadata={"priority": "High", "seeded": True}
        )
