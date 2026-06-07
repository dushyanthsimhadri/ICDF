import React from 'react';
import { Tag, CheckCircle2, Shield } from 'lucide-react';
import { GlassCard, GlassBadge } from '../components/GlassComponents';

export default function ReleaseCommandCenter() {
  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono">RELEASE COMMAND CENTER</h1>
        <p className="text-[10px] text-gray-500 font-mono">Git release tags orchestration, build pipeline status, and environment gates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <Tag className="h-4 w-4 text-cyan-400" /> Active Build Pipelines
          </h2>
          
          <div className="space-y-2">
            <div className="p-2.5 bg-black/20 border border-white/5 rounded flex justify-between items-center">
              <div>
                <span className="font-bold text-white">v1.2.0-beta.4</span>
                <span className="text-[10px] text-gray-500 block">Triggers: main branch, SOC2 columns check</span>
              </div>
              <GlassBadge color="green">Building</GlassBadge>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-400" /> Deployment Gates Check
          </h2>
          <div className="space-y-2 text-[10px]">
            <div className="flex justify-between items-center p-1.5 bg-black/10 rounded">
              <span>Unit Tests Pass:</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex justify-between items-center p-1.5 bg-black/10 rounded">
              <span>Code Audit Approved:</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
