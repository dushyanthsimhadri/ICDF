from sqlalchemy.orm import Session
from .model_selector import get_model_profile
from .prompt_manager import get_agent_prompt
from .ollama_client import query_ollama
from db.models import AuditLog, WorkflowAction
import json
import re

class AgentMemory:
    def __init__(self, capacity: int = 10):
        self.capacity = capacity
        self.buffer = []

    def add(self, key: str, value: str):
        if len(self.buffer) >= self.capacity:
            self.buffer.pop(0)
        self.buffer.append({"key": key, "value": value})

    def get_summary(self) -> str:
        if not self.buffer:
            return "No historic states logged in short-term memory buffer."
        return "\n".join([f"- [{item['key']}]: {item['value']}" for item in self.buffer])

class BaseAgent:
    def __init__(self, role: str, db: Session, model_name: str = "Llama3"):
        self.role = role
        self.db = db
        self.model_name = model_name
        self.memory = AgentMemory()
        self.profile = get_model_profile(model_name)

    def run_tools(self, tool_name: str, args: str) -> str:
        # Mock execution environment for agent tools
        if tool_name == "query_knowledge_base":
            return f"[Tool Output]: Retrieved 2 documents matching index context. Storage path: db/vector_documents."
        elif tool_name == "audit_tickets_risk":
            return f"[Tool Output]: Scanned database table 'tickets'. Found 1 warning (PlainText secrets configuration details)."
        elif tool_name == "trigger_webhook_alert":
            return f"[Tool Output]: webhook triggered to target pipeline."
        return f"[Tool Error]: Tool '{tool_name}' not registered in namespace."

    def run(self, input_text: str, context: str = "") -> dict:
        # 1. Compile prompt
        full_context = f"{context}\n\nShort-term memory log:\n{self.memory.get_summary()}"
        prompt = get_agent_prompt(self.role, input_text, full_context)
        
        # 2. Invoke model via ollama_client
        raw_response = query_ollama(
            model=self.profile["model_name"],
            prompt=prompt,
            system_prompt=self.profile["system_instruction"],
            temperature=self.profile["temperature"]
        )

        # 3. Parse reasoning (ReAct format: REASONING, THOUGHT, OUTPUT)
        reasoning = "N/A"
        thought = "N/A"
        output_payload = raw_response

        # Simple regex extracts
        reasoning_match = re.search(r"REASONING:(.*?)(?=THOUGHT:|$)", raw_response, re.DOTALL | re.IGNORECASE)
        if reasoning_match:
            reasoning = reasoning_match.group(1).strip()
            
        thought_match = re.search(r"THOUGHT:(.*?)(?=OUTPUT:|$)", raw_response, re.DOTALL | re.IGNORECASE)
        if thought_match:
            thought = thought_match.group(1).strip()

        output_match = re.search(r"OUTPUT:(.*?)$", raw_response, re.DOTALL | re.IGNORECASE)
        if output_match:
            output_payload = output_match.group(1).strip()

        # Update memory
        self.memory.add("Input", input_text[:50] + "...")
        self.memory.add("Output Summary", output_payload[:60] + "...")

        # Log execution to audit logs
        log = AuditLog(
            user_email=f"{self.role.lower().replace(' ', '_')}_agent@icdf.io",
            action="Agent Execution",
            details=f"Ran {self.model_name} model. Reasoning: {reasoning[:80]}"
        )
        self.db.add(log)
        self.db.commit()

        return {
            "role": self.role,
            "model": self.model_name,
            "reasoning": reasoning,
            "thought": thought,
            "output": output_payload,
            "memory": self.memory.get_summary()
        }
