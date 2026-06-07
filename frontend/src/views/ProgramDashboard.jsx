import React, { useState } from 'react';
import { 
  Calendar, 
  AlertTriangle, 
  Layers, 
  Clock, 
  Activity, 
  CheckCircle2, 
  ActivitySquare,
  Play,
  Cpu,
  RefreshCw,
  GitPullRequest
} from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '../components/GlassComponents';
import AICollaborationPanel from '../components/AICollaborationPanel';
import AIAgentSandbox from '../components/AIAgentSandbox';

export default function ProgramDashboard() {
  const [dependencies, setDependencies] = useState([
    { id: 1, title: "WebSockets Token Collision (Platform Team & AI Ops)", status: "Active Conflict", type: "Blocking", mitigation: "Resolve port allocation limits on localhost" },
    { id: 2, title: "OAuth Telemetry Schema latency (Core Backend & UI)", status: "Awaiting Sync", type: "Delay Risk", mitigation: "Align API models with seeded dev authentication" }
  ]);

  const [resolvingId, setResolvingId] = useState(null);

  const handleMitigate = (id) => {
    setResolvingId(id);
    setTimeout(() => {
      setDependencies(prev => prev.map(dep => 
        dep.id === id ? { ...dep, status: "Mitigated", type: "Resolved" } : dep
      ));
      setResolvingId(null);
    }, 1500);
  };

  const ganttLanes = [
    { phase: "Q2 Ingestion Engine", progress: 85, color: "bg-blue-500", date: "May 1 - Jun 15" },
    { phase: "Product Brain Multi-LLM Routing", progress: 60, color: "bg-purple-500", date: "May 20 - Jul 1" },
    { phase: "Real-time Otter Transcript Summarizer", progress: 35, color: "bg-emerald-500", date: "Jun 1 - Aug 10" },
    { phase: "Compliance Audit Policy Checkers", progress: 10, color: "bg-amber-500", date: "Jul 15 - Sep 30" }
  ];

  return (
    <div className="space-y-6 font-mono text-xs text-white">
      {/* Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl font-bold tracking-wider font-mono uppercase">Program Command center</h1>
        <p className="text-[10px] text-gray-500 font-mono">Orchestrate cross-team dependencies, monitor epics schedules, and audit critical path risks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Console */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Telemetry rows */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Program Milestones", val: "5 / 6 Met", sub: "1 upcoming gate check", icon: Calendar, color: "text-blue-400" },
              { label: "Critical Path Risk", val: "Medium Index", sub: "Schedule impact: Low", icon: Clock, color: "text-amber-400" },
              { label: "Active Dependencies", val: "1 unresolved Conflict", sub: "Total: 12 mapped links", icon: Layers, color: "text-purple-400" },
              { label: "Pipeline Sync Rate", val: "100% compliant", sub: "Uvicorn logs running on 8109", icon: ActivitySquare, color: "text-emerald-400" }
            ].map((m, idx) => (
              <GlassCard key={idx} className="p-4 flex flex-col justify-between space-y-2 relative overflow-hidden bg-slate-900/60 border-white/5">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] text-gray-400 font-mono uppercase">{m.label}</span>
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                </div>
                <div>
                  <div className="text-md font-bold text-white tracking-wide font-mono">{m.val}</div>
                  <div className="text-[8px] text-gray-500 font-mono mt-0.5">{m.sub}</div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Cross-Team Dependency Logs */}
          <GlassCard className="p-5 bg-slate-900/60 border-white/5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h2 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Cross-Team Dependency Log Matrix
              </h2>
              <GlassBadge color="yellow">2 Mapped Links</GlassBadge>
            </div>

            <div className="space-y-3 pt-2">
              {dependencies.map((dep) => (
                <div key={dep.id} className="p-3 bg-black/20 border border-white/5 rounded-xl flex justify-between items-center gap-4">
                  <div className="space-y-1.5">
                    <div className="font-bold text-white text-[11px] leading-relaxed flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span>{dep.title}</span>
                    </div>
                    <div className="text-[9px] text-gray-500">Suggested Action: {dep.mitigation}</div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                    <GlassBadge color={dep.status === 'Mitigated' ? 'green' : (dep.type === 'Blocking' ? 'red' : 'yellow')}>
                      {dep.status}
                    </GlassBadge>
                    {dep.status !== 'Mitigated' && (
                      <GlassButton 
                        onClick={() => handleMitigate(dep.id)}
                        disabled={resolvingId === dep.id}
                        className="py-1 px-2 text-[9px] flex items-center gap-1"
                      >
                        {resolvingId === dep.id ? <RefreshCw className="h-3 w-3 animate-spin text-cyan-400" /> : <Play className="h-3 w-3 text-cyan-400" />}
                        <span>Mitigate</span>
                      </GlassButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* GanttTimeline roadmaps */}
          <GlassCard className="p-5 bg-slate-900/60 border-white/5 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase border-b border-white/5 pb-2 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-cyan-400" /> Program Roadmap Timeline
            </h2>

            <div className="space-y-4 pt-2">
              {ganttLanes.map((lane, idx) => (
                <div key={lane.phase} className="grid grid-cols-12 gap-3 items-center text-[10px]">
                  <div className="col-span-3 font-semibold text-white truncate">{lane.phase}</div>
                  <div className="col-span-7 bg-slate-950/40 h-5 rounded-lg border border-white/5 overflow-hidden relative flex items-center">
                    <div 
                      className={`h-full ${lane.color} rounded-lg opacity-80`}
                      style={{ width: `${lane.progress}%` }}
                    />
                    <span className="absolute right-3 text-[9px] font-bold text-gray-450 font-mono">{lane.progress}%</span>
                  </div>
                  <div className="col-span-2 text-right text-[9px] text-gray-550 font-mono">{lane.date}</div>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

        {/* AI Program Assistant panel */}
        <div className="lg:col-span-1">
          <AICollaborationPanel assistantName="AI Program Assistant" roleContext="Program Manager" />
        </div>
      </div>

      <AIAgentSandbox role="Program Manager" />
    </div>
  );
}
