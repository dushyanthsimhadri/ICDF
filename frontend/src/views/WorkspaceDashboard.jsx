import React from 'react';
import { Activity, Bell, ShieldAlert } from 'lucide-react';
import { GlassCard, GlassBadge } from '../components/GlassComponents';

export default function WorkspaceDashboard({ currentUser }) {
  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono">WORKSPACE DASHBOARD</h1>
        <p className="text-[10px] text-gray-500 font-mono">Welcome back! Check recent alerts, active pipelines status and logs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400 uppercase">Active Alerts</span>
            <ShieldAlert className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="text-xl font-bold text-white">0 System Blockers</div>
          <div className="text-[10px] text-emerald-400">All systems operational</div>
        </GlassCard>

        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400 uppercase">Current User Profile</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white uppercase">{currentUser?.role || 'Guest'}</div>
          <div className="text-[10px] text-gray-500">{currentUser?.email}</div>
        </GlassCard>
      </div>
    </div>
  );
}
