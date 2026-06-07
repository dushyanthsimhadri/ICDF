from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from db.database import get_db
from db.models import User, ProductBrainConfig, AuditLog, GovernancePolicy, AIGovernanceRule
import datetime

router = APIRouter(prefix="/admin", tags=["admin"])

class BrainRoleUpdate(BaseModel):
    role_name: str
    operating_mode: str # Human, AI Agent, Hybrid, Disabled
    ai_model: str = "Llama3"
    tenant_id: str

class UserRoleUpdate(BaseModel):
    email: str
    role: str
    department: str
    team: str
    tenant_id: str

class PolicyCreate(BaseModel):
    name: str
    description: str
    severity: str = "Medium"
    tenant_id: str

class GovernanceRuleUpdate(BaseModel):
    rule_name: str
    tenant_id: str
    is_enabled: bool
    setting_value: str

@router.get("/users")
def get_users(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    users = db.query(User).filter(User.tenant_id == tenant_id).all()
    return [{"email": u.email, "role": u.role, "department": u.department, "team": u.team, "is_active": u.is_active, "tenant_id": u.tenant_id} for u in users]

@router.post("/user-update")
def update_user_role(data: UserRoleUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email, User.tenant_id == data.tenant_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    old_role = user.role
    user.role = data.role
    user.department = data.department
    user.team = data.team
    db.commit()
    
    # Audit log
    log = AuditLog(
        user_email="admin@icdf.enterprise", 
        action="Role Change", 
        details=f"Updated {data.email} role from {old_role} to {data.role}",
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()
    
    return {"message": "User updated successfully"}

@router.get("/brain-config")
def get_brain_config(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    configs = db.query(ProductBrainConfig).filter(ProductBrainConfig.tenant_id == tenant_id).all()
    return [{"role_name": c.role_name, "operating_mode": c.operating_mode, "ai_model": c.ai_model, "tenant_id": c.tenant_id} for c in configs]

@router.post("/brain-config-update")
def update_brain_config(data: BrainRoleUpdate, db: Session = Depends(get_db)):
    cfg = db.query(ProductBrainConfig).filter(
        ProductBrainConfig.role_name == data.role_name,
        ProductBrainConfig.tenant_id == data.tenant_id
    ).first()
    if not cfg:
        cfg = ProductBrainConfig(
            role_name=data.role_name, 
            operating_mode=data.operating_mode, 
            ai_model=data.ai_model,
            tenant_id=data.tenant_id
        )
        db.add(cfg)
    else:
        cfg.operating_mode = data.operating_mode
        cfg.ai_model = data.ai_model
    db.commit()
    
    # Audit log
    log = AuditLog(
        user_email="admin@icdf.enterprise", 
        action="Admin Change", 
        details=f"Updated {data.role_name} operation mode to {data.operating_mode} ({data.ai_model})",
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()
    
    return {"message": f"Brain config updated for {data.role_name}"}

@router.get("/audit-logs")
def get_audit_logs(tenant_id: str = "acme_corp", query: Optional[str] = None, db: Session = Depends(get_db)):
    db_query = db.query(AuditLog).filter(AuditLog.tenant_id == tenant_id)
    if query:
        db_query = db_query.filter(
            (AuditLog.user_email.contains(query)) |
            (AuditLog.action.contains(query)) |
            (AuditLog.details.contains(query))
        )
    logs = db_query.order_by(AuditLog.timestamp.desc()).limit(100).all()
    return [{
        "id": l.id,
        "user_email": l.user_email,
        "action": l.action,
        "details": l.details,
        "timestamp": l.timestamp.isoformat(),
        "tenant_id": l.tenant_id
    } for l in logs]

@router.get("/policies")
def get_policies(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    policies = db.query(GovernancePolicy).filter(GovernancePolicy.tenant_id == tenant_id).all()
    return [{"id": p.id, "name": p.name, "description": p.description, "status": p.status, "severity": p.severity} for p in policies]

@router.post("/policy-create")
def create_policy(data: PolicyCreate, db: Session = Depends(get_db)):
    p = GovernancePolicy(
        name=data.name, 
        description=data.description, 
        severity=data.severity, 
        status="Active",
        tenant_id=data.tenant_id
    )
    db.add(p)
    db.commit()
    
    # Audit log
    log = AuditLog(
        user_email="admin@icdf.enterprise", 
        action="Policy Update", 
        details=f"Created compliance policy: {data.name}",
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()
    
    return {"message": "Policy created successfully"}

@router.get("/organizations")
def get_organizations():
    return [
        {
            "id": "acme_corp",
            "name": "Acme Corp",
            "billing_tier": "Enterprise Tier",
            "departments": [
                {
                    "name": "Engineering",
                    "business_units": ["Product Delivery", "Core Services"],
                    "teams": [
                        {"name": "Core Delivery", "projects": ["ICDF Core Engine", "V2 Telemetry Grid"]},
                        {"name": "DevOps Squad", "projects": ["Kubernetes Cluster", "AWS IAM Secure Config"]}
                    ]
                },
                {
                    "name": "Governance",
                    "business_units": ["Risk Auditing"],
                    "teams": [
                        {"name": "Audit Squad", "projects": ["SOC2 Lock Down", "GDPR Verification"]}
                    ]
                }
            ],
            "settings": {"mfa_required": True, "ai_safety_strict": True}
        },
        {
            "id": "globex_corp",
            "name": "Globex Corp",
            "billing_tier": "Pro Tier",
            "departments": [
                {
                    "name": "Engineering",
                    "business_units": ["API Services"],
                    "teams": [
                        {"name": "Globex Core Devs", "projects": ["gRPC Refactor", "API Gateway"]}
                    ]
                }
            ],
            "settings": {"mfa_required": False, "ai_safety_strict": False}
        },
        {
            "id": "initech",
            "name": "Initech",
            "billing_tier": "Free Tier",
            "departments": [
                {
                    "name": "Product Development",
                    "business_units": ["TPS Reporting"],
                    "teams": [
                        {"name": "Initech Devs", "projects": ["TPS Automation", "Report Compiler"]}
                    ]
                }
            ],
            "settings": {"mfa_required": True, "ai_safety_strict": False}
        }
    ]

@router.get("/governance-rules")
def get_governance_rules(tenant_id: str = "acme_corp", db: Session = Depends(get_db)):
    rules = db.query(AIGovernanceRule).filter(AIGovernanceRule.tenant_id == tenant_id).all()
    return [{"rule_name": r.rule_name, "rule_type": r.rule_type, "setting_value": r.setting_value, "is_enabled": r.is_enabled} for r in rules]

@router.post("/governance-rules/update")
def update_governance_rule(data: GovernanceRuleUpdate, db: Session = Depends(get_db)):
    rule = db.query(AIGovernanceRule).filter(
        AIGovernanceRule.rule_name == data.rule_name,
        AIGovernanceRule.tenant_id == data.tenant_id
    ).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Governance rule not found")
    rule.is_enabled = data.is_enabled
    rule.setting_value = data.setting_value
    db.commit()
    
    # Audit log
    log = AuditLog(
        user_email="admin@icdf.enterprise",
        action="Policy Update",
        details=f"Updated AI rule '{data.rule_name}': enabled={data.is_enabled}, value='{data.setting_value}'",
        tenant_id=data.tenant_id
    )
    db.add(log)
    db.commit()
    return {"status": "Success"}
