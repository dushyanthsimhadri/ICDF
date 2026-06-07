from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.ollama_service import OllamaService
import json
import logging
from typing import List, Dict, Any

logger = logging.getLogger("uvicorn.error")
router = APIRouter()

class AnalyticsRequest(BaseModel):
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

@router.post("/analytics")
async def generate_analytics(request: AnalyticsRequest, service: OllamaService = Depends(get_ollama_service)):
    if not request.prd.strip():
        raise HTTPException(status_code=400, detail="PRD content cannot be empty")
        
    prompt = f"""You are an expert Data Analyst, Growth PM, and Product Analytics Architect.
Review the following Product Requirement Document (PRD) and construct an enterprise-grade analytics plan.

PRD Document:
{request.prd}

You MUST return a valid JSON object matching the following structure and NOTHING ELSE. Do not include markdown code block wraps around the JSON string.

JSON Structure:
{{
  "hierarchy": {{
    "business_goal": "The high-level business goal targeted by this feature set (e.g. increase monetization, boost engagement).",
    "north_star": "The singular North Star metric that defines long-term product value.",
    "primary_metrics": [
      "Primary Metric 1 (with definition)",
      "Primary Metric 2"
    ],
    "secondary_metrics": [
      "Secondary Metric 1 (guardrail/operational)",
      "Secondary Metric 2",
      "Secondary Metric 3"
    ]
  }},
  "event_taxonomy": [
    {{
      "event_name": "event_name_snake_case",
      "trigger": "Detailed trigger action description",
      "properties": "Comma separated key-value schemas (e.g. user_tier: str, price: float)"
    }}
  ],
  "ab_test": {{
    "hypothesis": "Clear growth hypothesis statement (If X, then Y, because Z)",
    "kpis": "Core experiment target metric",
    "success_criteria": "Statistical thresholds (e.g. p < 0.05, 95% confidence)",
    "duration": "Recommended runtime duration"
  }},
  "review": [
    {{
      "role": "Data Analyst",
      "name": "Elena (Data Analyst)",
      "avatar": "DATA",
      "comment": "Data analyst's feedback on tracking events and telemetry setup."
    }},
    {{
      "role": "Product Owner",
      "name": "Marcus (PO)",
      "avatar": "PO",
      "comment": "PO's review of metric alignment with strategic goals."
    }}
  ],
  "risks": [
    {{
      "type": "Vanity Metric / Telemetry Gaps / Sampling Bias",
      "description": "Specific concern details.",
      "mitigation": "How to resolve this gap."
    }}
  ],
  "maturity_advisor": {{
    "level": "Maturity Level classification (e.g. Level 2: Core Event Tracking)",
    "recommendations": "Detailed roadmap steps in Markdown for tools like Mixpanel, Segment, DBT, and warehouses."
  }},
  "content": "A detailed Markdown summary of the general analytics strategy and measurement framework."
}}
"""

    messages = [
        {"role": "system", "content": "You are a precise JSON generator. You output only valid JSON objects according to specifications, with no additional conversational wrapper text."},
        {"role": "user", "content": prompt}
    ]
    
    result = await service.chat_completion(
        model=request.model,
        messages=messages,
        fallback_type="analytics",
        payload={"prd": request.prd}
    )
    
    if result["status"] == "success":
        try:
            cleaned = clean_json_string(result["content"])
            analytics_data = json.loads(cleaned)
            if isinstance(analytics_data, dict) and "hierarchy" in analytics_data:
                result["hierarchy"] = analytics_data.get("hierarchy", {})
                result["event_taxonomy"] = analytics_data.get("event_taxonomy", [])
                result["ab_test"] = analytics_data.get("ab_test", {})
                result["review"] = analytics_data.get("review", [])
                result["risks"] = analytics_data.get("risks", [])
                result["maturity_advisor"] = analytics_data.get("maturity_advisor", {})
                result["content"] = analytics_data.get("content", "")
            else:
                logger.error("Ollama did not return a valid analytics object.")
                sim = service.generate_simulated_response("analytics", {"prd": request.prd})
                result.update(sim)
                result["status"] = "partial_success"
        except Exception as e:
            logger.error(f"Failed to parse analytics JSON: {e}. Raw: {result['content']}")
            sim = service.generate_simulated_response("analytics", {"prd": request.prd})
            result.update(sim)
            result["status"] = "partial_success"
    else:
        # Fallback load
        sim = service.generate_simulated_response("analytics", {"prd": request.prd})
        result.update(sim)
        
    return result
