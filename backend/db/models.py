from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    tenant_id = Column(String, unique=True, index=True, nullable=False) # UUID or slug
    billing_tier = Column(String, default="Enterprise Tier") # Free, Pro, Enterprise
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class TenantWorkspace(Base):
    __tablename__ = "tenant_workspaces"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, nullable=False)
    workspace_name = Column(String, nullable=False)
    settings_json = Column(Text, nullable=True) # JSON config

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="Developer") # PM, QA, Compliance
    department = Column(String, nullable=True, default="Engineering")
    team = Column(String, nullable=True, default="Core Delivery")
    is_active = Column(Boolean, default=True)
    
    # Multi-tenant columns
    tenant_id = Column(String, default="tenant_default")
    role_level = Column(Integer, default=1) # 1 (Dev) to 5 (Executive) for role inheritance
    usage_queries_count = Column(Integer, default=0) # Usage analytics
    billing_status = Column(String, default="Active")

class ProductBrainConfig(Base):
    __tablename__ = "product_brain_configs"

    id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String, index=True, nullable=False)
    operating_mode = Column(String, nullable=False, default="Human") # Human, AI Agent, Hybrid, Disabled
    ai_model = Column(String, nullable=False, default="Llama3")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    tenant_id = Column(String, default="tenant_default")

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="To Do")
    assignee = Column(String, nullable=True)
    priority = Column(String, default="Medium")
    category = Column(String, default="Feature")
    velocity_days = Column(Integer, default=5)
    risk_score = Column(Integer, default=10)
    dependencies = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Multi-tenant column
    tenant_id = Column(String, default="tenant_default")

class IntegrationConnector(Base):
    __tablename__ = "integration_connectors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False) # Jira, GitHub, Slack
    status = Column(String, default="Disconnected") # Connected, Disconnected, Error
    config_details = Column(Text, nullable=True)
    last_sync = Column(DateTime, nullable=True)
    
    # Real connector columns
    health_score = Column(Integer, default=100) # 0 to 100 health
    error_count = Column(Integer, default=0)
    token_expiry = Column(DateTime, nullable=True)
    tenant_id = Column(String, default="tenant_default")

class SyncLog(Base):
    __tablename__ = "sync_logs"

    id = Column(Integer, primary_key=True, index=True)
    connector_name = Column(String, nullable=False)
    status = Column(String, nullable=False) # Success, Failed
    error_details = Column(Text, nullable=True)
    sync_duration_ms = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, nullable=False)
    action = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    tenant_id = Column(String, default="tenant_default")

class GovernancePolicy(Base):
    __tablename__ = "governance_policies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="Active")
    severity = Column(String, default="Medium")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    tenant_id = Column(String, default="tenant_default")

class MeetingTranscript(Base):
    __tablename__ = "meeting_transcripts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    transcript_text = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    action_items = Column(Text, nullable=True)
    date = Column(DateTime, default=datetime.datetime.utcnow)

# Vector RAG Memory Table
class VectorDocument(Base):
    __tablename__ = "vector_documents"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, nullable=False)
    source_type = Column(String, nullable=False) # Slack, PRD, Meeting
    text_content = Column(Text, nullable=False)
    vector_embeddings_json = Column(Text, nullable=True) # Cosine similarity tokens array
    metadata_json = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    tenant_id = Column(String, default="tenant_default")

# Autonomous Workflow Approvals Table
class WorkflowAction(Base):
    __tablename__ = "workflow_actions"

    id = Column(Integer, primary_key=True, index=True)
    action_type = Column(String, nullable=False) # Create Ticket, Notify Slack, etc.
    status = Column(String, default="Awaiting Approval") # Awaiting Approval, Approved, Executed, Rejected, Failed
    payload = Column(Text, nullable=False) # JSON parameters string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    approved_by = Column(String, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    approval_required = Column(Boolean, default=True)
    error_msg = Column(Text, nullable=True)
    tenant_id = Column(String, default="tenant_default")
    
    # Upgraded Approval Workbench columns
    comments = Column(Text, nullable=True)
    escalation_status = Column(String, default="Standard") # Standard, Escalated
    sla_deadline_hours = Column(Integer, default=24)

class PortfolioInitiative(Base):
    __tablename__ = "portfolio_initiatives"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    status = Column(String, default="Active") # Planning, Active, Completed, On Hold
    budget = Column(Integer, default=100000)
    spent = Column(Integer, default=0)
    strategic_goal = Column(String, nullable=True)
    delivery_confidence = Column(Integer, default=90)
    risk_summary = Column(Text, nullable=True)
    tenant_id = Column(String, default="tenant_default")

class ReleaseTrain(Base):
    __tablename__ = "release_trains"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    status = Column(String, default="Planning") # Staging, Ready, Blocked, Deploying
    environment = Column(String, default="Production") # Production, Staging, QA
    release_date = Column(DateTime, default=datetime.datetime.utcnow)
    go_no_go_status = Column(String, default="Pending") # Pending, Go, No-Go
    checklist_json = Column(Text, nullable=True) # JSON list of checklist items
    tenant_id = Column(String, default="tenant_default")

class ResourceAllocation(Base):
    __tablename__ = "resource_allocations"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, nullable=False)
    allocated_percentage = Column(Integer, default=100)
    skill_tags = Column(String, default="Engineering") # comma-separated
    burnout_risk_score = Column(Integer, default=15)
    tenant_id = Column(String, default="tenant_default")

class ScenarioSimulation(Base):
    __tablename__ = "scenario_simulations"

    id = Column(Integer, primary_key=True, index=True)
    scenario_name = Column(String, nullable=False) # e.g. capacity_drop_20
    forecast_summary = Column(Text, nullable=False)
    risk_impact_level = Column(String, default="Medium") # High, Medium, Low
    timeline_delay_days = Column(Integer, default=0)
    recommendation = Column(Text, nullable=True)
    tenant_id = Column(String, default="tenant_default")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String, default="Alert") # Alert, Connector, Risk, Workflow, AI, Release
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    tenant_id = Column(String, default="tenant_default")

class AutomationRule(Base):
    __tablename__ = "automation_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    trigger = Column(String, nullable=False) # Meeting Created, Risk Detected, Velocity Drop, Connector Failure, Ticket Blocked
    action = Column(String, nullable=False) # Send Alert, Create Ticket, Update Docs, Notify Stakeholders, Approval Request
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    tenant_id = Column(String, default="tenant_default")

class AIGovernanceRule(Base):
    __tablename__ = "ai_governance_rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_name = Column(String, nullable=False)
    rule_type = Column(String, nullable=False) # approval, model_access, sensitive_action, prompt_policy
    setting_value = Column(Text, nullable=True) # JSON or simple value
    is_enabled = Column(Boolean, default=True)
    tenant_id = Column(String, default="tenant_default")

class Channel(Base):
    __tablename__ = "channels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    tenant_id = Column(String, default="tenant_default")
    team_id = Column(String, default="Core Delivery")
    workspace_id = Column(String, default="Alpha Sprint")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    channel_id = Column(Integer, nullable=False)
    user_email = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    parent_message_id = Column(Integer, nullable=True) # for threading
    reactions_json = Column(Text, default="{}") # e.g. {"👍": ["pm@icdf.io"]}
    is_pinned = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    tenant_id = Column(String, default="tenant_default")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    folder = Column(String, default="Strategy Docs") # Strategy Docs, Feature Specs, roadmaps, etc.
    is_pinned = Column(Boolean, default=False)
    tenant_id = Column(String, default="tenant_default")
    team_id = Column(String, default="Core Delivery")
    workspace_id = Column(String, default="Alpha Sprint")
    uploader_id = Column(String, nullable=True)
    storage_path = Column(String, nullable=True)
    file_type = Column(String, default="TXT")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    file_size_bytes = Column(Integer, default=0)
    tags_json = Column(Text, default="[]")
    permissions_json = Column(Text, default="[]")

class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, nullable=False)
    version_num = Column(Integer, default=1)
    content = Column(Text, nullable=True)
    updated_by = Column(String, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    transcript_text = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    status = Column(String, default="Completed") # Completed, Scheduled
    date = Column(DateTime, default=datetime.datetime.utcnow)
    meeting_type = Column(String, default="Standup") # Sprint Planning, Standup, Review, Stakeholder, Discovery
    speaker_timeline_json = Column(Text, default="[]") # [{speaker, text, start, end}]
    metadata_json = Column(Text, default="{}") # actions, requirements, risks, dependencies, follow_ups
    tenant_id = Column(String, default="tenant_default")
    team_id = Column(String, default="Core Delivery")
    workspace_id = Column(String, default="Alpha Sprint")

class MeetingSummary(Base):
    __tablename__ = "meeting_summaries"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, nullable=False)
    summary_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PRD(Base):
    __tablename__ = "prds"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    overview = Column(Text, nullable=True)
    problem_statement = Column(Text, nullable=True)
    goals = Column(Text, nullable=True)
    objectives = Column(Text, nullable=True)
    scope = Column(Text, nullable=True)
    requirements_json = Column(Text, default="[]")
    user_stories_json = Column(Text, default="[]")
    acceptance_criteria_json = Column(Text, default="[]")
    dependencies = Column(Text, nullable=True)
    risks = Column(Text, nullable=True)
    kpis = Column(Text, nullable=True)
    success_metrics = Column(Text, nullable=True)
    timeline = Column(Text, nullable=True)
    release_plan = Column(Text, nullable=True)
    status = Column(String, default="Draft") # Draft, Approved
    stakeholders = Column(String, nullable=True)
    quality_score = Column(Integer, default=70)
    tenant_id = Column(String, default="tenant_default")
    team_id = Column(String, default="Core Delivery")
    workspace_id = Column(String, default="Alpha Sprint")

class PRDVersion(Base):
    __tablename__ = "prd_versions"

    id = Column(Integer, primary_key=True, index=True)
    prd_id = Column(Integer, nullable=False)
    version_num = Column(Integer, default=1)
    prd_data_json = Column(Text, nullable=False)
    updated_by = Column(String, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    file_type = Column(String, nullable=True)
    file_size_bytes = Column(Integer, default=0)
    url = Column(String, nullable=False)
    message_id = Column(Integer, nullable=True)
    document_id = Column(Integer, nullable=True)
    prd_id = Column(Integer, nullable=True)
    tenant_id = Column(String, default="tenant_default")

class MessageThread(Base):
    __tablename__ = "message_threads"

    id = Column(Integer, primary_key=True, index=True)
    parent_message_id = Column(Integer, nullable=False)
    reply_message_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    tenant_id = Column(String, default="tenant_default")

class MessageReaction(Base):
    __tablename__ = "message_reactions"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, nullable=False)
    user_email = Column(String, nullable=False)
    emoji = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    tenant_id = Column(String, default="tenant_default")

class Whiteboard(Base):
    __tablename__ = "whiteboards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    elements_json = Column(Text, default="[]") # Drawings, text, stickies
    template = Column(String, default="Brainstorm Board")
    tenant_id = Column(String, default="tenant_default")
    team_id = Column(String, default="Core Delivery")
    workspace_id = Column(String, default="Alpha Sprint")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class SharePermission(Base):
    __tablename__ = "share_permissions"

    id = Column(Integer, primary_key=True, index=True)
    resource_type = Column(String, nullable=False) # whiteboard, document, prd, meeting, dashboard
    resource_id = Column(Integer, nullable=False)
    user_email = Column(String, nullable=True) # Specific user or null for public/role-wide
    role = Column(String, nullable=True) # Specific role or null
    permission = Column(String, default="View") # View, Comment, Edit, Admin
    tenant_id = Column(String, default="tenant_default")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

