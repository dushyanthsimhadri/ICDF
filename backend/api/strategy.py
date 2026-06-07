from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.ollama_service import OllamaService

router = APIRouter()

class StrategyRequest(BaseModel):
    option_a: str
    option_b: str
    goal: str
    constraints: str
    model: str = "qwen"

# Dependency
def get_ollama_service():
    return OllamaService()

@router.post("/strategy")
async def evaluate_strategy(request: StrategyRequest, service: OllamaService = Depends(get_ollama_service)):
    if not request.option_a.strip() or not request.option_b.strip():
        raise HTTPException(status_code=400, detail="Option A and Option B cannot be empty")
        
    prompt = f"""You are a Staff Product Strategy Architect.
Evaluate the strategic trade-offs between two options:

Option A: {request.option_a}
Option B: {request.option_b}
Business Goal: {request.goal}
Constraints: {request.constraints}

Provide a rigorous strategic analysis in Markdown containing:
1. Business Impact Analysis (How each option affects revenue, growth, or strategic alignment)
2. User Impact Assessment (UX friction, value proposition, satisfaction)
3. Engineering & Delivery Complexity (Estimated implementation difficulty, risk of delay)
4. Tradeoff Analysis Matrix (A comparison table evaluating speed, cost, risk, and value)
5. Recommendation & Next Steps (A concrete, actionable recommendation on which option to prioritize and why, including how to scope it down to fit constraints)

Be logical, objective, and deep. Write direct markdown without introductory chatter.
"""

    messages = [
        {"role": "system", "content": "You are a professional Product Strategy Director. Output only markdown comparative analyses."},
        {"role": "user", "content": prompt}
    ]
    
    result = await service.chat_completion(
        model=request.model,
        messages=messages,
        fallback_type="strategy",
        payload={
            "option_a": request.option_a,
            "option_b": request.option_b,
            "goal": request.goal,
            "constraints": request.constraints
        }
    )
    
    return result
