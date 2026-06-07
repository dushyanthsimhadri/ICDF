from sqlalchemy.orm import Session
from db.models import VectorDocument
import json

def chunk_text(text: str, chunk_size: int = 200, overlap: int = 50) -> list:
    words = text.split()
    chunks = []
    
    # Sliding window chunking
    i = 0
    while i < len(words):
        chunk_words = words[i:i + chunk_size]
        chunks.append(" ".join(chunk_words))
        i += chunk_size - overlap
        if len(words) - i < overlap:
            break
            
    return chunks

def ingest_document(file_name: str, source_type: str, content: str, db: Session, tenant_id: str = "acme_corp", metadata: dict = None) -> int:
    chunks = chunk_text(content)
    meta_str = json.dumps(metadata or {})
    
    for idx, chunk in enumerate(chunks):
        # Build simulated token list as mock embedding
        mock_embedding = [0.1 * (idx + 1)] * 5
        
        doc = VectorDocument(
            file_name=file_name,
            source_type=source_type,
            text_content=chunk,
            vector_embeddings_json=json.dumps(mock_embedding),
            metadata_json=meta_str,
            tenant_id=tenant_id
        )
        db.add(doc)
    
    db.commit()
    return len(chunks)
