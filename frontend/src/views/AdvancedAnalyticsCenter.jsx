import React from 'react';
import { BarChart2, ShieldCheck, Activity } from 'lucide-react';
import { GlassCard } from '../components/GlassComponents';

export default function AdvancedAnalyticsCenter() {
  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono">ADVANCED ANALYTICS CENTER</h1>
        <p className="text-[10px] text-gray-500 font-mono">Multi-tenant telemetry, code coverage metrics, and rolling deploy velocity graphs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400 uppercase">Deployment Success Rate</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">99.85%</div>
          <div className="text-[10px] text-emerald-500">+0.2% improvement this month</div>
        </GlassCard>

        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400 uppercase">Testing Code Coverage</span>
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white">88.42%</div>
          <div className="text-[10px] text-cyan-500">+1.5% from last sprint</div>
        </GlassCard>

        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400 uppercase">Monthly API Telemetry</span>
            <BarChart2 className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white">4.2M Calls</div>
          <div className="text-[10px] text-purple-500">Across 12 tenant isolation profiles</div>
        </GlassCard>
      </div>
    </div>
  );
}
