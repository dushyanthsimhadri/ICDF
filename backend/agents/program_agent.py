from .agent_runtime import BaseAgent
from sqlalchemy.orm import Session

class ProgramAgent(BaseAgent):
    def __init__(self, db: Session, model_name: str = "Mistral"):
        super().__init__(role="Program Manager", db=db, model_name=model_name)
