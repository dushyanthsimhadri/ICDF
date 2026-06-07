from .agent_runtime import BaseAgent
from sqlalchemy.orm import Session

class PMAgent(BaseAgent):
    def __init__(self, db: Session, model_name: str = "Llama3"):
        super().__init__(role="Product Manager", db=db, model_name=model_name)
