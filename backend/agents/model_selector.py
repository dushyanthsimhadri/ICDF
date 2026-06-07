# Configures system parameters and hyperparameters per LLM model type

MODEL_PROFILES = {
    "Llama3": {
        "model_name": "qwen3:8b",
        "temperature": 0.6,
        "max_tokens": 4096,
        "top_p": 0.9,
        "system_instruction": "You are Llama3 (running via Qwen3), a precise and rigorous enterprise orchestrator. Provide analytical, highly-structured execution plans."
    },
    "Qwen": {
        "model_name": "qwen3:8b",
        "temperature": 0.7,
        "max_tokens": 4096,
        "top_p": 0.85,
        "system_instruction": "You are Qwen, a highly detail-oriented product analyst. Excel at requirements extraction, document parsing, and PRD drafting."
    },
    "Mistral": {
        "model_name": "qwen3:8b",
        "temperature": 0.5,
        "max_tokens": 3072,
        "top_p": 0.9,
        "system_instruction": "You are Mistral (running via Qwen3), a logical workflow scheduling coordinator. Excel at timelines optimization, dependency mapping, and resource scheduling."
    },
    "DeepSeek": {
        "model_name": "qwen3:8b",
        "temperature": 0.2,
        "max_tokens": 8192,
        "top_p": 0.95,
        "system_instruction": "You are DeepSeek (running via Qwen3), a security risk auditor and QA code analysis engine. Focus on software security, validation rules, test coverage, and SOC2 policy compliance."
    }
}

def get_model_profile(model_name: str) -> dict:
    return MODEL_PROFILES.get(model_name, MODEL_PROFILES["Llama3"])
