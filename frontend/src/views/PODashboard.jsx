import React, { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  Users, 
  CheckSquare, 
  FolderKanban, 
  Cpu, 
  Layers, 
  Slider, 
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '../components/GlassComponents';
import AICollaborationPanel from '../components/AICollaborationPanel';
import AIAgentSandbox from '../components/AIAgentSandbox';

export default function PODashboard() {
  const [backlog, setBacklog] = useState([
    { id: "US-102", title: "Implement tenant isolation in websocket handlers", bizValue: 8, timeCrit: 9, riskReduc: 8, jobSize: 5, wsjf: 5.0 },
    { id: "US-103", title: "Add OAuth sync telemetry connectors for Jira/Harness", bizValue: 7, timeCrit: 6, riskReduc: 5, jobSize: 3, wsjf: 6.0 },
    { id: "US-104", title: "Generate audit log history reports for SOC2 compliance", bizValue: 9, timeCrit: 5, riskReduc: 7, jobSize: 8, wsjf: 2.62 }
  ]);

  const handleSliderChange = (id, field, value) => {
    setBacklog(prev => {
      const updated = prev.map(story => {
        if (story.id === id) {
          const newStory = { ...story, [field]: Number(value) };
          const costOfDelay = newStory.bizValue + newStory.timeCrit + newStory.riskReduc;
          newStory.wsjf = Number((costOfDelay / (newStory.jobSize || 1)).toFixed(2));
          return newStory;
        }
        return story;
      });
      return updated.sort((a, b) => b.wsjf - a.wsjf);
    });
  };

  const flowStages = [
    { name: "Inception", time: "1.5 days", status: "Completed" },
    { name: "Spec Prep", time: "2.1 days", status: "Completed" },
    { name: "Development", time: "4.8 days", status: "Active" },
    { name: "QA Gate", time: "1.2 days", status: "Pending" },
    { name: "Production", time: "0.5 days", status: "Locked" }
  ];

  return (
    <div className="space-y-6 font-mono text-xs text-white">
      {/* Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl font-bold tracking-wider font-mono uppercase">Product Owner Command Center</h1>
        <p className="text-[10px] text-gray-500 font-mono">Prioritize backlog items with WSJF value matrices, monitor velocity performance, and audit flow state cycle times</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Workspace */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Metrics panels */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Active Sprint", val: "Sprint 42", sub: "Goal: Secure Multi-Tenancy", icon: Target, color: "text-blue-400" },
              { label: "Sprint Velocity", val: "68 Points", sub: "Target average: 65-72 pts", icon: TrendingUp, color: "text-cyan-400" },
              { label: "Requirements Met", val: "84.5% complete", sub: "3 remaining spec gaps", icon: CheckSquare, color: "text-purple-400" },
              { label: "Prioritized Backlog", val: "148 Stories", sub: "98 estimated and prioritized", icon: FolderKanban, color: "text-emerald-400" }
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

          {/* Interactive WSJF Backlog Priorities */}
          <GlassCard className="p-5 bg-slate-900/60 border-white/5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h2 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <FolderKanban className="h-4 w-4 text-cyan-400" /> Interactive WSJF Backlog Prioritization
              </h2>
              <GlassBadge color="purple">Recalculates Live</GlassBadge>
            </div>

            <div className="space-y-4 pt-2">
              {backlog.map((story) => (
                <div key={story.id} className="p-4 bg-black/20 border border-white/5 rounded-2xl space-y-4 hover:border-white/10 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-white text-[11px] leading-tight block">{story.id}: {story.title}</span>
                      <span className="text-[9px] text-gray-500 font-bold block mt-1">
                        Cost of Delay: {story.bizValue + story.timeCrit + story.riskReduc} | Job Size: {story.jobSize}
                      </span>
                    </div>
                    <GlassBadge color="blue" className="text-[10px] px-2.5 py-1">WSJF: {story.wsjf}</GlassBadge>
                  </div>

                  {/* Sliders Panel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-3 text-[10px]">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-gray-400">
                        <span>Business Value: <strong>{story.bizValue}</strong></span>
                        <span className="text-gray-500">1 - 10</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={story.bizValue}
                        onChange={(e) => handleSliderChange(story.id, 'bizValue', e.target.value)}
                        className="w-full accent-cyan-400 h-1 cursor-pointer bg-slate-800 rounded-full"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-gray-400">
                        <span>Job Size (Effort): <strong>{story.jobSize}</strong></span>
                        <span className="text-gray-500">1 - 20</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="20" 
                        value={story.jobSize}
                        onChange={(e) => handleSliderChange(story.id, 'jobSize', e.target.value)}
                        className="w-full accent-purple-400 h-1 cursor-pointer bg-slate-800 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Value Stream Mapping Flow */}
          <GlassCard className="p-5 bg-slate-900/60 border-white/5 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase border-b border-white/5 pb-2 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-emerald-400" /> Value Stream Mapping Flow
            </h2>

            <div className="flex flex-col md:flex-row justify-between items-stretch gap-4 pt-2">
              {flowStages.map((stage, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center justify-between p-3 bg-black/20 border border-white/5 rounded-xl text-center relative gap-2">
                  {idx < flowStages.length - 1 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-slate-950 p-1 border border-white/5 rounded-full text-gray-500">
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="font-bold text-white">{stage.name}</div>
                    <div className="text-[9px] text-gray-500 font-semibold">{stage.time} cycle</div>
                  </div>
                  <GlassBadge color={stage.status === 'Completed' ? 'green' : (stage.status === 'Active' ? 'blue' : 'yellow')}>
                    {stage.status}
                  </GlassBadge>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

        {/* AI PO Assistant Panel */}
        <div className="lg:col-span-1">
          <AICollaborationPanel assistantName="AI PO Assistant" roleContext="Product Owner" />
        </div>
      </div>

      <AIAgentSandbox role="Product Owner" />
    </div>
  );
}
