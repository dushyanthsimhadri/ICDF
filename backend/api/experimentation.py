from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.ollama_service import OllamaService
import json
import logging
from typing import List, Dict, Any

logger = logging.getLogger("uvicorn.error")
router = APIRouter()

class ExperimentRequest(BaseModel):
    name: str
    hypothesis: str
    product_area: str
    kpi_goal: str
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

@router.post("/experimentation")
async def run_experimentation(request: ExperimentRequest, service: OllamaService = Depends(get_ollama_service)):
    if not request.name.strip():
        raise HTTPException(status_code=400, detail="Experiment Name cannot be empty")
    if not request.hypothesis.strip():
        raise HTTPException(status_code=400, detail="Hypothesis cannot be empty")
        
    prompt = f"""You are a Senior Growth Product Manager, Data Scientist, and A/B Testing Specialist.
Design a rigorous experimentation blueprint, simulate cross-functional reviews, and run the decision engine for this test:

Experiment Name: {request.name}
Hypothesis: {request.hypothesis}
Product Area: {request.product_area}
KPI Goal: {request.kpi_goal}

Simulate evaluations from:
1. Product Owner (PO)
2. Business Analyst (BA)
3. Data Analyst (Data)
4. Dev Lead (Dev)

You MUST return a valid JSON object matching the following structure and NOTHING ELSE. Do not include markdown code block wraps around the JSON string.

JSON Structure:
{{
  "content": "A detailed Markdown experiment plan containing Setup & Configuration (Control vs Variant, Split), Metric Instrumentation (Primary KPI, Secondary KPIs, Guardrails), Statistical Parameters (Confidence, Power, Sample Size, Duration), and Risk Analysis.",
  "review": [
    {{
      "role": "Product Owner",
      "name": "Marcus (PO)",
      "avatar": "PO",
      "feasibility": "Strategic alignment & business timing statement.",
      "kpi_validity": "Evaluation of whether the primary KPI is suitable.",
      "risk": "Friction, overlap, or churn risks.",
      "measurement_concerns": "Telemetry or tracking worries.",
      "recommendation": "Approve / Iterate / Reject recommendation."
    }},
    {{
      "role": "Business Analyst",
      "name": "Nadia (BA)",
      "avatar": "BA",
      "feasibility": "...",
      "kpi_validity": "...",
      "risk": "...",
      "measurement_concerns": "...",
      "recommendation": "..."
    }},
    {{
      "role": "Data Analyst",
      "name": "Elena (Data Analyst)",
      "avatar": "DATA",
      "thought": "...",
      "feasibility": "...",
      "kpi_validity": "...",
      "risk": "...",
      "measurement_concerns": "...",
      "recommendation": "..."
    }},
    {{
      "role": "Dev Lead",
      "name": "Sanjay (Dev Lead)",
      "avatar": "DEV",
      "feasibility": "...",
      "kpi_validity": "...",
      "risk": "...",
      "measurement_concerns": "...",
      "recommendation": "..."
    }}
  ],
  "decision": {{
    "recommendation": "Launch",
    "rationale": "Markdown analysis of why this decision is recommended and concrete execution steps."
  }}
}}
"""

    messages = [
        {"role": "system", "content": "You are a precise JSON generator. You output only valid JSON objects according to specifications, with no additional text or markdown headers."},
        {"role": "user", "content": prompt}
    ]
    
    result = await service.chat_completion(
        model=request.model,
        messages=messages,
        fallback_type="experimentation",
        payload={
            "name": request.name,
            "hypothesis": request.hypothesis,
            "product_area": request.product_area,
            "kpi_goal": request.kpi_goal
        }
    )
    
    if result["status"] == "success":
        try:
            cleaned = clean_json_string(result["content"])
            exp_data = json.loads(cleaned)
            if isinstance(exp_data, dict) and "content" in exp_data:
                result["content"] = exp_data.get("content", "")
                result["review"] = exp_data.get("review", [])
                result["decision"] = exp_data.get("decision", {})
            else:
                logger.error("Ollama did not return a valid experiment object.")
                sim = service.generate_simulated_response("experimentation", {
                    "name": request.name,
                    "hypothesis": request.hypothesis,
                    "product_area": request.product_area,
                    "kpi_goal": request.kpi_goal
                })
                result["content"] = sim["content"]
                result["review"] = sim["review"]
                result["decision"] = sim["decision"]
                result["status"] = "partial_success"
        except Exception as e:
            logger.error(f"Failed to parse experiment JSON: {e}. Raw: {result['content']}")
            sim = service.generate_simulated_response("experimentation", {
                "name": request.name,
                "hypothesis": request.hypothesis,
                "product_area": request.product_area,
                "kpi_goal": request.kpi_goal
            })
            result["content"] = sim["content"]
            result["review"] = sim["review"]
            result["decision"] = sim["decision"]
            result["status"] = "partial_success"
    else:
        # Fallback load
        sim = service.generate_simulated_response("experimentation", {
            "name": request.name,
            "hypothesis": request.hypothesis,
            "product_area": request.product_area,
            "kpi_goal": request.kpi_goal
        })
        result["content"] = sim["content"]
        result["review"] = sim["review"]
        result["decision"] = sim["decision"]
        
    return result
