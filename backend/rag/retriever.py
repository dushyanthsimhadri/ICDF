from sqlalchemy.orm import Session
from db.models import VectorDocument
from .vector_store import calculate_cosine_similarity
import json

def retrieve_context(query: str, db: Session, tenant_id: str = "acme_corp", limit: int = 3) -> list:
    docs = db.query(VectorDocument).filter(VectorDocument.tenant_id == tenant_id).all()
    if not docs:
        return []
        
    scored_docs = []
    for d in docs:
        score = calculate_cosine_similarity(query, d.text_content)
        if score > 0.05: # Minimum threshold
            scored_docs.append((score, d))
            
    # Sort by score descending
    scored_docs.sort(key=lambda x: x[0], reverse=True)
    
    results = []
    for score, d in scored_docs[:limit]:
        results.append({
            "text": d.text_content,
            "source": d.file_name,
            "type": d.source_type,
            "score": score
        })
        
    return results
