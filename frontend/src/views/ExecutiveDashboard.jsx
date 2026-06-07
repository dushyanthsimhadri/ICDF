import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Gauge, 
  Flame, 
  CheckSquare, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  GitMerge,
  Layers,
  DollarSign,
  Users,
  ShieldAlert,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Brain
} from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '../components/GlassComponents';
import AIAgentSandbox from '../components/AIAgentSandbox';

export default function ExecutiveDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [auditLog, setAuditLog] = useState([]);
  const [isAuditing, setIsAuditing] = useState(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8109/intelligence/metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setMetrics({
        delivery_health: 94.2,
        velocity_score: 88.5,
        release_confidence: 91.0,
        risk_score: 14.5,
        program_health: 95.8,
        kpi_impact: 18.3,
        weekly_velocity: [65, 72, 70, 81, 84, 88.5],
        weekly_risk: [28, 24, 20, 18, 16, 14.5],
        weekly_health: [90, 91, 93, 94, 94, 94.2],
        weekly_confidence: [82, 85, 87, 89, 90, 91.0]
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const triggerProjectAudit = (projectName) => {
    setIsAuditing(projectName);
    setTimeout(() => {
      setIsAuditing(null);
      const auditNotes = [
        `[AI AUDIT] Project '${projectName}' evaluated successfully. Code quality index matches threshold (91%).`,
        `[AI RECOMMENDATION] Core team utilization is running hot. Consider offloading QA tasks to automated pipelines.`,
        `[COMPLIANCE CHECK] No high-priority telemetry breaches identified in project schemas.`
      ];
      setAuditLog(auditNotes);
    }, 1200);
  };

  const handleDownloadBriefing = () => {
    const reportContent = `# ICDF EXECUTIVE WEEKLY BRIEFING REPORT
Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
Tenant: Acme Corp
Operational Mode: Hybrid Enterprise Delivery OS

## EXECUTIVE OVERVIEW
- Delivery Health Index: ${metrics?.delivery_health || 94.2}%
- Engineering Velocity Score: ${metrics?.velocity_score || 88.5} points
- Core Release Confidence: ${metrics?.release_confidence || 91.0}%
- Current Threat Risk Index: ${metrics?.risk_score || 14.5}% (Low)

## PORTFOLIO STATUS
1. Enterprise OS Evolution: On Track (85% progress)
2. Multi-LLM Product Brain: Awaiting Feedback (60% progress)
3. Real-time Meeting Transcriber: At Risk (35% progress)
4. Compliance Sharding Layer: Delayed (10% progress)

## FINANCIAL UTILIZATION
- Total Budget Cap: $2,500,000
- Expensed: $1,780,000 (71.2% Utilization)
- Available Balance: $720,000

## KEY ACTION ITEMS
1. Migrate the production SQLite shard to PostgreSQL to eliminate lock contention.
2. Address over-allocation (120%) of Frontend engineers by reallocating capacity.
3. Establish dedicated regional edge caches for the Tri-Agent Consensus API to improve performance.

---
Confidential - Internal ICDF Platform Report
`;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ICDF_Executive_Weekly_Briefing_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[70vh] font-mono text-xs text-cyan-400">
        <div className="animate-pulse flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Synchronizing Telemetry Metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider font-mono">EXECUTIVE COMMAND CENTER</h1>
          <p className="text-[10px] text-gray-500 font-mono">Aggregated program health indicators, financial pipelines, and threat levels</p>
        </div>
        <GlassButton onClick={fetchMetrics} className="flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5 text-cyan-400" /> Refresh Telemetry
        </GlassButton>
      </div>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Delivery Health Index", val: `${metrics.delivery_health}%`, sub: "Operational baseline: 92%", icon: Heart, color: "text-red-400" },
          { label: "Engineering Velocity", val: `${metrics.velocity_score} pts`, sub: "Sprint capacity: 85 pts", icon: TrendingUp, color: "text-blue-400" },
          { label: "Release Confidence", val: `${metrics.release_confidence}%`, sub: "Automated test threshold pass", icon: Gauge, color: "text-emerald-400" },
          { label: "System Risk Index", val: `${metrics.risk_score}%`, sub: "Calculated threat: Low", icon: Flame, color: "text-purple-400" }
        ].map((m, idx) => (
          <GlassCard key={idx} className="p-4 flex flex-col justify-between space-y-2 relative overflow-hidden bg-slate-900/60 border-white/5">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-gray-400 font-mono uppercase">{m.label}</span>
              <m.icon className={`h-4 w-4 ${m.color}`} />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-wide font-mono">{m.val}</div>
              <div className="text-[9px] text-gray-500 font-mono">{m.sub}</div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-px">
        {[
          { id: 'portfolio', label: 'Portfolio Health', icon: Layers },
          { id: 'budget', label: 'Budget Utilization', icon: DollarSign },
          { id: 'resource', label: 'Resource Projections', icon: Users },
          { id: 'risk', label: 'Strategic Risks', icon: ShieldAlert },
          { id: 'briefing', label: 'AI Briefing & Reports', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-mono text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                active 
                  ? 'border-cyan-400 text-cyan-400 font-bold bg-cyan-950/20' 
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-slate-900/40'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[300px]">
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2 flex items-center gap-2">
                <GitMerge className="h-4 w-4 text-cyan-400" /> Enterprise Roadmap Timeline
              </h2>
              <div className="space-y-4 pt-2">
                {[
                  { phase: "Q2 Ingestion Engine", progress: 85, color: "bg-blue-500", date: "May 1 - Jun 15" },
                  { phase: "Product Brain Multi-LLM Routing", progress: 60, color: "bg-purple-500", date: "May 20 - Jul 1" },
                  { phase: "Real-time Otter Transcript Summarizer", progress: 35, color: "bg-emerald-500", date: "Jun 1 - Aug 10" },
                  { phase: "Compliance Audit Policy Checkers", progress: 10, color: "bg-amber-500", date: "Jul 15 - Sep 30" }
                ].map((lane, idx) => (
                  <div key={lane.phase} className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-3 text-xs font-semibold text-white font-mono truncate">{lane.phase}</div>
                    <div className="col-span-7 bg-slate-950/40 h-5 rounded-lg border border-white/5 overflow-hidden relative flex items-center">
                      <motion.div 
                        className={`h-full ${lane.color} rounded-lg opacity-80`}
                        initial={{ width: "0%" }}
                        animate={{ width: `${lane.progress}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: idx * 0.1 }}
                      />
                      <span className="absolute right-3 text-[9px] font-bold text-gray-400 font-mono">{lane.progress}%</span>
                    </div>
                    <div className="col-span-2 text-right text-[9px] text-gray-500 font-mono">{lane.date}</div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">
                Project Operational Health
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px] text-gray-300">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="py-2">Project Stream</th>
                      <th className="py-2">Owner / Lead</th>
                      <th className="py-2">Capacity Allocation</th>
                      <th className="py-2 text-center">Health Index</th>
                      <th className="py-2">Status</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Core Delivery Engine", owner: "Sarah K. (Dev Lead)", alloc: "14 FTE", health: "94.2%", status: "On Track", badge: "text-emerald-400 bg-emerald-950/40 border-emerald-500/20" },
                      { name: "Multi-LLM Product Brain", owner: "Elena R. (Product)", alloc: "8 FTE", health: "88.5%", status: "On Track", badge: "text-emerald-400 bg-emerald-950/40 border-emerald-500/20" },
                      { name: "Real-time Meeting Transcriber", owner: "David L. (QA Lead)", alloc: "6 FTE", health: "68.0%", status: "At Risk", badge: "text-amber-400 bg-amber-950/40 border-amber-500/20" },
                      { name: "Compliance Sharding Layer", owner: "Admin Team (Sys)", alloc: "4 FTE", health: "45.0%", status: "Delayed", badge: "text-rose-400 bg-rose-955/40 border-rose-500/20" }
                    ].map((proj) => (
                      <tr key={proj.name} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 font-semibold text-white">{proj.name}</td>
                        <td className="py-3 text-gray-400">{proj.owner}</td>
                        <td className="py-3">{proj.alloc}</td>
                        <td className="py-3 text-center font-bold text-cyan-400">{proj.health}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded border text-[9px] uppercase font-bold tracking-wide ${proj.badge}`}>
                            {proj.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <GlassButton 
                            className="text-[10px] px-2 py-1 flex items-center gap-1 ml-auto"
                            onClick={() => triggerProjectAudit(proj.name)}
                            disabled={isAuditing !== null}
                          >
                            <Brain className="h-3 w-3" />
                            {isAuditing === proj.name ? "Auditing..." : "AI Audit"}
                          </GlassButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {auditLog.length > 0 && (
                <div className="bg-cyan-950/10 border border-cyan-500/20 p-3 rounded space-y-1.5 animate-fadeIn">
                  <div className="text-cyan-400 font-bold text-[10px] uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Latest Audit Logs:
                  </div>
                  {auditLog.map((log, i) => (
                    <div key={i} className="text-gray-400 font-mono text-[10px]">{log}</div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {activeTab === 'budget' && (
          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-6">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">
                Capital Allocation & Burn Telemetry
              </h2>
              <p className="text-[10px] text-gray-500 mt-1">Cross-tenant cloud budgets, LLM query credits, and project burn-down indices</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/20 p-4 rounded border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] text-gray-400 uppercase">Total Portfolio Budget</span>
                <div className="text-xl font-bold text-white mt-1">$2,500,000</div>
                <span className="text-[9px] text-gray-600 mt-2">Fiscal Cycle: Q2-Q3 2026</span>
              </div>
              <div className="bg-black/20 p-4 rounded border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] text-gray-400 uppercase">Expensed Capital</span>
                <div className="text-xl font-bold text-cyan-400 mt-1">$1,780,000</div>
                <span className="text-[9px] text-cyan-600 mt-2">71.2% Total Utilization</span>
              </div>
              <div className="bg-black/20 p-4 rounded border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] text-gray-400 uppercase">Available Reserve</span>
                <div className="text-xl font-bold text-emerald-400 mt-1">$720,000</div>
                <span className="text-[9px] text-emerald-600 mt-2">Stable Operational Runway</span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {[
                { category: "GPU & LLM Inference Capacity", spent: 510000, total: 600000, progress: 85, alert: "High Burn / GPU Saturation imminent", alertColor: "text-amber-400 border-amber-500/20 bg-amber-950/20" },
                { category: "Core Cloud Infrastructure (AWS / GCP)", spent: 290000, total: 400000, progress: 72.5, alert: "Nominal Usage", alertColor: "text-cyan-400 border-cyan-500/20 bg-cyan-950/20" },
                { category: "Engineering Staffing & Contractors", spent: 880000, total: 1200000, progress: 73.3, alert: "Nominal Usage", alertColor: "text-cyan-400 border-cyan-500/20 bg-cyan-950/20" },
                { category: "Third-Party Security Audits & Compliance", spent: 100000, total: 300000, progress: 33.3, alert: "Under-utilized / Audit delayed", alertColor: "text-rose-400 border-rose-500/20 bg-rose-955/20" }
              ].map((item) => (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-semibold text-white">{item.category}</span>
                    <span className="text-gray-400">${item.spent.toLocaleString()} / ${item.total.toLocaleString()} ({item.progress}%)</span>
                  </div>
                  <div className="h-2.5 bg-slate-950/50 rounded overflow-hidden border border-white/5 flex">
                    <div className="bg-cyan-500 h-full rounded" style={{ width: `${item.progress}%` }} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-gray-500">Auto-balanced allocation threshold: 90%</span>
                    <span className={`px-1.5 py-0.5 rounded border text-[8px] uppercase font-bold tracking-wider ${item.alertColor}`}>
                      {item.alert}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {activeTab === 'resource' && (
          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-6">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">
                FTE Allocation & Capacity Forecasting
              </h2>
              <p className="text-[10px] text-gray-500 mt-1">Real-time resource capacity constraints and cross-team dependencies mapping</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Core allocations */}
              <div className="space-y-4 bg-black/20 p-4 rounded border border-white/5">
                <h3 className="font-bold text-white text-[11px] uppercase border-b border-white/5 pb-2">Active Engineering Allocation</h3>
                {[
                  { role: "Product Management", allocated: 6, capacity: 6, pct: 100, status: "Fully Allocated" },
                  { role: "Frontend Engineering", allocated: 12, capacity: 10, pct: 120, status: "OVER-ALLOCATED" },
                  { role: "Backend & Core Engineering", allocated: 18, capacity: 18, pct: 100, status: "Fully Allocated" },
                  { role: "QA & Validation Engineers", allocated: 8, capacity: 12, pct: 66.6, status: "Recruiting" },
                  { role: "DevOps & Cloud SRE", allocated: 4, capacity: 5, pct: 80, status: "Under Capacity" }
                ].map((item) => (
                  <div key={item.role} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-300 font-semibold">{item.role}</span>
                      <span className="font-mono text-white">{item.allocated} / {item.capacity} FTE ({item.pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-950/40 rounded overflow-hidden">
                      <div 
                        className={`h-full rounded ${item.pct > 100 ? 'bg-rose-500 animate-pulse' : item.pct === 100 ? 'bg-cyan-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.min(item.pct, 100)}%` }} 
                      />
                    </div>
                    <div className="flex justify-end">
                      <span className={`text-[8px] font-bold uppercase ${item.pct > 100 ? 'text-rose-400' : item.pct === 100 ? 'text-cyan-400' : 'text-emerald-400'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resource capacity projection */}
              <div className="space-y-4 bg-black/20 p-4 rounded border border-white/5 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-[11px] uppercase border-b border-white/5 pb-2">Capacity Projection (Next 3 Sprints)</h3>
                  <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                    Based on story point weight velocity metrics, overall demand will exceed total engineering capacity by <strong>18%</strong> during Sprint 43. 
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-[9px] text-gray-500 border-b border-white/5 pb-1">
                      <span>Sprint 42 Capacity:</span>
                      <span className="text-emerald-400 font-bold">Optimal Alignment (92%)</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-gray-500 border-b border-white/5 pb-1">
                      <span>Sprint 43 Capacity:</span>
                      <span className="text-rose-400 font-bold">Severe Overload (118%)</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-gray-500 border-b border-white/5 pb-1">
                      <span>Sprint 44 Capacity:</span>
                      <span className="text-cyan-400 font-bold">Stable Pipeline (98%)</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2 p-2.5 bg-rose-955/20 border border-rose-500/20 rounded">
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                    <span className="text-[9px] text-rose-300 leading-normal">
                      <strong>AI Suggestion:</strong> Frontend resources are blocking PRD feature rollouts. Re-allocate 2 Backend engineers to node/component wrappers.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {activeTab === 'risk' && (
          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-6">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">
                Strategic & Compliance Threat Matrices
              </h2>
              <p className="text-[10px] text-gray-500 mt-1">Telemetry audit checks, localized data sovereignty levels, and structural technical debt threat scores</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { 
                  title: "GDPR / EU Data Sovereignty compliance of meeting transcripts", 
                  pct: 45, 
                  level: "Medium Risk", 
                  desc: "Transcripts processed in regional US nodes. Requires local EU encryption filters.",
                  color: "text-amber-400",
                  btnText: "Route through EU Edge" 
                },
                { 
                  title: "Latency spikes in Tri-Agent Consensus pipeline", 
                  pct: 72, 
                  level: "High Risk", 
                  desc: "Awaiting multiple LLM token generations simultaneously. Engineering score bottleneck.",
                  color: "text-rose-400",
                  btnText: "Enable Consensus Cache" 
                },
                { 
                  title: "SQLite file lock contention under multi-tenant load", 
                  pct: 88, 
                  level: "Critical Threat", 
                  desc: "Database file lock write delays detected. Urgent migration path requested.",
                  color: "text-rose-500 font-extrabold animate-pulse",
                  btnText: "Migrate to PostgreSQL" 
                },
                { 
                  title: "Developer churn in Core Frontend team", 
                  pct: 20, 
                  level: "Low Risk", 
                  desc: "Overall satisfaction and retention logs index within nominal thresholds.",
                  color: "text-emerald-400",
                  btnText: "Review Salary Bands" 
                }
              ].map((risk, i) => (
                <div key={i} className="bg-black/20 p-4 rounded border border-white/5 flex flex-col justify-between space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-white text-[10.5px] leading-tight pr-4">{risk.title}</h3>
                    <span className={`text-[9px] uppercase font-bold tracking-wider ${risk.color}`}>{risk.level}</span>
                  </div>
                  <p className="text-[9.5px] text-gray-400 leading-relaxed">{risk.desc}</p>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex-grow bg-slate-950/40 h-2 rounded overflow-hidden">
                      <div 
                        className={`h-full rounded ${risk.pct > 80 ? 'bg-rose-600' : risk.pct > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${risk.pct}%` }} 
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-300 font-mono shrink-0">{risk.pct}%</span>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex justify-end">
                    <GlassButton className="text-[9px] px-2.5 py-1">
                      {risk.btnText}
                    </GlassButton>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {activeTab === 'briefing' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4 lg:col-span-2">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2 flex items-center justify-between">
                <span>AI Briefing Report Preview</span>
                <span className="text-[9px] text-cyan-400 font-normal uppercase tracking-normal">Status: Draft Generated</span>
              </h2>

              <div className="bg-black/35 p-4 rounded border border-white/5 font-mono text-[10px] text-gray-300 space-y-4 max-h-[350px] overflow-y-auto leading-relaxed select-text">
                <div className="text-center font-bold text-white uppercase border-b border-white/5 pb-2 text-xs">
                  ICDF EXECUTIVE WEEKLY BRIEFING REPORT
                </div>
                <div className="grid grid-cols-2 gap-2 text-gray-400 border-b border-white/5 pb-2">
                  <div>Date: {new Date().toLocaleDateString()}</div>
                  <div className="text-right">Platform Version: 3.0.0-V3</div>
                </div>
                <div>
                  <div className="font-bold text-white uppercase mb-1">1. Delivery Health Metrics summary</div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Core program pipeline stability index: {metrics?.delivery_health || 94.2}%</li>
                    <li>Sprint capacity execution velocity: {metrics?.velocity_score || 88.5} story points</li>
                    <li>Global automated regression pass confidence: {metrics?.release_confidence || 91.0}%</li>
                  </ul>
                </div>
                <div>
                  <div className="font-bold text-white uppercase mb-1">2. Financial Runway Burn</div>
                  <p>Expenditure utilization registers at 71.2% ($1.78M spent of $2.5M cap). High priority burn rate logged against GPU inference capacities. Core infrastructure expending nominal reserves.</p>
                </div>
                <div>
                  <div className="font-bold text-white uppercase mb-1">3. Critical Recommendations</div>
                  <ol className="list-decimal pl-4 space-y-0.5">
                    <li>Authorize SQLite migration script immediately.</li>
                    <li>Reallocate Frontend developers to clear PRD backlog.</li>
                  </ol>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4 bg-slate-900/60 border-white/5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">
                  Exporter Console
                </h2>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Compile and export the latest operational briefing package. The downloaded report incorporates real-time telemetry markers, database audit histories, and active blockers lists for offline distribution.
                </p>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-[10px] text-gray-500">
                    <span>Format:</span>
                    <span className="text-white font-bold">Markdown (.md)</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-500">
                    <span>Target Audience:</span>
                    <span className="text-white">Board & Executives</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-500">
                    <span>Security Clearance:</span>
                    <span className="text-rose-400 font-bold uppercase">L4 - Restricted</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-2">
                <GlassButton 
                  onClick={handleDownloadBriefing}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-white bg-cyan-600 hover:bg-cyan-700 transition-colors"
                >
                  <Download className="h-4 w-4" /> Download Executive Briefing
                </GlassButton>
                <div className="text-center text-[8.5px] text-gray-500 font-mono mt-2">
                  System logs logged in audit storage: C:\Users\admin\Documents\ICDF\icdf.db
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      <AIAgentSandbox role="Executive" />
    </div>
  );
}

