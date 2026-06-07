from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.ollama_service import OllamaService
import json
import logging
from typing import List, Dict, Any

logger = logging.getLogger("uvicorn.error")
router = APIRouter()

class CollabRequest(BaseModel):
    prd: str
    model: str = "qwen"

# Dependency
def get_ollama_service():
    return OllamaService()

def clean_json_string(text: str) -> str:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

@router.post("/collaboration")
async def run_collaboration(request: CollabRequest, service: OllamaService = Depends(get_ollama_service)):
    if not request.prd.strip():
        raise HTTPException(status_code=400, detail="PRD content cannot be empty")
        
    prompt = f"""You are a Multi-Agent Systems Designer and Senior Agile Coach.
Simulate a cross-functional alignment debate and MVP building workshop based on this Product Requirement Document (PRD):

{request.prd}

Your task is to orchestrate dialogue from these 8 participants:
1. Business User: e.g. Emma (Marketing) - Pushes for business timelines, marketing campaigns, launch.
2. Real User: e.g. Thomas (Patient User) - Focuses on ease of use, security hurdles, friction, speed.
3. Product Owner (PO): Marcus (PO) - Balances priorities, business value, scope.
4. Business Analyst (BA): Nadia (BA) - Analyzes market fit, operational complexity, value.
5. Dev Lead: Sanjay (Dev Lead) - Technical feasibility, timeline estimate, complexity.
6. UX Lead: Chloe (UX Lead) - Usability, design friction, interface layout.
7. Data Analyst: Elena (Data Analyst) - Telemetry requirements, event logging.
8. QA Lead: Dave (QA Lead) - Testing strategies, edge cases, regression risk.

Each participant must write their opinion, core questions, risks, concerns, MVP recommendations, and priority (High, Medium, Low) based on their specific biases.

You MUST return a valid JSON object matching the following structure and NOTHING ELSE. Do not include markdown code block wrappers in your text body, just return raw valid JSON.

JSON Structure:
{{
  "discussion": [
    {{
      "role": "Business User",
      "name": "Emma (Marketing)",
      "avatar": "MKT",
      "opinion": "Emma's core statement on release timeline and marketing launch needs.",
      "questions": "Questions about promo flows or simple releases.",
      "risks": "Market risks.",
      "concerns": "Launch delays.",
      "recommendation": "Launch plan recommendation.",
      "priority": "High"
    }},
    {{
      "role": "Real User",
      "name": "Thomas (Patient User)",
      "avatar": "USR",
      "opinion": "...",
      "questions": "...",
      "risks": "...",
      "concerns": "...",
      "recommendation": "...",
      "priority": "High"
    }},
    {{
      "role": "Product Owner",
      "name": "Marcus (PO)",
      "avatar": "PO",
      "opinion": "...",
      "questions": "...",
      "risks": "...",
      "concerns": "...",
      "recommendation": "...",
      "priority": "High"
    }},
    {{
      "role": "Business Analyst",
      "name": "Nadia (BA)",
      "avatar": "BA",
      "opinion": "...",
      "questions": "...",
      "risks": "...",
      "concerns": "...",
      "recommendation": "...",
      "priority": "Medium"
    }},
    {{
      "role": "Dev Lead",
      "name": "Sanjay (Dev Lead)",
      "avatar": "DEV",
      "opinion": "...",
      "questions": "...",
      "risks": "...",
      "concerns": "...",
      "recommendation": "...",
      "priority": "High"
    }},
    {{
      "role": "UX Lead",
      "name": "Chloe (UX Lead)",
      "avatar": "UX",
      "opinion": "...",
      "questions": "...",
      "risks": "...",
      "concerns": "...",
      "recommendation": "...",
      "priority": "High"
    }},
    {{
      "role": "Data Analyst",
      "name": "Elena (Data Analyst)",
      "avatar": "DATA",
      "opinion": "...",
      "questions": "...",
      "risks": "...",
      "concerns": "...",
      "recommendation": "...",
      "priority": "Medium"
    }},
    {{
      "role": "QA Lead",
      "name": "Dave (QA Lead)",
      "avatar": "QA",
      "opinion": "...",
      "questions": "...",
      "risks": "...",
      "concerns": "...",
      "recommendation": "...",
      "priority": "High"
    }}
  ],
  "conflicts": "Markdown summary of critical alignment conflicts and how they were resolved in the MVP session.",
  "aligned_mvp_scope": "A structured Markdown document representing the final Aligned MVP Scope (What is included in the MVP, what is deferred to Phase 2, and success release criteria)."
}}
"""

    messages = [
        {"role": "system", "content": "You are a precise JSON generator. You output only valid JSON objects according to specifications, with no additional conversational wrapper text."},
        {"role": "user", "content": prompt}
    ]
    
    result = await service.chat_completion(
        model=request.model,
        messages=messages,
        fallback_type="collaboration",
        payload={"prd": request.prd}
    )
    
    if result["status"] == "success":
        try:
            cleaned = clean_json_string(result["content"])
            collab_data = json.loads(cleaned)
            if isinstance(collab_data, dict) and "discussion" in collab_data:
                result["discussion"] = collab_data.get("discussion", [])
                result["conflicts"] = collab_data.get("conflicts", "")
                result["aligned_mvp_scope"] = collab_data.get("aligned_mvp_scope", "")
            else:
                logger.error("Ollama did not return a valid collaboration object.")
                sim = service.generate_simulated_response("collaboration", {"prd": request.prd})
                result["discussion"] = sim["discussion"]
                result["conflicts"] = sim["conflicts"]
                result["aligned_mvp_scope"] = sim["aligned_mvp_scope"]
                result["status"] = "partial_success"
        except Exception as e:
            logger.error(f"Failed to parse collaboration JSON: {e}. Raw: {result['content']}")
            sim = service.generate_simulated_response("collaboration", {"prd": request.prd})
            result["discussion"] = sim["discussion"]
            result["conflicts"] = sim["conflicts"]
            result["aligned_mvp_scope"] = sim["aligned_mvp_scope"]
            result["status"] = "partial_success"
    else:
        # Fallback load
        sim = service.generate_simulated_response("collaboration", {"prd": request.prd})
        result["discussion"] = sim["discussion"]
        result["conflicts"] = sim["conflicts"]
        result["aligned_mvp_scope"] = sim["aligned_mvp_scope"]
        
    return result
