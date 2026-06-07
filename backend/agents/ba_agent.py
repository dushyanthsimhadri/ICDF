from .agent_runtime import BaseAgent
from sqlalchemy.orm import Session

class BAAgent(BaseAgent):
    def __init__(self, db: Session, model_name: str = "Qwen"):
        super().__init__(role="Business Analyst", db=db, model_name=model_name)
