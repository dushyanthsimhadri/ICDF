import React, { useState } from 'react';
import { KanbanSquare, Users, FolderKanban, Sparkles, AlertCircle, Award, CheckCircle2, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '../components/GlassComponents';
import AICollaborationPanel from '../components/AICollaborationPanel';
import AIAgentSandbox from '../components/AIAgentSandbox';

export default function PMDashboard() {
  const [epics] = useState([
    { id: "EP-40", title: "Enterprise Messenger attachments sync hooks", status: "Active", progress: 65, quality: "85%" },
    { id: "EP-41", title: "Notion wiki history logging decryption", status: "Planning", progress: 10, quality: "92%" }
  ]);

  const [prdGaps] = useState([
    { spec: "WebSockets Telemetry Spec", gap: "Missing connection retry limits", severity: "High" },
    { spec: "OAuth Auth Telemetry Spec", gap: "Token cache expiration policy not defined", severity: "Medium" },
    { spec: "Billing Tier Analytics spec", gap: "No fallback logic for offline analytics collection", severity: "Low" }
  ]);

  const pdlcStages = [
    { name: "Inception", status: "Completed", date: "May 10" },
    { name: "Discovery", status: "Completed", date: "May 18" },
    { name: "PRD Spec Draft", status: "Completed", date: "May 25" },
    { name: "UX & Tech Design", status: "Completed", date: "Jun 1" },
    { name: "Development", status: "Active", date: "Running" },
    { name: "QA & Gating", status: "Pending", date: "Jun 12" },
    { name: "Deployment", status: "Locked", date: "Jun 15" }
  ];

  return (
    <div className="space-y-6 font-mono text-xs text-white">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono uppercase">Product Manager Command Center</h1>
        <p className="text-[10px] text-gray-500 font-mono">Manage the Product Development Lifecycle (PDLC), audit PRD spec health, and monitor core business KPIs</p>
      </div>

      {/* KPI Trends Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "North Star Metric", val: "84.2%", sub: "Retention Index (+2.1%)", icon: TrendingUp, color: "text-blue-400" },
          { label: "PRD Quality Avg", val: "88.5%", sub: "Spec health score average", icon: Award, color: "text-purple-400" },
          { label: "SLA Gate Pass Rate", val: "99.8%", sub: "0 release SLA breaches", icon: ShieldCheck, color: "text-emerald-400" },
          { label: "Backlog Velocity", val: "4.8 days", sub: "Ticket cycle velocity", icon: Zap, color: "text-amber-400" }
        ].map((m, idx) => (
          <GlassCard key={idx} className="p-4 flex flex-col justify-between space-y-2 bg-slate-900/60 border-white/5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-[9px] text-gray-400 font-mono uppercase">{m.label}</span>
              <m.icon className={`h-4 w-4 ${m.color}`} />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-wide font-mono">{m.val}</div>
              <div className="text-[9px] text-gray-500 font-mono mt-0.5">{m.sub}</div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* PDLC Stage Tracker */}
      <GlassCard className="p-5 bg-slate-900/60 border-white/5 space-y-4">
        <h2 className="text-xs font-bold text-white uppercase border-b border-white/5 pb-2 flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-cyan-400 animate-pulse" /> Product Development Lifecycle (PDLC) Stages
        </h2>
        <div className="flex flex-col md:flex-row justify-between items-stretch gap-4 pt-2">
          {pdlcStages.map((stage, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center justify-between p-3 bg-black/20 border border-white/5 rounded-xl text-center relative gap-2">
              <div className="space-y-1">
                <div className="font-bold text-white text-[10px]">{stage.name}</div>
                <div className="text-[9px] text-gray-500 font-semibold">{stage.date}</div>
              </div>
              <GlassBadge color={stage.status === 'Completed' ? 'green' : (stage.status === 'Active' ? 'blue' : 'yellow')}>
                {stage.status}
              </GlassBadge>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Epics and PRD Health */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Strategic Epics */}
          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
            <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-1.5">
              <FolderKanban className="h-4 w-4 text-purple-400" /> Active Strategic Epics
            </h2>
            <div className="space-y-3">
              {epics.map((epic, idx) => (
                <div key={idx} className="p-2.5 bg-black/20 border border-white/5 rounded space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-white">{epic.id}: {epic.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Spec Health: <strong>{epic.quality}</strong></span>
                      <GlassBadge color={epic.status === 'Active' ? 'green' : 'yellow'}>{epic.status}</GlassBadge>
                    </div>
                  </div>
                  <div className="bg-slate-950/40 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: `${epic.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* PRD Spec Health & Gaps Matrix */}
          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
            <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-rose-400" /> PRD Spec Gaps & Vulnerabilities
            </h2>
            <div className="space-y-2.5">
              {prdGaps.map((g, idx) => (
                <div key={idx} className="p-2.5 bg-black/20 border border-white/5 rounded flex justify-between items-center gap-3">
                  <div className="space-y-1">
                    <div className="text-[10px] text-gray-400 font-bold uppercase">{g.spec}</div>
                    <div className="text-white text-[11px]">{g.gap}</div>
                  </div>
                  <GlassBadge color={g.severity === 'High' ? 'red' : (g.severity === 'Medium' ? 'yellow' : 'blue')}>
                    {g.severity}
                  </GlassBadge>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: AI Collaboration */}
        <div className="lg:col-span-1">
          <AICollaborationPanel assistantName="AI PM Assistant" roleContext="Product Manager" />
        </div>
      </div>

      {/* AI Agent Sandbox */}
      <AIAgentSandbox role="Product Manager" />
    </div>
  );
}
