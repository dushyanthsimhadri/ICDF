from .agent_runtime import BaseAgent
from sqlalchemy.orm import Session

class GovernanceAgent(BaseAgent):
    def __init__(self, db: Session, model_name: str = "DeepSeek"):
        super().__init__(role="Compliance Officer", db=db, model_name=model_name)
