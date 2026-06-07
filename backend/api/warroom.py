from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.ollama_service import OllamaService
import json
import logging
from typing import List, Dict, Any

logger = logging.getLogger("uvicorn.error")
router = APIRouter()

class WarRoomRequest(BaseModel):
    features: List[str]
    objective: str
    constraints: str
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

@router.post("/warroom")
async def run_warroom(request: WarRoomRequest, service: OllamaService = Depends(get_ollama_service)):
    if not request.features:
        raise HTTPException(status_code=400, detail="Feature options list cannot be empty")
    if not request.objective.strip():
        raise HTTPException(status_code=400, detail="Objective cannot be empty")
        
    features_str = ", ".join(request.features)
    
    prompt = f"""You are a Multi-Agent Systems Orchestrator.
Simulate a cross-functional product war room debate about prioritizing these feature options: {features_str}
Business Objective: {request.objective}
Constraints: {request.constraints}

You must simulate opinions from these 6 roles, representing a diverse set of professional viewpoints:
1. Product Owner (PO): Strategic, goal-oriented, growth-focused.
2. Business Analyst (BA): Data-informed, market opportunities, financial value.
3. Dev Lead: Feasibility, complexity, tech debt, scaling, effort.
4. UX Lead: User experience, user testing, cognitive load, user-centricity.
5. Data Analyst: Telemetry, product metrics, tracking setup.
6. QA Lead: Test coverage, risk of regression, release stability.

You MUST return a valid JSON object matching the following structure and NOTHING ELSE. Do not include markdown code block wrappers in your text body, just return raw valid JSON.

JSON Structure:
{{
  "discussion": [
    {{
      "role": "Product Owner",
      "name": "Marcus (PO)",
      "avatar": "PO",
      "opinion": "PO's core statement on which feature to prioritize and why.",
      "concerns": "Strategic alignment or competitor risks.",
      "risks": "Market timing risks.",
      "effort": "Strategic value alignment statement.",
      "kpi_impact": "Expected metrics increase (e.g. +10% signup)",
      "recommendation": "Their recommended prioritized feature."
    }},
    {{
      "role": "Business Analyst",
      "name": "Nadia (BA)",
      "avatar": "BA",
      "opinion": "...",
      "concerns": "...",
      "risks": "...",
      "effort": "...",
      "kpi_impact": "...",
      "recommendation": "..."
    }},
    {{
      "role": "Dev Lead",
      "name": "Sanjay (Dev Lead)",
      "avatar": "DEV",
      "opinion": "...",
      "concerns": "...",
      "risks": "...",
      "effort": "...",
      "kpi_impact": "...",
      "recommendation": "..."
    }},
    {{
      "role": "UX Lead",
      "name": "Chloe (UX Lead)",
      "avatar": "UX",
      "opinion": "...",
      "concerns": "...",
      "risks": "...",
      "effort": "...",
      "kpi_impact": "...",
      "recommendation": "..."
    }},
    {{
      "role": "Data Analyst",
      "name": "Elena (Data Analyst)",
      "avatar": "DATA",
      "opinion": "...",
      "concerns": "...",
      "risks": "...",
      "effort": "...",
      "kpi_impact": "...",
      "recommendation": "..."
    }},
    {{
      "role": "QA Lead",
      "name": "Dave (QA Lead)",
      "avatar": "QA",
      "opinion": "...",
      "concerns": "...",
      "risks": "...",
      "effort": "...",
      "kpi_impact": "...",
      "recommendation": "..."
    }}
  ],
  "conflict_analysis": "Markdown analysis of core strategic disagreements between agents (e.g. Dev/UX pushback vs PO business urgency).",
  "recommendation": "Final PM compromise resolution and execution plan based on the discussion (in Markdown)."
}}

Ensure each agent's opinion reflects their realistic professional biases and directly references the features, objectives, and constraints.
"""

    messages = [
        {"role": "system", "content": "You are a professional multi-agent system. Output only valid JSON objects according to specifications, with no additional conversational wrapper text."},
        {"role": "user", "content": prompt}
    ]
    
    result = await service.chat_completion(
        model=request.model,
        messages=messages,
        fallback_type="warroom",
        payload={
            "features": request.features,
            "objective": request.objective,
            "constraints": request.constraints
        }
    )
    
    if result["status"] == "success":
        try:
            cleaned = clean_json_string(result["content"])
            warroom_data = json.loads(cleaned)
            if isinstance(warroom_data, dict) and "discussion" in warroom_data:
                result["discussion"] = warroom_data.get("discussion", [])
                result["conflict_analysis"] = warroom_data.get("conflict_analysis", "")
                result["recommendation"] = warroom_data.get("recommendation", "")
            else:
                logger.error("Ollama did not return a valid war room object.")
                sim = service.generate_simulated_response("warroom", {
                    "features": request.features,
                    "objective": request.objective,
                    "constraints": request.constraints
                })
                result["discussion"] = sim["discussion"]
                result["conflict_analysis"] = sim["conflict_analysis"]
                result["recommendation"] = sim["recommendation"]
                result["status"] = "partial_success"
        except Exception as e:
            logger.error(f"Failed to parse warroom JSON: {e}. Raw: {result['content']}")
            sim = service.generate_simulated_response("warroom", {
                "features": request.features,
                "objective": request.objective,
                "constraints": request.constraints
            })
            result["discussion"] = sim["discussion"]
            result["conflict_analysis"] = sim["conflict_analysis"]
            result["recommendation"] = sim["recommendation"]
            result["status"] = "partial_success"
    else:
        # Fallback load
        sim = service.generate_simulated_response("warroom", {
            "features": request.features,
            "objective": request.objective,
            "constraints": request.constraints
        })
        result["discussion"] = sim["discussion"]
        result["conflict_analysis"] = sim["conflict_analysis"]
        result["recommendation"] = sim["recommendation"]
        
    return result
