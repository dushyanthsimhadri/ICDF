import React from 'react';
import { FolderKanban, PieChart } from 'lucide-react';
import { GlassCard, GlassBadge } from '../components/GlassComponents';

export default function PortfolioWorkspace() {
  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono">PORTFOLIO WORKSPACE</h1>
        <p className="text-[10px] text-gray-500 font-mono">Strategic epics management, business value alignment tracker, and milestones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-cyan-400" /> Strategic Epics
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-black/20 border border-white/5 rounded">
              <span>EPIC-01: Multi-Tenant Data Layer Isolation</span>
              <GlassBadge color="green">Completed</GlassBadge>
            </div>
            <div className="flex justify-between items-center p-2 bg-black/20 border border-white/5 rounded">
              <span>EPIC-02: AI Copilot Orchestrator V2</span>
              <GlassBadge color="purple">In Progress</GlassBadge>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-purple-400" /> Investment Distribution
          </h2>
          <div className="space-y-2 text-[10px]">
            <div className="flex justify-between"><span>Core Engineering:</span><span className="text-white">45%</span></div>
            <div className="flex justify-between"><span>AI Features & RAG:</span><span className="text-white">35%</span></div>
            <div className="flex justify-between"><span>SOC2 & Compliance:</span><span className="text-white">20%</span></div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
