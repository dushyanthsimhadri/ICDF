from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.ollama_service import OllamaService
from typing import List, Optional, Dict, Any

router = APIRouter()

class FeatureItem(BaseModel):
    name: str
    description: str
    reach: Optional[float] = 100.0
    impact: Optional[float] = 2.0  # 1-3 scale
    confidence: Optional[float] = 80.0  # % scale (0-100)
    effort: Optional[float] = 3.0  # 1-5 scale or points
    priority_group: Optional[str] = "Should"  # Must, Should, Could, Won't
    impact_value: Optional[float] = 3.0  # 1-5 scale (for 2x2 Matrix)

class PrioritizeRequest(BaseModel):
    features: List[FeatureItem]
    framework: str  # 'rice', 'moscow', 'impact_effort'
    model: str = "qwen"

# Dependency
def get_ollama_service():
    return OllamaService()

@router.post("/prioritize")
async def prioritize_features(request: PrioritizeRequest, service: OllamaService = Depends(get_ollama_service)):
    if not request.features:
        raise HTTPException(status_code=400, detail="Feature list cannot be empty")
        
    framework_lower = request.framework.lower()
    
    # Programmatic calculations
    ranked_features = []
    
    if framework_lower == "rice":
        # RICE Score = (Reach * Impact * Confidence) / Effort
        for f in request.features:
            reach = f.reach or 0.0
            impact = f.impact or 0.0
            confidence = (f.confidence or 0.0) / 100.0  # percentage
            effort = f.effort or 1.0
            if effort <= 0:
                effort = 0.5  # prevent division by zero
                
            score = round((reach * impact * confidence) / effort, 2)
            f_dict = f.model_dump()
            f_dict["score"] = score
            ranked_features.append(f_dict)
            
        # Sort desc by score
        ranked_features.sort(key=lambda x: x["score"], reverse=True)
        
    elif framework_lower == "moscow":
        # Group by Must, Should, Could, Won't
        order = {"Must": 0, "Should": 1, "Could": 2, "Won't": 3}
        for f in request.features:
            f_dict = f.model_dump()
            f_dict["group_rank"] = order.get(f.priority_group, 4)
            ranked_features.append(f_dict)
            
        ranked_features.sort(key=lambda x: x["group_rank"])
        
    elif framework_lower == "impact_effort" or framework_lower == "impact vs effort":
        # Map to 2x2 quadrants
        for f in request.features:
            imp = f.impact_value or 3.0
            eff = f.effort or 3.0
            
            # Quadrants (threshold is 3.0 on a 1-5 scale)
            if imp >= 3.0 and eff < 3.0:
                quadrant = "Quick Win (High Impact, Low Effort)"
                rank_order = 0
            elif imp >= 3.0 and eff >= 3.0:
                quadrant = "Strategic Initiative (High Impact, High Effort)"
                rank_order = 1
            elif imp < 3.0 and eff < 3.0:
                quadrant = "Fill-in / Low Hanging Fruit (Low Impact, Low Effort)"
                rank_order = 2
            else:
                quadrant = "Thankless Task (Low Impact, High Effort)"
                rank_order = 3
                
            f_dict = f.model_dump()
            f_dict["quadrant"] = quadrant
            f_dict["rank_order"] = rank_order
            ranked_features.append(f_dict)
            
        ranked_features.sort(key=lambda x: x["rank_order"])
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported framework: {request.framework}")

    # Generate custom LLM narrative explaining the prioritization
    features_summary = ""
    for idx, f in enumerate(ranked_features):
        rank = idx + 1
        if framework_lower == "rice":
            features_summary += f"{rank}. {f['name']} (RICE Score: {f['score']}) - {f['description']}\n"
        elif framework_lower == "moscow":
            features_summary += f"{rank}. {f['name']} ({f['priority_group']}) - {f['description']}\n"
        else:
            features_summary += f"{rank}. {f['name']} ({f['quadrant']}) - {f['description']}\n"
            
    prompt = f"""You are an expert Product Management Strategist.
Review the mathematically ranked features list using the '{request.framework.upper()}' framework:

Ranked Feature List:
{features_summary}

Write a professional strategic rationale explaining why this prioritization list is optimal.
Your output must be in Markdown and contain:
1. Executive Rationale (Brief overview of the prioritization strategy)
2. Detailed Analysis (Breakdown of the top-ranked features, why they scored high, and why lower-ranked features should be deferred)
3. Delivery Recommendations (Suggest how to execute these items: MVP sizing, resource allocation)

Keep it direct, professional, and clear. Do not output conversational preamble.
"""

    messages = [
        {"role": "system", "content": "You are a professional PM Prioritization Consultant. Output only markdown analyses."},
        {"role": "user", "content": prompt}
    ]
    
    # We pass the list of ranked features as payload so the fallback can access it
    llm_result = await service.chat_completion(
        model=request.model,
        messages=messages,
        fallback_type="prioritize",
        payload={"features": ranked_features, "framework": framework_lower}
    )
    
    # Inject programmatic rankings into the final response
    return {
        "prioritized_features": ranked_features,
        "rationale": llm_result["content"],
        "model": llm_result["model"],
        "source": llm_result["source"]
    }
