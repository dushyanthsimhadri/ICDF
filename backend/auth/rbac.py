# Role-Based Access Control configuration for ICDF

ROLES_PERMISSIONS = {
    "Product Manager": {
        "dashboards": ["Executive", "Product"],
        "modules": ["Workflows", "Knowledge Hub", "Collaboration Hub", "Meeting Intelligence"],
        "actions": ["create_ticket", "update_roadmap", "update_prd", "configure_brain", "generate_summary"]
    },
    "Business Analyst": {
        "dashboards": ["Product"],
        "modules": ["Workflows", "Knowledge Hub", "Meeting Intelligence"],
        "actions": ["create_ticket", "update_prd", "generate_summary"]
    },
    "Product Owner": {
        "dashboards": ["Product"],
        "modules": ["Workflows", "Knowledge Hub"],
        "actions": ["create_ticket", "prioritize_backlog"]
    },
    "Program Manager": {
        "dashboards": ["Executive", "Program"],
        "modules": ["Workflows", "Collaboration Hub"],
        "actions": ["send_alert", "update_roadmap"]
    },
    "Delivery Manager": {
        "dashboards": ["Executive", "Program"],
        "modules": ["Workflows", "Collaboration Hub"],
        "actions": ["send_alert", "prioritize_backlog"]
    },
    "Dev Lead": {
        "dashboards": ["Engineering"],
        "modules": ["Workflows", "Engineering Hub", "Collaboration Hub"],
        "actions": ["create_ticket", "commit_code", "trigger_deploy"]
    },
    "Developer": {
        "dashboards": ["Engineering"],
        "modules": ["Workflows", "Engineering Hub", "Collaboration Hub"],
        "actions": ["commit_code"]
    },
    "QA Lead": {
        "dashboards": ["Engineering"],
        "modules": ["Workflows", "Engineering Hub"],
        "actions": ["create_ticket", "fail_build"]
    },
    "QA": {
        "dashboards": ["Engineering"],
        "modules": ["Workflows", "Engineering Hub"],
        "actions": ["create_ticket", "fail_build"]
    },
    "Architect": {
        "dashboards": ["Engineering", "Product"],
        "modules": ["Workflows", "Engineering Hub", "Knowledge Hub"],
        "actions": ["update_prd", "approve_architecture"]
    },
    "AI/ML Engineer": {
        "dashboards": ["Engineering"],
        "modules": ["Engineering Hub", "Collaboration Hub"],
        "actions": ["train_model", "configure_ollama"]
    },
    "RPA Developer": {
        "dashboards": ["Engineering"],
        "modules": ["Workflows"],
        "actions": ["trigger_automation"]
    },
    "Data Engineer": {
        "dashboards": ["Engineering"],
        "modules": ["Engineering Hub"],
        "actions": ["run_etl"]
    },
    "DevOps Engineer": {
        "dashboards": ["Engineering"],
        "modules": ["Engineering Hub"],
        "actions": ["trigger_deploy", "view_logs"]
    },
    "Security Engineer": {
        "dashboards": ["Engineering", "Governance"],
        "modules": ["Engineering Hub", "Knowledge Hub"],
        "actions": ["trigger_security_scan"]
    },
    "Governance Manager": {
        "dashboards": ["Governance"],
        "modules": ["Knowledge Hub"],
        "actions": ["update_policies"]
    },
    "Compliance Officer": {
        "dashboards": ["Governance"],
        "modules": ["Knowledge Hub"],
        "actions": ["update_policies", "approve_compliance"]
    },
    "Security Risk Officer": {
        "dashboards": ["Governance"],
        "modules": ["Knowledge Hub"],
        "actions": ["audit_logs", "escalate_risk"]
    },
    "AI Governance Lead": {
        "dashboards": ["Governance"],
        "modules": ["Knowledge Hub", "Collaboration Hub"],
        "actions": ["audit_brain", "approve_ai_safety"]
    },
    "Executive": {
        "dashboards": ["Executive", "Product", "Program", "Engineering", "Governance"],
        "modules": ["Workflows", "Knowledge Hub", "Collaboration Hub", "Meeting Intelligence", "Engineering Hub"],
        "actions": ["all"]
    },
    "Admin": {
        "dashboards": ["Executive", "Product", "Program", "Engineering", "Governance", "Admin"],
        "modules": ["Workflows", "Knowledge Hub", "Collaboration Hub", "Meeting Intelligence", "Engineering Hub", "Admin Portal"],
        "actions": ["all"]
    },
    "Stakeholder": {
        "dashboards": ["Executive"],
        "modules": ["Knowledge Hub"],
        "actions": []
    },
    "Project Manager": {
        "dashboards": ["Program"],
        "modules": ["Workflows"],
        "actions": ["create_ticket", "send_alert"]
    },
    "Portfolio Manager": {
        "dashboards": ["Executive", "Program"],
        "modules": ["Knowledge Hub"],
        "actions": ["update_roadmap"]
    },
    "Scrum Master": {
        "dashboards": ["Program"],
        "modules": ["Workflows", "Collaboration Hub"],
        "actions": ["prioritize_backlog", "send_alert"]
    }
}

def has_permission(role: str, action: str) -> bool:
    role_perms = ROLES_PERMISSIONS.get(role, {})
    if "all" in role_perms.get("actions", []):
        return True
    return action in role_perms.get("actions", [])

def get_allowed_dashboards(role: str):
    return ROLES_PERMISSIONS.get(role, {}).get("dashboards", ["Executive"])

def get_allowed_modules(role: str):
    return ROLES_PERMISSIONS.get(role, {}).get("modules", [])
