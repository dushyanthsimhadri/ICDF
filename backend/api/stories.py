from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.ollama_service import OllamaService
import json
import logging
from typing import List, Dict, Any

logger = logging.getLogger("uvicorn.error")
router = APIRouter()

class StoriesRequest(BaseModel):
    prd: str
    model: str = "qwen"

class UserStory(BaseModel):
    id: str
    title: str
    description: str
    acceptance_criteria: str
    priority: str
    story_points: int
    epic: str

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

@router.post("/stories")
async def generate_stories(request: StoriesRequest, service: OllamaService = Depends(get_ollama_service)):
    if not request.prd.strip():
        raise HTTPException(status_code=400, detail="PRD content cannot be empty")
        
    prompt = f"""You are a Technical Product Manager and Agile Scrum Master.
Translate the following Product Requirement Document (PRD) into a JSON array of User Stories.

PRD Document:
{request.prd}

For the output, you MUST return a valid JSON array of objects and NOTHING ELSE. Do not include introductory text, do not include explanations. Just return the JSON array.
Each object in the array must strictly match this schema:
{{
  "id": "US-101" (sequential identifier starting at US-101),
  "title": "Short descriptive title of the user story",
  "description": "As a [user persona], I want to [action], so that [benefit].",
  "acceptance_criteria": "Acceptance criteria using Given-When-Then format.",
  "priority": "One of: Must, Should, Could, Won't",
  "story_points": 1, 2, 3, 5, 8, or 13 (Fibonacci point estimation),
  "epic": "The name of the Epic this story maps to"
}}

Generate between 4 to 6 relevant user stories covering the core aspects of the PRD.
"""

    messages = [
        {"role": "system", "content": "You are a precise JSON generator. You output only valid JSON arrays according to the user specification. Do not include markdown headers, conversations, or notes."},
        {"role": "user", "content": prompt}
    ]
    
    result = await service.chat_completion(
        model=request.model,
        messages=messages,
        fallback_type="stories",
        payload={"prd": request.prd}
    )
    
    # Try parsing Ollama's response as JSON
    if result["status"] == "success":
        try:
            cleaned = clean_json_string(result["content"])
            stories_data = json.loads(cleaned)
            if isinstance(stories_data, list):
                result["stories"] = stories_data
            else:
                logger.error("Ollama did not return a JSON list.")
                result["stories"] = service.generate_simulated_response("stories", {"prd": request.prd})
                result["status"] = "partial_success"
        except Exception as e:
            logger.error(f"Failed to parse stories JSON: {e}. Raw content: {result['content']}")
            result["stories"] = service.generate_simulated_response("stories", {"prd": request.prd})
            result["status"] = "partial_success"
    else:
        # If it was fallback, content is already generated as list in simulated response
        result["stories"] = service.generate_simulated_response("stories", {"prd": request.prd})
        
    return result
