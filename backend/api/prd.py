from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.ollama_service import OllamaService
from typing import Optional

router = APIRouter()

class PRDRequest(BaseModel):
    notes: str
    model: str = "qwen"

# Dependency to get Ollama service
def get_ollama_service():
    return OllamaService()

@router.post("/prd")
async def generate_prd(request: PRDRequest, service: OllamaService = Depends(get_ollama_service)):
    if not request.notes.strip():
        raise HTTPException(status_code=400, detail="Notes content cannot be empty")
        
    prompt = f"""You are an expert Senior Product Manager.
Generate a comprehensive, portfolio-grade Product Requirement Document (PRD) from the following raw notes, ideas, or feedback.

Raw Notes:
{request.notes}

Ensure the PRD includes the following sections, formatted in beautiful, readable Markdown:
1. Problem Statement (Explain the core user pain point)
2. Product Vision & Goals (The long-term vision and near-term goals)
3. User Personas (At least 2 distinct personas with details)
4. Functional Requirements (Numbered list of core features)
5. Non-Functional Requirements (Performance, scale, security)
6. Success Metrics (Target KPIs, conversions, adoption metrics)
7. Risks & Mitigation (Potential bottlenecks or obstacles and how to resolve them)
8. Dependencies (Technical or organizational requirements)

Be extremely detailed, logical, and professional. Write direct, production-ready markdown without prefixing or post-conversational chatter.
"""

    messages = [
        {"role": "system", "content": "You are a professional Product Management AI system that outputs only high-quality markdown documents."},
        {"role": "user", "content": prompt}
    ]
    
    result = await service.chat_completion(
        model=request.model,
        messages=messages,
        fallback_type="prd",
        payload={"notes": request.notes}
    )
    
    return result
