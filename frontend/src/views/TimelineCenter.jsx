import React from 'react';
import { Calendar } from 'lucide-react';
import { GlassCard } from '../components/GlassComponents';

export default function TimelineCenter() {
  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono">TIMELINE WORKSPACE</h1>
        <p className="text-[10px] text-gray-500 font-mono">Interactive Gantt roadmap view of sprint blocks, deploy gates and product epics</p>
      </div>

      <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
        <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-cyan-400" /> Gantt Roadmaps View
        </h2>
        
        <div className="p-4 bg-black/40 border border-white/5 rounded min-h-[150px] flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-24 text-[10px] text-gray-400 uppercase">Multi-Tenant Isolation:</span>
            <div className="flex-grow h-6 bg-cyan-500/20 border border-cyan-500/30 rounded relative flex items-center px-2 text-[9px] text-cyan-200">
              Sprint 41 - Sprint 42 (Active)
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="w-24 text-[10px] text-gray-400 uppercase">Notion AI Integration:</span>
            <div className="flex-grow h-6 bg-purple-500/20 border border-purple-500/30 rounded relative flex items-center px-2 text-[9px] text-purple-200">
              Sprint 42 - Sprint 43 (Planned)
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
