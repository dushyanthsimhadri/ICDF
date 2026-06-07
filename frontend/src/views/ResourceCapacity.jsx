import React from 'react';
import { Users, AlertCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassComponents';

export default function ResourceCapacity() {
  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono">TEAM RESOURCE CAPACITY</h1>
        <p className="text-[10px] text-gray-500 font-mono">Team capacity indices, engineers allocation and resource workload indicators</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <Users className="h-4 w-4 text-cyan-400" /> Team Workloads
          </h2>
          <div className="space-y-2 text-[10px]">
            <div className="flex justify-between"><span>Sprint Team 1 (WebSockets):</span><span className="text-white">95% Alloc.</span></div>
            <div className="flex justify-between"><span>Sprint Team 2 (RAG & DB):</span><span className="text-white">82% Alloc.</span></div>
            <div className="flex justify-between"><span>QA Testing Team:</span><span className="text-white">110% Alloc.</span></div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" /> Workload Alerts
          </h2>
          <div className="p-2.5 bg-yellow-500/5 border border-yellow-500/20 rounded text-[10px] text-yellow-300">
            QA Testing team has exceeded 100% allocation due to release tag coverage verification requests.
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
