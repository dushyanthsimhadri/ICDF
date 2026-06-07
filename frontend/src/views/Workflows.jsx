import React, { useState } from 'react';
import { CheckCircle2, Play, Flame } from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '../components/GlassComponents';

export default function Workflows() {
  const [workflows] = useState([
    { name: "Verify SQLite Decryption Gate Configuration", status: "Active", steps: 3 },
    { name: "Jira Backlog Priority WSJF Sync Pipeline", status: "Idle", steps: 5 }
  ]);

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono">AUTOMATION WORKFLOWS</h1>
        <p className="text-[10px] text-gray-500 font-mono">Define automated delivery pipelines, sync triggers, and QA tests execution</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Active Automated Pipelines
          </h2>
          <div className="space-y-2">
            {workflows.map((w, i) => (
              <div key={i} className="p-2.5 bg-black/20 border border-white/5 rounded flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">{w.name}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{w.steps} cognitive gate steps</div>
                </div>
                <GlassBadge color="green">{w.status}</GlassBadge>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
