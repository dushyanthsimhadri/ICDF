from . import bcrypt_patch
from sqlalchemy.orm import Session
from passlib.hash import bcrypt
from db.models import (
    User, ProductBrainConfig, Ticket, IntegrationConnector, 
    GovernancePolicy, VectorDocument, WorkflowAction, Notification, 
    AutomationRule, AIGovernanceRule, AuditLog, PortfolioInitiative, 
    ReleaseTrain, ResourceAllocation, ScenarioSimulation,
    Channel, Message, Document, DocumentVersion, Meeting, MeetingSummary,
    PRD, PRDVersion, Attachment, Whiteboard, SharePermission
)
import datetime
import json

def seed_multitenant_data(db: Session):
    if db.query(User).count() > 0:
        return
        
    print("Seeding database with multi-tenant enterprise operations data...")
    
    # 1. Users
    users_data = [
        # Acme Corp (default tenant)
        ("admin@icdf.io", "Admin", "Engineering", "Core Delivery", "acme_corp"),
        ("executive@icdf.io", "Executive", "Leadership", "Executive Board", "acme_corp"),
        ("product_manager@icdf.io", "Product Manager", "Product", "Core Delivery", "acme_corp"),
        ("pm@icdf.io", "Product Manager", "Product", "Core Delivery", "acme_corp"),
        ("business_analyst@icdf.io", "Business Analyst", "Product", "Core Delivery", "acme_corp"),
        ("ba@icdf.io", "Business Analyst", "Product", "Core Delivery", "acme_corp"),
        ("product_owner@icdf.io", "Product Owner", "Product", "Core Delivery", "acme_corp"),
        ("po@icdf.io", "Product Owner", "Product", "Core Delivery", "acme_corp"),
        ("program_manager@icdf.io", "Program Manager", "Product", "Core Delivery", "acme_corp"),
        ("dev_lead@icdf.io", "Dev Lead", "Engineering", "Core Delivery", "acme_corp"),
        ("dev@icdf.io", "Developer", "Engineering", "Core Delivery", "acme_corp"),
        ("qa_lead@icdf.io", "QA Lead", "QA Team", "Core Delivery", "acme_corp"),
        ("qa@icdf.io", "QA Lead", "QA Team", "Core Delivery", "acme_corp"),
        ("governance_manager@icdf.io", "Governance Manager", "Governance", "Audit Squad", "acme_corp"),
        ("compliance@icdf.io", "Governance Manager", "Governance", "Audit Squad", "acme_corp"),
        
        # Globex Corp
        ("pm@globex.com", "Product Manager", "Product", "Globex PM Team", "globex_corp"),
        ("dev@globex.com", "Developer", "Engineering", "Globex Core Devs", "globex_corp"),
        
        # Initech
        ("pm@initech.com", "Product Manager", "Product", "Initech PMs", "initech"),
        ("dev@initech.com", "Developer", "Engineering", "Initech Devs", "initech")
    ]
    
    hashed_pw = bcrypt.hash("secret123")
    for email, role, dept, team, tenant in users_data:
        u = User(
            email=email,
            hashed_password=hashed_pw,
            role=role,
            department=dept,
            team=team,
            tenant_id=tenant,
            role_level=5 if role in ["Admin", "Executive"] else (3 if "Manager" in role or "Officer" in role else 1)
        )
        db.add(u)
    db.commit()
    
    # 2. Product Brain Configs
    default_roles = [
        "Executive",
        "Product Manager",
        "Business Analyst",
        "Product Owner",
        "Program Manager",
        "Dev Lead",
        "QA Lead",
        "Governance Manager",
        "Admin"
    ]
    tenants = ["acme_corp", "globex_corp", "initech"]
    for tenant in tenants:
        for idx, role in enumerate(default_roles):
            mode = "Hybrid" if idx % 2 == 0 else "AI Agent"
            model = "Llama3" if idx % 3 == 0 else ("Qwen" if idx % 3 == 1 else "DeepSeek")
            cfg = ProductBrainConfig(
                role_name=role,
                operating_mode=mode,
                ai_model=model,
                tenant_id=tenant
            )
            db.add(cfg)
    db.commit()

    # 3. Connectors
    connector_names = ["Jira", "GitHub", "Slack", "Linear", "Notion AI", "Otter.ai"]
    for tenant in tenants:
        for idx, name in enumerate(connector_names):
            if tenant == "acme_corp":
                status = "Connected" if name in ["Jira", "GitHub", "Slack"] else "Disconnected"
                health = 98 if name in ["Jira", "GitHub"] else 100
            elif tenant == "globex_corp":
                status = "Connected" if name in ["Slack", "Linear", "Otter.ai"] else "Disconnected"
                health = 85 if name == "Slack" else 100
            else: # Initech
                status = "Connected" if name in ["GitHub", "Notion AI"] else "Disconnected"
                health = 92
                
            c = IntegrationConnector(
                name=name,
                status=status,
                config_details=json.dumps({"url": f"https://api.connector.{name.lower().replace(' ', '')}.com"}),
                health_score=health,
                last_sync=datetime.datetime.utcnow() - datetime.timedelta(minutes=15 * idx),
                tenant_id=tenant
            )
            db.add(c)
    db.commit()

    # 4. Tickets
    tickets_data = {
        "acme_corp": [
            ("Configure Ollama DeepSeek & Llama3 models", "Install local Ollama runtime and initialize LLMs for Product Brain.", "To Do", "AI/ML Engineer", "High", 4, 15),
            ("Create Glassmorphic Dashboard layout", "Develop premium React sidebar and glass card elements with Tailwind CSS.", "In Progress", "Developer", "Medium", 3, 8),
            ("Fix Token Refreshes on Auth Middleware", "Session cookies sometimes fail to renew under high API throughput.", "Review", "Dev Lead", "Critical", 1, 40),
            ("Perform security scan on SQL connections", "Validate that database access handles inputs safely without leakage.", "Done", "Security Engineer", "High", 2, 5)
        ],
        "globex_corp": [
            ("Refactor Globex Core API Gateway", "Migrate legacy REST controllers to gRPC connections.", "In Progress", "Developer", "High", 5, 20),
            ("Globex SOC2 Framework Alignment", "Write policies for database credentials vaulting.", "To Do", "Product Manager", "Critical", 10, 30),
            ("Verify Globex Webhook Signatures", "Ensure incoming webhook triggers validate payload auth signatures.", "Done", "Dev Lead", "Medium", 2, 4)
        ],
        "initech": [
            ("Initech TPS Reports Automation", "Build pipeline to compile and deliver reports automatically.", "To Do", "Developer", "Low", 6, 2),
            ("Upgrade database indexing schema", "Optimize queries on large invoice tables.", "In Progress", "Dev Lead", "High", 3, 12),
            ("Fix password field validation regex", "Require numbers and special characters in credentials.", "Done", "Developer", "Medium", 1, 3)
        ]
    }
    for tenant, tkts in tickets_data.items():
        for title, desc, status, assignee, priority, velocity, risk in tkts:
            t = Ticket(
                title=title,
                description=desc,
                status=status,
                assignee=assignee,
                priority=priority,
                category="Feature" if status != "Bug" else "Bug",
                velocity_days=velocity,
                risk_score=risk,
                tenant_id=tenant
            )
            db.add(t)
    db.commit()

    # 5. Governance Policies
    policies_data = {
        "acme_corp": [
            ("SOC2 Security Framework Compliance", "All code and data storage must comply with SOC2 Trust Principles.", "High"),
            ("AI Data Leakage Prevention", "No proprietary delivery context should be synced to public AI wrappers.", "Critical"),
            ("Automated Rollback on SLA Breach", "Deployments breaching stability SLAs must undergo instantaneous automated fallback.", "Medium")
        ],
        "globex_corp": [
            ("Globex GDPR Data Residency", "Store all user and ticket metadata within approved geographic boundaries.", "High"),
            ("Globex Model Access Auditing", "Record prompt audit logs for every AI generation session.", "Critical")
        ],
        "initech": [
            ("Initech HIPAA Patient Data Isolation", "Secure all health metrics data under isolated vaults.", "Critical")
        ]
    }
    for tenant, pols in policies_data.items():
        for name, desc, sev in pols:
            p = GovernancePolicy(
                name=name,
                description=desc,
                severity=sev,
                status="Active",
                tenant_id=tenant
            )
            db.add(p)
    db.commit()

    # 6. Notifications
    notifications_data = {
        "acme_corp": [
            ("Slack Integration Failure", "Slack webhook integration sync failed. Re-authorization required.", "Connector", False),
            ("Risk Alert: Unencrypted Payload", "Security scanner detected unencrypted password payload on route /auth/register.", "Risk", False),
            ("Jira Ticket Approval", "Human override check required for deploying release build v2.4-RC.", "Workflow", False),
            ("AI Recommendation", "AI PM recommends prioritizing ticket ICDF-48 based on dependency weight.", "AI", False),
            ("Sprint Velocity Drop", "Velocity drop detected in Core Delivery team. Sprint confidence down to 88%.", "Release", True)
        ],
        "globex_corp": [
            ("Globex Connector Sync Alert", "Jira connection timed out for Globex tenant.", "Connector", False),
            ("AI Policy Violation", "User dev@globex.com attempted to paste raw SQL credentials to Ollama model.", "Risk", False)
        ],
        "initech": [
            ("Initech Deployment Alert", "Production build v1.0.8 compiled successfully.", "Release", False)
        ]
    }
    for tenant, notifs in notifications_data.items():
        for title, msg, cat, is_read in notifs:
            n = Notification(
                title=title,
                message=msg,
                category=cat,
                is_read=is_read,
                tenant_id=tenant
            )
            db.add(n)
    db.commit()

    # 7. Automation Rules
    rules_data = {
        "acme_corp": [
            ("SLA Breach Slack Notification", "Connector Failure", "Send Alert"),
            ("Critical Bug Ticket Escalation", "Risk Detected", "Create Ticket"),
            ("Standup Summary Documentation", "Meeting Created", "Update Docs")
        ],
        "globex_corp": [
            ("Globex Deployment Safety Lock", "Risk Detected", "Approval Request")
        ],
        "initech": [
            ("Initech Auto Jira Syncer", "Ticket Blocked", "Notify Stakeholders")
        ]
    }
    for tenant, rules in rules_data.items():
        for name, trigger, action in rules:
            r = AutomationRule(
                name=name,
                trigger=trigger,
                action=action,
                is_active=True,
                tenant_id=tenant
            )
            db.add(r)
    db.commit()

    # 8. AI Governance Rules
    gov_rules = {
        "acme_corp": [
            ("human_approval_jira", "approval", "true"),
            ("model_access_llama3", "model_access", "true"),
            ("model_access_deepseek", "model_access", "true"),
            ("sensitive_action_validation", "sensitive_action", "true"),
            ("prompt_policy_max_tokens", "prompt_policy", "4096")
        ],
        "globex_corp": [
            ("human_approval_jira", "approval", "false"),
            ("model_access_llama3", "model_access", "true"),
            ("model_access_deepseek", "model_access", "false"),
            ("sensitive_action_validation", "sensitive_action", "true"),
            ("prompt_policy_max_tokens", "prompt_policy", "2048")
        ],
        "initech": [
            ("human_approval_jira", "approval", "true"),
            ("model_access_llama3", "model_access", "false"),
            ("model_access_deepseek", "model_access", "true"),
            ("sensitive_action_validation", "sensitive_action", "false"),
            ("prompt_policy_max_tokens", "prompt_policy", "1024")
        ]
    }
    for tenant, rules in gov_rules.items():
        for rname, rtype, val in rules:
            rule = AIGovernanceRule(
                rule_name=rname,
                rule_type=rtype,
                setting_value=val,
                is_enabled=True,
                tenant_id=tenant
            )
            db.add(rule)
    db.commit()

    # 9. Ingest Knowledge Documents (RAG)
    knowledge_data = {
        "acme_corp": [
            ("PRD_websocket_specs.txt", "PRD", "Vite React client needs websocket handlers. Auto reconnect on 404. Latency target under 12ms. Relies on FastAPI routers in core backend api gateway."),
            ("Notion_SOC2_plan.md", "Docs", "All password columns must employ bcrypt. Passwords should never be stored in plain text. JWT secret token must be loaded from environment settings."),
            ("Slack_standup_logs.txt", "Slack", "PM: Discussed moving roadmap. Dev Lead says we need to configure local Ollama DeepSeek engine before finishing socket telemetry."),
            ("Jira_ticket_ICDF-48.txt", "Jira", "ICDF-48 ticket tracking oauth setup. Human approval loops required before merging code into staging pipelines.")
        ],
        "globex_corp": [
            ("Globex_API_Transition.md", "Docs", "Globex is upgrading from REST to gRPC for delivery pipelines to decrease telemetry delay to 2ms."),
            ("Globex_Slack_Standup.txt", "Slack", "Globex Dev: Security audits are blocker. We need approval policies before executing Jenkins builds.")
        ],
        "initech": [
            ("Initech_TPS_Report_Specs.txt", "PRD", "Automatic compilation of TPS reports requires configuring SMTP connector metrics."),
            ("Initech_Database_Optimizations.md", "Docs", "All financial transaction schemas require indexing on invoice IDs.")
        ]
    }
    for tenant, files in knowledge_data.items():
        for title, src, text in files:
            chunks = text.split()
            mock_embedding = [0.1] * 5
            doc = VectorDocument(
                file_name=title,
                source_type=src,
                text_content=text,
                vector_embeddings_json=json.dumps(mock_embedding),
                metadata_json=json.dumps({"seeded": True}),
                tenant_id=tenant
            )
            db.add(doc)
    db.commit()
    
    # 10. Audit Logs
    audit_data = [
        ("admin@icdf.io", "Login Activity", "Admin logged in successfully from Acme subnet.", "acme_corp"),
        ("pm@icdf.io", "Role Change", "Updated dev@icdf.io role from Developer to Dev Lead.", "acme_corp"),
        ("dev@icdf.io", "Connector Action", "Toggled Jira connector to CONNECTED.", "acme_corp"),
        ("pm@globex.com", "Login Activity", "Globex PM authenticated via Quick SSO.", "globex_corp"),
        ("dev@globex.com", "Workflow Execution", "Executed UAT verification validation rule automatically.", "globex_corp"),
        ("pm@initech.com", "Policy Update", "Enabled HIPAA data isolation framework constraint.", "initech")
    ]
    for email, action, details, tenant in audit_data:
        log = AuditLog(
            user_email=email,
            action=action,
            details=details,
            tenant_id=tenant,
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
        )
        db.add(log)
    db.commit()

    # ==========================================
    # 11. Seeding Portfolio Initiatives
    # ==========================================
    portfolio_data = {
        "acme_corp": [
            ("ICDF Unified Telemetry Grid", "Active", 150000, 65000, "Increase API delivery confidence to 95%", 92, "High latency on websocket handshakes."),
            ("AI PM Autopilot Integration", "Planning", 80000, 12000, "Automate 30% backlog stories", 85, "Risk of context overload on Llama3 endpoint."),
            ("Security Air-Gap Hardening", "On Hold", 120000, 95000, "Block proprietary leakages to public APIs", 98, "Waiting on SQLite password rotation patch.")
        ],
        "globex_corp": [
            ("Globex gRPC Ingestion Pipeline", "Active", 250000, 140000, "Standardize Globex microservices", 78, "Dependency conflicts on legacy REST wrappers.")
        ],
        "initech": [
            ("TPS Compliance Auditing", "Active", 50000, 42000, "Pass Initech TPS compliance review", 91, "TPS templates need auto compilations.")
        ]
    }
    for tenant, initiatives in portfolio_data.items():
        for name, status, budget, spent, goal, conf, risk in initiatives:
            p = PortfolioInitiative(
                name=name,
                status=status,
                budget=budget,
                spent=spent,
                strategic_goal=goal,
                delivery_confidence=conf,
                risk_summary=risk,
                tenant_id=tenant
            )
            db.add(p)
    db.commit()

    # ==========================================
    # 12. Seeding Release Trains
    # ==========================================
    releases_data = {
        "acme_corp": [
            ("ICDF Release Train v2.4", "Staging", "Staging", datetime.datetime.utcnow() + datetime.timedelta(days=2), "Pending", [
                {"task": "Security vulnerability scan pass", "done": True},
                {"task": "Verify database backup rotation", "done": False},
                {"task": "Obtain lead compliance approval", "done": True}
            ]),
            ("Websockets Patch RC-1", "Ready", "Production", datetime.datetime.utcnow() - datetime.timedelta(hours=6), "Go", [
                {"task": "WebSocket latency checks pass (<12ms)", "done": True},
                {"task": "QA regression test suites check", "done": True}
            ])
        ],
        "globex_corp": [
            ("Globex Core API v1.2", "Blocked", "Production", datetime.datetime.utcnow() + datetime.timedelta(days=5), "No-Go", [
                {"task": "gRPC payload size validation", "done": False},
                {"task": "SSL key rotation validation", "done": False}
            ])
        ],
        "initech": [
            ("TPS Reports Engine v1.0", "Planning", "QA", datetime.datetime.utcnow() + datetime.timedelta(days=10), "Pending", [
                {"task": "Generate template schemas", "done": True}
            ])
        ]
    }
    for tenant, rels in releases_data.items():
        for name, status, env, rdate, gng, checklist in rels:
            r = ReleaseTrain(
                name=name,
                status=status,
                environment=env,
                release_date=rdate,
                go_no_go_status=gng,
                checklist_json=json.dumps(checklist),
                tenant_id=tenant
            )
            db.add(r)
    db.commit()

    # ==========================================
    # 13. Seeding Resource Allocations
    # ==========================================
    resources_data = {
        "acme_corp": [
            ("pm@icdf.io", 80, "Product Management, Agile, Jira", 25),
            ("dev@icdf.io", 100, "React, Tailwind, FastAPI, SQLite", 40),
            ("compliance@icdf.io", 60, "SOC2 Audit, Security, Policies", 10),
            ("executive@icdf.io", 40, "Leadership, Strategic Planning", 15)
        ],
        "globex_corp": [
            ("pm@globex.com", 90, "Project Management, gRPC, Linear", 35),
            ("dev@globex.com", 120, "Golang, Protobuf, Kubernetes", 85)
        ],
        "initech": [
            ("pm@initech.com", 100, "TPS Reporting, Notion AI", 50),
            ("dev@initech.com", 75, "Python, Excel VBA, Shell Scripting", 15)
        ]
    }
    for tenant, reslist in resources_data.items():
        for email, pct, skills, risk in reslist:
            r = ResourceAllocation(
                user_email=email,
                allocated_percentage=pct,
                skill_tags=skills,
                burnout_risk_score=risk,
                tenant_id=tenant
            )
            db.add(r)
    db.commit()

    # ==========================================
    # 14. Seeding Scenario Simulations
    # ==========================================
    scenarios_data = {
        "acme_corp": [
            ("sprint_slip_2w", "If sprint slips by 2 weeks, release train v2.4 will miss UAT deadline, increasing security vulnerability window by 14 days.", "High", 14, "Deploy websockets patch RC-1 independently to protect core gateways."),
            ("capacity_drop_20", "A 20% capacity drop inside Acme Core Delivery team (e.g. key developer leaves) reduces velocity score from 88 to 72.", "Medium", 10, "De-prioritize non-critical telemetry tickets and re-allocate DevOps squads."),
            ("dependency_unresolved", "If local Ollama model integration remains unresolved, AI PM PMs Assistant features will fallback to offline mock generators.", "Low", 3, "Increase Ollama server RAM constraints and verify GPU drivers status.")
        ],
        "globex_corp": [
            ("sprint_slip_2w", "If sprint slips 2 weeks, gRPC migration timeline pushes past Q3 audit gates.", "High", 14, "Re-allocate Golang developers from secondary projects.")
        ],
        "initech": [
            ("capacity_drop_20", "TPS reports automation drops velocity due to excel workbook locking conflicts.", "Medium", 8, "MigrateTPS scripts directly to pandas/python modules.")
        ]
    }
    for tenant, scens in scenarios_data.items():
        for name, forecast, risk, delay, rec in scens:
            s = ScenarioSimulation(
                scenario_name=name,
                forecast_summary=forecast,
                risk_impact_level=risk,
                timeline_delay_days=delay,
                recommendation=rec,
                tenant_id=tenant
            )
            db.add(s)
    db.commit()

    # ==========================================
    # 15. Seeding Upgraded Workflow Approvals
    # ==========================================
    approvals_data = {
        "acme_corp": [
            ("PRD Approval", "PRD Spec validation: WebSockets telemetry transition", "Awaiting Approval", "acme_corp", "Waiting on architect alignment and memory profiling tests.", "Standard", 12),
            ("Budget Approval", "Allocate $5,000 for Ollama local GPU cluster node", "Awaiting Approval", "acme_corp", "Required to speed up PM assistant text summaries.", "Escalated", 6),
            ("Release Approval", "v2.4-RC Staging release signoff", "Awaiting Approval", "acme_corp", "Staging verification tests completed with 94.2% stability.", "Standard", 48),
            ("Governance Approval", "SOC2 compliance policies audit check", "Approved", "acme_corp", "Compliance officer checked encryption keys hash.", "Standard", 24)
        ],
        "globex_corp": [
            ("Release Approval", "Globex Core API v1.2 release signoff", "Awaiting Approval", "globex_corp", "Blocked by Go/No-Go reviews.", "Escalated", 24)
        ],
        "initech": [
            ("PRD Approval", "PRD TPS reports compiler specs", "Awaiting Approval", "initech", "Seeded specs waiting on finance review.", "Standard", 72)
        ]
    }
    for app_type, title, status, tenant, comments, esc, sla in approvals_data.get(tenant, []):
        pass # We will seed them inside the loop
    # Let's seed them cleanly for all tenants
    for tenant, applist in approvals_data.items():
        for app_type, title, status, _, comments, esc, sla in applist:
            act = WorkflowAction(
                action_type=app_type,
                status=status,
                payload=json.dumps({"title": title, "details": f"Centralized approval override for {app_type}"}),
                approval_required=True,
                tenant_id=tenant,
                comments=comments,
                escalation_status=esc,
                sla_deadline_hours=sla
            )
            db.add(act)
    db.commit()

    # ==========================================
    # 16. Seeding PM Workspace Data
    # ==========================================
    default_channels = [
        "pm-command", "roadmap", "release-planning", "stakeholders", 
        "delivery", "cross-team-dependencies", "executive-updates",
        "executive", "product", "engineering", "qa", "governance", 
        "release-war-room", "incident-response"
    ]
    
    for tenant in tenants:
        # Seed channels
        channel_objs = {}
        for chan_name in default_channels:
            c = Channel(
                name=f"#{chan_name}",
                tenant_id=tenant,
                team_id="Core Delivery" if tenant == "acme_corp" else "Globex PM Team" if tenant == "globex_corp" else "Initech PMs",
                workspace_id="Alpha Sprint"
            )
            db.add(c)
            db.flush() # populate ID
            channel_objs[chan_name] = c.id
        
        # Seed messages in `#pm-command` and `#roadmap`
        pm_email = "pm@icdf.io" if tenant == "acme_corp" else "pm@globex.com" if tenant == "globex_corp" else "pm@initech.com"
        dev_email = "dev@icdf.io" if tenant == "acme_corp" else "dev@globex.com" if tenant == "globex_corp" else "dev@initech.com"
        
        # Messages in pm-command
        m1 = Message(
            channel_id=channel_objs["pm-command"],
            user_email=pm_email,
            content="Welcome to the PM Command center! Here we coordinate roadmap timelines and dependencies.",
            reactions_json=json.dumps({"👍": [dev_email]}),
            tenant_id=tenant
        )
        m2 = Message(
            channel_id=channel_objs["pm-command"],
            user_email=dev_email,
            content="Agreed. Ready to link standard connector endpoints. Let's make sure the vectors are seeded.",
            tenant_id=tenant
        )
        db.add_all([m1, m2])
        
        # Seed Documents
        doc1 = Document(
            title="Q3 Product Strategy",
            content="Our primary focus for Q3 is transitioning our continuous delivery triggers into WebSocket streams, reducing telemetry overhead by 40%.",
            folder="Strategy Docs",
            tenant_id=tenant
        )
        doc2 = Document(
            title="Competitive Analysis - CI/CD Platforms",
            content="Compared to legacy CI/CD dashboards, ICDF reduces user context switches by integrating Otter transcripts and Notion PRDs in one tenant environment.",
            folder="Research Notes",
            tenant_id=tenant
        )
        db.add_all([doc1, doc2])
        db.flush()
        
        # Seed document versions
        ver1 = DocumentVersion(
            document_id=doc1.id,
            version_num=1,
            content=doc1.content,
            updated_by=pm_email
        )
        ver2 = DocumentVersion(
            document_id=doc2.id,
            version_num=1,
            content=doc2.content,
            updated_by=pm_email
        )
        db.add_all([ver1, ver2])
        
        # Seed Meetings
        meeting_types = [
            ("Sprint 4 Planning Session", "Sprint Planning", "Discussed payments story sizes. Refined websocket pipeline items."),
            ("Daily Standup Sync", "Standup", "Dev Lead: Websocket routers are 90% finalized. QA: Testing load constraints on local Ollama containers."),
            ("Executive Roadmap Review", "Roadmap Review", "VP approved budget extensions for local GPU nodes to improve PM assistant performance.")
        ]
        for title, mtype, summary in meeting_types:
            mt = Meeting(
                title=title,
                meeting_type=mtype,
                transcript_text=f"PM: Let's discuss {title}. Dev: I am working on the telemetry backend. QA: Testing regression suites.",
                summary=summary,
                status="Completed",
                date=datetime.datetime.utcnow() - datetime.timedelta(days=2),
                speaker_timeline_json=json.dumps([
                    {"speaker": "PM", "text": "Let's review the active timeline tasks.", "start": "00:00", "end": "00:30"},
                    {"speaker": "Dev", "text": "Telemetry routes are ready. Link checking is active.", "start": "00:30", "end": "01:20"}
                ]),
                metadata_json=json.dumps({
                    "actions": ["Review automated PRD outlines by dev lead.", "Establish vector store seeding limits."],
                    "requirements": ["WebSocket low-latency telemetry API", "Strict tenant-id access filtering rules"],
                    "risks": ["SLA breaches on database locks", "Token expiration issues on connectors"],
                    "dependencies": ["Ollama REST endpoint capacity availability"],
                    "follow_ups": ["Configure SMTP webhook templates for alerts."]
                }),
                tenant_id=tenant,
                team_id="Core Delivery",
                workspace_id="Alpha Sprint"
            )
            db.add(mt)
            db.flush()
            
            # Seed Meeting Summary
            ms = MeetingSummary(
                meeting_id=mt.id,
                summary_text=summary
            )
            db.add(ms)
            
        # Seed PRDs
        prd = PRD(
            title="WebSockets Telemetry Transition PRD",
            overview="Transitioning the ICDF framework from REST-based polling to live WebSocket streaming to minimize API latency.",
            problem_statement="Legacy polling routes create unnecessary database reads and connector load spikes.",
            goals="Targeting 12ms WebSocket handshake latency and 100% tenant workspace isolation.",
            objectives="Reduce backend CPU usage by 40% and support real-time PM dashboard refreshes.",
            scope="Applies to the active workspace telemetry feed. Excludes legacy PDF exports.",
            requirements_json=json.dumps([
                "API gateway must expose a secure WS endpoint",
                "Workloads matrix must update live",
                "Reconnection handler with exponential backoff must be implemented"
            ]),
            user_stories_json=json.dumps([
                "As a Product Manager, I want live telemetry updates so that I can monitor release gates instantly.",
                "As a Dev Lead, I want websocket connections scoped by tenant ID to prevent cross-org leaks."
            ]),
            acceptance_criteria_json=json.dumps([
                "WS handshake completes in under 15ms",
                "Closing Vite browser window cleanly terminates session connection in backend"
            ]),
            dependencies="FastAPI WebSocket utilities and SQLite concurrent read/write locks.",
            risks="Websocket connections dropping during network switches.",
            kpis="Handshake duration, concurrent socket connections, message dispatch delay.",
            success_metrics="Avg CPU usage under 5% during active release release train.",
            timeline="WS core engine setup: 1 week. QA load testing: 1 week. Production roll: 1 week.",
            release_plan="Deliver in v2.5.0-RC1 release train.",
            status="Draft",
            stakeholders="PM, Dev Lead, Executive Sponsor",
            quality_score=85,
            tenant_id=tenant,
            team_id="Core Delivery",
            workspace_id="Alpha Sprint"
        )
        db.add(prd)
        db.flush()
        
        prd_ver = PRDVersion(
            prd_id=prd.id,
            version_num=1,
            prd_data_json=json.dumps({
                "title": prd.title,
                "overview": prd.overview,
                "requirements": json.loads(prd.requirements_json)
            }),
            updated_by=pm_email
        )
        db.add(prd_ver)

        # Seed Whiteboards
        wb1 = Whiteboard(
            title="Q3 Roadmap Planning Board",
            template="Roadmap Workshop",
            elements_json=json.dumps([
                {"id": "w1", "type": "sticky", "text": "Q3 Key Target: Socket Telemetry Setup", "x": 100, "y": 150, "color": "#2563eb"},
                {"id": "w2", "type": "sticky", "text": "SSO Integrations & Role portals", "x": 350, "y": 150, "color": "#16a34a"},
                {"id": "w3", "type": "sticky", "text": "UX design clean slate style", "x": 600, "y": 150, "color": "#9333ea"}
            ]),
            tenant_id=tenant,
            team_id="Core Delivery",
            workspace_id="Alpha Sprint"
        )
        wb2 = Whiteboard(
            title="Core Architecture Design Sketch",
            template="Architecture Session",
            elements_json=json.dumps([
                {"id": "ae1", "type": "sticky", "text": "React Vite app on 5173", "x": 100, "y": 200, "color": "#0d9488"},
                {"id": "ae2", "type": "sticky", "text": "FastAPI ASGI on 8000", "x": 400, "y": 200, "color": "#2563eb"},
                {"id": "ae3", "type": "sticky", "text": "SQLite backend file icdf.db", "x": 700, "y": 200, "color": "#4f46e5"}
            ]),
            tenant_id=tenant,
            team_id="Core Delivery",
            workspace_id="Alpha Sprint"
        )
        db.add_all([wb1, wb2])
        db.flush()

        # Seed Share Permissions
        sp1 = SharePermission(
            resource_type="whiteboard",
            resource_id=wb1.id,
            user_email="dev@icdf.io" if tenant == "acme_corp" else "dev@globex.com",
            permission="Edit",
            tenant_id=tenant
        )
        sp2 = SharePermission(
            resource_type="document",
            resource_id=doc1.id,
            role="Executive",
            permission="View",
            tenant_id=tenant
        )
        db.add_all([sp1, sp2])
        
    db.commit()

    print("Multi-Tenant database seeding completed successfully.")
