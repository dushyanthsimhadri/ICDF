import httpx
import json
import logging
import os
from typing import List, Dict, Any, Optional

logger = logging.getLogger("uvicorn.error")

class OllamaService:
    def __init__(self, base_url: str = None):
        self.base_url = base_url or os.getenv("OLLAMA_HOST", "http://localhost:11434")
        self.default_model = "qwen"


    async def is_connected(self) -> bool:
        """Check if local Ollama service is up and reachable."""
        try:
            async with httpx.AsyncClient(timeout=1.5) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
        except Exception as e:
            logger.warning(f"Ollama connection check failed: {e}")
            return False

    async def get_available_models(self) -> List[str]:
        """Fetch models installed on local Ollama, fallback to default options."""
        default_list = ["llama3", "mistral", "deepseek-coder", "qwen"]
        try:
            async with httpx.AsyncClient(timeout=1.5) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                if response.status_code == 200:
                    data = response.json()
                    models = [m["name"].split(":")[0] for m in data.get("models", [])]
                    # Ensure our supported models are listed or unioned
                    return list(set(models + default_list))
        except Exception:
            pass
        return default_list


    async def chat_completion(self, model: str, messages: List[Dict[str, str]], fallback_type: str, payload: Any = None) -> Dict[str, Any]:
        """
        Call Ollama chat API. If Ollama is offline, route to the smart simulation engine.
        """
        ollama_active = await self.is_connected()
        
        if ollama_active:
            try:
                # Prepare payload
                request_payload = {
                    "model": model,
                    "messages": messages,
                    "stream": False,
                    "options": {
                        "temperature": 0.7
                    }
                }
                
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(f"{self.base_url}/api/chat", json=request_payload)
                    if response.status_code == 200:
                        result = response.json()
                        content = result.get("message", {}).get("content", "")
                        return {
                            "content": content,
                            "model": model,
                            "source": "ollama",
                            "status": "success"
                        }
                    else:
                        logger.error(f"Ollama returned error status: {response.status_code}")
            except Exception as e:
                logger.error(f"Error calling Ollama chat API: {e}")
        
        # If offline or errored, run smart fallback simulator
        logger.info("Using smart fallback generator.")
        simulated_content = self.generate_simulated_response(fallback_type, payload)
        return {
            "content": simulated_content,
            "model": f"{model} (Simulated)",
            "source": "fallback",
            "status": "fallback"
        }


    def generate_simulated_response(self, fallback_type: str, payload: Any) -> Any:
        """
        Smart offline simulation engine. Dynamically reads user's input variables
        and generates highly relevant, detailed, professional PM answers.
        """
        if fallback_type == "prd":
            notes = payload.get("notes", "New Feature")
            # Extract basic title
            title = notes.split("\n")[0][:60]
            if len(notes) < 40:
                title = notes
            
            return f"""# Product Requirement Document (PRD)

## 1. Problem Statement
The current experience around **"{title}"** lacks efficiency, causing friction for target users. Customer feedback indicates a significant demand for a more streamlined, automated, and intuitive interface to solve this specific pain point. Without this feature, we see drop-offs in user engagement and lower-than-average retention in core cycles.

## 2. Product Vision & Goals
*   **Vision**: To deliver an industry-leading, seamless solution for **"{title}"** that empowers users and boosts overall satisfaction.
*   **Primary Goal**: Increase feature adoption rate by 35% in the first quarter post-launch.
*   **Secondary Goal**: Reduce user task completion time by 50%.

## 3. User Personas
### Persona A: Sarah - The Busy Professional
*   **Need**: A quick, friction-free way to manage tasks without digging through complex settings.
*   **Pain Point**: Existing tools are cluttered and slow.
### Persona B: Alex - The Tech-Savvy Builder
*   **Need**: Powerful integrations, shortcuts, and deep customization features.
*   **Pain Point**: Rigid interfaces with poor API support.

## 4. Functional Requirements
1.  **FR-01: Quick Creation Panel** - Users must be able to input content from any dashboard view with auto-save.
2.  **FR-02: Smart Recommendation Engine** - Suggest relevant tags and next steps based on historical patterns.
3.  **FR-03: Multi-channel Export** - Support exporting to CSV, PDF, and direct sync with common productivity tools.
4.  **FR-04: Offline Support** - Save edits locally and automatically sync once a stable connection is restored.

## 5. Non-Functional Requirements
*   **NFR-01 (Performance)**: Page loading and visual feedback must occur in < 200ms.
*   **NFR-02 (Security)**: All data stored in transit and at rest must be encrypted using AES-256.
*   **NFR-03 (Scalability)**: System must handle up to 10,000 concurrent requests without latency spikes.

## 6. Success Metrics
*   **Core Metric**: Active Monthly Users (MAU) utilizing this feature.
*   **North Star**: Customer Satisfaction Score (CSAT) of 4.5/5.0 for the feature lifecycle.
*   **Funnel Metric**: Conversion rate from feature discovery to completion (> 60%).

## 7. Risks & Mitigation
*   **Risk**: High onboarding learning curve for non-technical users.
    *   *Mitigation*: Design interactive micro-walkthroughs and tooltips.
*   **Risk**: Performance bottleneck in recommendation latency.
    *   *Mitigation*: Implement client-side caching and background pre-fetching.

## 8. Dependencies
*   Backend API upgrade (v2 endpoint for recommendation engine).
*   UX Design Team approval on the simplified panel wireframes.
"""

        elif fallback_type == "analytics":
            prd = payload.get("prd", "")
            
            has_payment = "payment" in prd.lower() or "billing" in prd.lower() or "checkout" in prd.lower() or "price" in prd.lower()
            
            hierarchy = {
                "business_goal": "Maximize platform monetization and checkout efficiency" if has_payment else "Boost platform weekly engagement and active user retention",
                "north_star": "Monthly Active Booking Transactions" if has_payment else "Weekly Active User Retention Rate",
                "primary_metrics": [
                    "Checkout Conversion Rate (Funnel completion)",
                    "User Session Duration (Core workflows)"
                ],
                "secondary_metrics": [
                    "SMS verification code latency",
                    "Clinician booking approval speed",
                    "OTP validation failure rate"
                ]
            }

            event_taxonomy = [
                {
                    "event_name": "booking_flow_initiated",
                    "trigger": "Patient clicks 'schedule appointment' link in text reminder",
                    "properties": "entry_point: str, user_segment: str"
                },
                {
                    "event_name": "otp_requested",
                    "trigger": "Patient inputs phone number and submits form",
                    "properties": "carrier_type: str, request_timestamp: int"
                },
                {
                    "event_name": "otp_verified",
                    "trigger": "Patient inputs the correct 4-digit verification code",
                    "properties": "attempts_count: int, duration_seconds: int"
                },
                {
                    "event_name": "booking_approved_clinician",
                    "trigger": "Clinic nurse clicks 'Confirm' on approval dashboard",
                    "properties": "clinician_id: str, lag_seconds: int"
                }
            ]

            ab_test = {
                "hypothesis": "If we replace browser-redirect magic links with localized 4-digit SMS OTP codes, then booking request completion rates will increase by 12% relatively.",
                "kpis": "Primary: OTP verification rate. Guardrail: User support requests for login issues.",
                "success_criteria": "Relative conversion boost >= 10% with statistical significance p < 0.05.",
                "duration": "14 days based on average weekly traffic volume"
            }

            review = [
                {
                    "role": "Product Owner",
                    "name": "Marcus (PO)",
                    "avatar": "PO",
                    "comment": "The metric hierarchy maps perfectly to our core OKR. Deferring EHR synchronization makes this tracking flow highly feasible."
                },
                {
                    "role": "Business Analyst",
                    "name": "Nadia (BA)",
                    "avatar": "BA",
                    "comment": "We must verify the monetization loop. Tracking the average checkout value alongside conversion rate is crucial for ROI reviews."
                },
                {
                    "role": "Data Analyst",
                    "name": "Elena (Data Analyst)",
                    "avatar": "DATA",
                    "comment": "I approve the event taxonomy. The properties are clean. Let's make sure Segment libraries are loaded asynchronously so page latency remains under 200ms."
                },
                {
                    "role": "Business User",
                    "name": "Emma (Marketing)",
                    "avatar": "MKT",
                    "comment": "I need the funnel view loaded in a Mixpanel dashboard so we can track campaign performance on day 1."
                },
                {
                    "role": "Real User",
                    "name": "Thomas (Patient)",
                    "avatar": "USR",
                    "comment": "If the SMS verification takes more than 15 seconds to arrive, I will leave. Tracking delivery speed is the most important indicator of frustration."
                }
            ]

            risks = [
                {
                    "type": "Vanity Metric Focus",
                    "description": "Tracking total SMS sent rather than OTP code completion rate. High volume of texts sent doesn't guarantee bookings.",
                    "mitigation": "Set booking_approved_clinician as the absolute North Star metric for success."
                },
                {
                    "type": "Telemetry Gaps",
                    "description": "Missing client-side error event tracking. We won't know if patients fail to submit because of validation bugs.",
                    "mitigation": "Add an event trigger for client_validation_error with details on input field failures."
                },
                {
                    "type": "Sample Ratio Mismatch (SRM)",
                    "description": "Risk of random routing imbalance during A/B tests causing skewed analytical data.",
                    "mitigation": "Set up a daily automated Chi-Square test script in the Amplitude dashboard to monitor SRM."
                }
            ]

            maturity_advisor = {
                "level": "Maturity Level 2: Core Event Tracking (Reactive analytics)",
                "recommendations": "### 📈 Analytics Maturity Roadmap\n1.  **Phase 1 (Immediate)**: Instrument **Segment** as the telemetry router, sending data to **Mixpanel** for product funnel dashboards.\n2.  **Phase 2 (Growth)**: Set up a central data warehouse (**Snowflake**) and use **DBT** to write clean conversion models.\n3.  **Phase 3 (Enterprise)**: Run predictive cohort engagement alerts using reverse-ETL tools (**Census** or **Hightouch**)."
            }

            strategy_body = f"""# AI Product Analytics Strategy Report

## 1. Executive Summary
This blueprint details the instrumentation plan for the active PRD context. By structuring event tracking around user milestones, we ensure diagnostic visibility into conversion drop-offs.

## 2. Recommended Telemetry Framework
*   **Data Router**: Segment (Single integration point)
*   **Product Analytics**: Mixpanel or Amplitude (For funnel reviews and cohort segments)
*   **Error Instrumentation**: Sentry (For client and server exception logs)
*   **Warehouse Sync**: Stitch/Fivetran to sync events to BigQuery.
"""

            return {
                "hierarchy": hierarchy,
                "event_taxonomy": event_taxonomy,
                "ab_test": ab_test,
                "review": review,
                "risks": risks,
                "maturity_advisor": maturity_advisor,
                "content": strategy_body,
                "status": "fallback"
            }


        elif fallback_type == "stories":
            prd = payload.get("prd", "")
            # Return list of dicts directly for stories
            return [
                {
                    "id": "US-101",
                    "title": "User Creation Panel Interface",
                    "description": "As a regular user, I want a clean overlay panel so that I can quickly initialize new items without navigating away.",
                    "acceptance_criteria": "Given I am on any dashboard page, when I click 'Create New', then a glassmorphism modal opens. The modal has input fields, auto-focuses the title field, and supports Cmd/Ctrl + Enter to submit.",
                    "priority": "Must",
                    "story_points": 5,
                    "epic": "Core Experience"
                },
                {
                    "id": "US-102",
                    "title": "Backend Sync and Auto-Save",
                    "description": "As a system user, I want my drafts auto-saved every 30 seconds so that I don't lose data in case of connection losses.",
                    "acceptance_criteria": "Given the user has modified input fields, when 30 seconds pass without manual save, then the client sends draft state to backend. Show a subtle 'Saved draft' micro-animation in the footer.",
                    "priority": "Must",
                    "story_points": 8,
                    "epic": "Data Infrastructure"
                },
                {
                    "id": "US-103",
                    "title": "Export to Multi-channel Formats",
                    "description": "As a power user, I want to export my analytics and PRD directly as PDF and Markdown, so I can share them externally.",
                    "acceptance_criteria": "Given a completed PRD, when I click 'Export Markdown', then a file downloads automatically with the name 'prd_[timestamp].md'. File contents must be clean Markdown.",
                    "priority": "Should",
                    "story_points": 3,
                    "epic": "Integrations"
                },
                {
                    "id": "US-104",
                    "title": "Interactive Analytics Event Tracking",
                    "description": "As a Product Analyst, I want telemetry events dispatched for key click interactions, so we can track the funnels.",
                    "acceptance_criteria": "Verify that custom Segment analytics events (e.g. `feature_initiated`, `feature_completed`) are fired with standard context schemas.",
                    "priority": "Could",
                    "story_points": 2,
                    "epic": "Telemetry & Analytics"
                }
            ]

        elif fallback_type == "strategy":
            opt_a = payload.get("option_a", "Option A")
            opt_b = payload.get("option_b", "Option B")
            goal = payload.get("goal", "Maximize User Engagement")
            constraints = payload.get("constraints", "Limited engineering resources (2 developers, 3 weeks)")
            
            return f"""# Strategy Analysis: {opt_a} vs. {opt_b}
**Strategic Goal**: {goal}
**Constraints**: {constraints}

## 1. Business Impact Analysis
*   **{opt_a}**: Offers a direct contribution to growth and customer acquisition. By focusing on this, we can tap into viral loops and organic expansion. Estimated conversion increase: **+18%**.
*   **{opt_b}**: Prioritizes retention, platform reliability, or branding value. This protects existing revenue but does not actively drive top-of-funnel discovery. Estimated customer satisfaction increase: **+22%**.

## 2. User Impact Assessment
*   **{opt_a}**: Solves an immediate, high-friction pain point for new users. Enhances first-time experience.
*   **{opt_b}**: Highly appreciated by power users, but minor impact on general user activation.

## 3. Engineering & Delivery Complexity
*   **{opt_a}**: **Medium-High Complexity**. Requires custom integrations, database migration, and secondary API routing.
*   **{opt_b}**: **Low-Medium Complexity**. Mostly visual, front-end adjustments with minimal backend logical changes. Can be shipped quickly.

## 4. Tradeoff Analysis Matrix
| Evaluation Factor | {opt_a} | {opt_b} |
| :--- | :--- | :--- |
| **Speed to Market** | 🔴 Slow (4-5 weeks) | 🟢 Fast (1-2 weeks) |
| **Risk of Delay** | 🟡 Medium (API dependencies) | 🟢 Low (isolated component) |
| **KPI Uplift Potential** | 🟢 High (User Growth) | 🟡 Medium (User Retention) |
| **Resource Cost** | 🔴 High | 🟢 Low |

## 5. Recommendation & Next Steps
We strongly recommend proceeding with **"{opt_a}"** as the primary focus, followed by **"{opt_b}"** in the subsequent sprint. 
*   *Rationale*: Although Option A requires more development time, it directly hits our target goal of **"{goal}"**. To fit within the constraints of **"{constraints}"**, we recommend scoping down Option A to an MVP that skips external syncing, saving approximately 40% of development overhead.
"""

        elif fallback_type == "warroom":
            features = payload.get("features", ["Feature A", "Feature B"])
            objective = payload.get("objective", "Boost Revenue")
            constraints = payload.get("constraints", "Short timeline")
            
            feat_list_str = ", ".join(features)
            
            comments = [
                {
                    "role": "Product Owner",
                    "name": "Marcus (PO)",
                    "avatar": "PO",
                    "opinion": f"We must prioritize the feature that aligns closest with '{objective}'. In my view, that's {features[0]}.",
                    "concerns": f"If we delay {features[0]}, we risk losing our primary competitive edge in the upcoming quarter.",
                    "risks": "Market shift towards competitors offering this standard capability.",
                    "effort": "High strategic importance",
                    "kpi_impact": "+15% Signup Conversion",
                    "recommendation": f"Prioritize {features[0]} immediately, defer other features."
                },
                {
                    "role": "Business Analyst",
                    "name": "Nadia (BA)",
                    "avatar": "BA",
                    "opinion": f"The market research shows that {features[0]} has a total addressable market 3x larger than {features[-1] if len(features) > 1 else 'the alternative'}.",
                    "concerns": f"The customer acquisition cost (CAC) might be high initially.",
                    "risks": "Overestimating the immediate conversion boost.",
                    "effort": "Requires careful tracking of customer sign-up paths.",
                    "kpi_impact": "+20% Customer Lifetime Value (LTV)",
                    "recommendation": f"Move forward with {features[0]} but start tracking user acquisition channels early."
                },
                {
                    "role": "Dev Lead",
                    "name": "Sanjay (Dev Lead)",
                    "avatar": "DEV",
                    "opinion": f"Technically, {features[0]} requires major changes to our data pipeline. Given '{constraints}', this will be extremely tight.",
                    "concerns": f"If we build {features[0]} in this timeline, we will accumulate massive technical debt.",
                    "risks": "Bugs in production, system instability, team burnout.",
                    "effort": "25 Story Points (Very High)",
                    "kpi_impact": "-5% Page Load Performance (initially)",
                    "recommendation": f"I strongly advise scoping down {features[0]} or prioritizing {features[-1] if len(features) > 1 else 'the simpler option'} which is only 8 Story Points."
                },
                {
                    "role": "UX Lead",
                    "name": "Chloe (UX Lead)",
                    "avatar": "UX",
                    "opinion": f"I agree with Sanjay. {features[0]} is a complex user flow that needs extensive user testing to get right. We shouldn't rush the UX.",
                    "concerns": "A poorly designed UX will lead to high drop-off rates, undermining the strategy.",
                    "risks": "Frustrated users, poor app store reviews, user churn.",
                    "effort": "Medium (requires prototype tests)",
                    "kpi_impact": "+30% CSAT if done right; -20% if rushed",
                    "recommendation": f"If we build {features[0]}, we need at least 1 week of user testing before Dev starts coding."
                },
                {
                    "role": "Data Analyst",
                    "name": "Elena (Data Analyst)",
                    "avatar": "DATA",
                    "opinion": f"We lack baseline telemetry on {features[-1] if len(features) > 1 else 'alternative paths'}. That said, historical product data suggests {features[0]} features have a 40% higher return visit frequency.",
                    "concerns": "We need custom event logging set up immediately.",
                    "risks": "Flying blind without proper event tags for the first 2 weeks.",
                    "effort": "Low (2 Story Points for telemetry)",
                    "kpi_impact": "+12% Repeat Engagement",
                    "recommendation": "Instrument all key events on day one, regardless of the choice."
                },
                {
                    "role": "QA Lead",
                    "name": "Dave (QA Lead)",
                    "avatar": "QA",
                    "opinion": f"Testing {features[0]} will require extensive integration testing and multi-platform regression scripts.",
                    "concerns": f"QA cycles will be squeezed to zero if Dev Lead hits delay during implementation.",
                    "risks": "Releasing critical functional bugs to production.",
                    "effort": "High (Requires 5 full days of regression)",
                    "kpi_impact": "Zero defect escape target",
                    "recommendation": "Require dev freezes 4 days before release to allow testing."
                }
            ]

            conflict_analysis = f"""### ⚡ Strategic Conflict Analysis
1.  **Scope vs. Timeline Clash**: The Product Owner & Business Analyst are pushing hard for **{features[0]}** to hit growth goals. However, the Dev Lead & UX Lead warn that doing so under the constraint **"{constraints}"** will result in massive tech debt, poor user experience, and delivery delays.
2.  **QA Risk vs. Agility**: QA Lead Dave requires a 4-day code freeze, which directly conflicts with the PO's desire to build and ship right up to the deadline.
"""

            final_rec = f"""### 🏆 Final AI PM Recommendation & Resolution
Based on the war room deliberation, the team should proceed with a **Phased Launch of {features[0]}**:
*   **Phase 1 (Sprint 1)**: Build a **Scoped-Down MVP** of {features[0]} focusing solely on the core workflow (skipping complex data exports and secondary configurations). This reduces Sanjay's dev effort from 25 to 12 story points.
*   **Phase 2 (Sprint 2)**: UX Lead Chloe will run prototype testing for advanced configurations in parallel, which Dev will implement in Sprint 2.
*   **Compromise**: PO Marcus agrees to a 2-day QA freeze in exchange for Dev committing to a strict, simplified scope interface. Elena will instrument tracking immediately.
"""

            return {
                "discussion": comments,
                "conflict_analysis": conflict_analysis,
                "recommendation": final_rec
            }
        
        elif fallback_type == "experimentation":
            name = payload.get("name", "New Experiment")
            hypothesis = payload.get("hypothesis", "If we change X, then Y will improve.")
            product_area = payload.get("product_area", "Core App")
            kpi_goal = payload.get("kpi_goal", "Conversion Rate")
            
            plan_content = f"""# Experiment Blueprint: {name}
**Product Area**: {product_area}
**Strategic Hypothesis**: {hypothesis}

## 1. Setup & Configuration
*   **Control Group (A)**: The existing user flow/interface without the new feature implementation.
*   **Variant Group (B)**: The new layout containing the updated variant details.
*   **Split Allocation**: 50% Control / 50% Variant, randomized at the session level.

## 2. Metric Instrumentation
*   **Primary KPI**: **{kpi_goal}** (Goal: increase by +15% relatively with statistical significance).
*   **Secondary KPIs**:
    *   Feature adoption rate (clicks on variant element)
    *   Session duration (to check for overall usage impact)
    *   Customer Support ticket rate (guardrail metric)

## 3. Statistical Parameters
*   **Statistical Power**: 80% (Beta = 0.20)
*   **Confidence Level**: 95% (Alpha = 0.05, two-tailed)
*   **Minimum Detectable Effect (MDE)**: 3.5%
*   **Recommended Sample Size**: 15,000 unique users per variation.
*   **Estimated Duration**: **14 days** (based on average daily volume in {product_area}).

## 4. Risk & Guardrails
*   *Risk*: Technical loading latency on Variant B due to API dependencies.
    *   *Guardrail*: If loading time exceeds +300ms, abort the experiment.
*   *Risk*: High friction for mobile web users.
    *   *Guardrail*: Monitor device-level segment drops.
"""

            reviews = [
                {
                    "role": "Product Owner",
                    "name": "Marcus (PO)",
                    "avatar": "PO",
                    "feasibility": "High strategic alignment. This directly impacts our quarter priorities.",
                    "kpi_validity": "The primary KPI is solid, but we should make sure it doesn't cannibalize our main sales funnel.",
                    "risk": "Minimal user confusion risk, as the change is localized.",
                    "measurement_concerns": "Telemetry or tracking worries.",
                    "recommendation": "Strongly approve starting the experiment."
                },
                {
                    "role": "Business Analyst",
                    "name": "Nadia (BA)",
                    "avatar": "BA",
                    "feasibility": "Financially feasible. If we hit the +15% KPI goal, it translates to +$12,000 MRR.",
                    "kpi_validity": "Valid, but let's monitor Average Order Value (AOV) as a guardrail metric.",
                    "risk": "Short-term drop-off if the UI feels too transactional.",
                    "measurement_concerns": "Need to isolate new vs returning users in the cohort analysis.",
                    "recommendation": "Approve. Let's monitor financial conversion daily."
                },
                {
                    "role": "Data Analyst",
                    "name": "Elena (Data Analyst)",
                    "avatar": "DATA",
                    "feasibility": "Easy to instrument with standard Amplitude segment tags.",
                    "kpi_validity": "Highly valid. Standard binomial event distribution fits this test well.",
                    "risk": "Sample ratio mismatch (SRM) if the random split routing fails.",
                    "measurement_concerns": "Require a pre-experiment AA test or SRM telemetry check during day 1.",
                    "recommendation": "Approve, provided telemetry schema is validated."
                },
                {
                    "role": "Dev Lead",
                    "name": "Sanjay (Dev Lead)",
                    "avatar": "DEV",
                    "feasibility": "Medium complexity. We need to implement feature flags (LaunchDarkly or config file).",
                    "kpi_validity": "No technical issues with tracking this metric.",
                    "risk": "Cache invalidation issues or flash of unstyled content (FOUC) during variant rendering.",
                    "measurement_concerns": "We must verify that client-side event dispatch is non-blocking.",
                    "recommendation": "Approve. Require 3 days to write feature flag infrastructure."
                }
            ]

            decision = {
                "recommendation": "Launch",
                "rationale": f"### 🏆 AI PM Decision Recommendation: LAUNCH EXPERIMENT\nBased on cross-functional alignment, this experiment has **high strategic return (+$12k MRR potential)** and **medium engineering effort**. We recommend launching the experiment for **14 days** with a **50/50 split**. Dev Sanjay will set up the feature flag and Data Analyst Elena will run an SRM check on day 1 to confirm randomization integrity."
            }

            return {
                "content": plan_content,
                "review": reviews,
                "decision": decision
            }
        
        elif fallback_type == "collaboration":
            prd = payload.get("prd", "New Feature")
            # Extract basic title if possible
            title = "Product Strategy"
            if "#" in prd:
                title = prd.split("\n")[0].replace("#", "").strip()

            comments = [
                {
                    "role": "Business User",
                    "name": "Emma (Marketing)",
                    "avatar": "MKT",
                    "opinion": f"We need the '{title}' system ready by Q3 for our major patient outreach campaign. If we delay, we miss our seasonal enrollment window.",
                    "questions": "Can we launch a simple promotional flow first?",
                    "risks": "Missing market momentum if development drags on.",
                    "concerns": "No landing pages ready for the launch banner.",
                    "recommendation": "Launch an MVP with basic patient SMS signup by September.",
                    "priority": "High"
                },
                {
                    "role": "Real User",
                    "name": "Thomas (Patient User)",
                    "avatar": "USR",
                    "opinion": "I don't want to type an EHR number or create a login just to schedule an appointment. If it takes more than 2 steps, I'll just call the clinic.",
                    "questions": "Why do I need to register an account first?",
                    "risks": "User abandonment if security onboarding is too complex.",
                    "concerns": "Privacy of clinical records on text messages.",
                    "recommendation": "Keep patient-facing SMS signup entirely passwordless using magic link verification.",
                    "priority": "High"
                },
                {
                    "role": "Product Owner",
                    "name": "Marcus (PO)",
                    "avatar": "PO",
                    "opinion": "We must balance Emma's timeline constraints with Thomas's demand for zero login friction. The MVP should focus on passwordless SMS scheduling.",
                    "questions": "Sanjay, can we delay the EHR write synchronization for Phase 2?",
                    "risks": "Scope creep causing us to miss the Q3 campaign launch.",
                    "concerns": "HIPAA compliance in passwordless messaging flows.",
                    "recommendation": "Build a passwordless SMS booking MVP, using manual clinic validation.",
                    "priority": "High"
                },
                {
                    "role": "Business Analyst",
                    "name": "Nadia (BA)",
                    "avatar": "BA",
                    "opinion": "I support Marcus. A manual confirmation dashboard for nurses saves dev time and lets us validate conversion before building auto-integrations.",
                    "questions": "What is the expected hourly volume of bookings for the nurses?",
                    "risks": "Clinic staff overwhelmed if SMS volume spikes.",
                    "concerns": "Operational overhead of manual matching.",
                    "recommendation": "Start with manual approval dashboard, scope automated EHR writes out of MVP.",
                    "priority": "Medium"
                },
                {
                    "role": "Dev Lead",
                    "name": "Sanjay (Dev Lead)",
                    "avatar": "DEV",
                    "opinion": "Skipping automated EHR writes saves us 15 days of API integration work! That makes the Q3 timeline feasible.",
                    "questions": "Can we use Twilio for passwordless text magic links?",
                    "risks": "Database locks if multiple nurses confirm bookings concurrently.",
                    "concerns": "Client-side state synchronization on the approval dashboard.",
                    "recommendation": "Build simple React dashboard for nurses and passwordless Twilio text flow. Defer EHR sync.",
                    "priority": "High"
                },
                {
                    "role": "UX Lead",
                    "name": "Chloe (UX Lead)",
                    "avatar": "UX",
                    "opinion": "For Thomas's passwordless flow, the SMS should send a secure 4-digit code. This keeps it mobile-friendly and avoids magic link browser redirects.",
                    "questions": "How will clinicians manually confirm conflicts in availability?",
                    "risks": "Nurses making booking errors due to calendar lag.",
                    "concerns": "SMS delivery lag confusing patients.",
                    "recommendation": "Use 4-digit SMS codes for verification and design a simple side-by-side calendar UI for nurses.",
                    "priority": "High"
                },
                {
                    "role": "Data Analyst",
                    "name": "Elena (Data Analyst)",
                    "avatar": "DATA",
                    "opinion": "Since we are starting with manual confirmations, tracking the funnel from SMS initiation to nurse approval is critical to catch bottlenecks.",
                    "questions": "Are there event triggers mapped for SMS delivery latency?",
                    "risks": "Nurses ignoring booking requests without audio/visual notifications.",
                    "concerns": "Data leaks in SMS payload telemetry logs.",
                    "recommendation": "Track SMS sent, SMS delivered, code verified, and clinician approval time.",
                    "priority": "Medium"
                },
                {
                    "role": "QA Lead",
                    "name": "Dave (QA Lead)",
                    "avatar": "QA",
                    "opinion": "If we use SMS verification codes, we must test for session expirations, rate-limiting, and telephone carrier failures.",
                    "questions": "How do we simulate EHR API failures if we defer the sync?",
                    "risks": "SMS spamming vulnerabilities if rate-limiting is skipped.",
                    "concerns": "Testing concurrency issues on the clinician dashboard.",
                    "recommendation": "Implement strict rate-limiting on SMS requests from day one, even in the MVP.",
                    "priority": "High"
                }
            ]

            conflicts = f"""### ⚡ Crucial Stakeholder Conflicts & Trade-offs
1.  **Friction vs. Security**: Real User Thomas demands passwordless access (no accounts). Dev & QA agree it saves development time but raises HIPAA and SMS spam risks.
    *   *Resolution*: Compromise on 4-digit SMS OTP verification (no password creation) and implement carrier-level rate-limiting.
2.  **Marketing Timeline vs. System Automation**: Emma demands a Q3 launch. Dev Lead Sanjay warns that automated EHR integration will take 4+ weeks.
    *   *Resolution*: Defer automated EHR syncing to Phase 2. Build a clinician confirmation dashboard for manual approvals as the MVP interface.
"""

            aligned_mvp = f"""### 🏆 Aligned MVP Scope Blueprint
*   **Target Release**: Q3 (End of August)
*   **Primary Objective**: Reduce phone queue holding times by offering passwordless SMS booking.

#### 📦 Included in MVP Scope (Core Deliverables)
1.  **Patient-Facing SMS Flow**: 4-digit OTP code verification for appointment booking requests.
2.  **Clinician Confirmation Panel**: A responsive React dashboard displaying booking requests for manual approval.
3.  **Basic Telemetry**: Instrumentation of funnel events (`request_initiated` -> `otp_verified` -> `clinician_approved`).
4.  **Security Controls**: Rate-limiting on SMS requests to prevent spam.

#### ⏳ Deferred to Phase 2 (Roadmap Backlog)
1.  **Direct EHR Auto-Sync**: Bidirectional write operations to clinical databases.
2.  **Magic Link URL support**: Browser-based redirection with login tokens.
3.  **Multi-lingual SMS translations**: Mandarin and Spanish localizations.
"""

            return {
                "discussion": comments,
                "conflicts": conflicts,
                "aligned_mvp_scope": aligned_mvp
            }
        
        return "Simulated response placeholder"
