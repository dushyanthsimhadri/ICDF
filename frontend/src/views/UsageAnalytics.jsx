import React, { useState } from 'react';
import { BarChart3, TrendingUp, Cpu } from 'lucide-react';
import { GlassCard, GlassBadge } from '../components/GlassComponents';

export default function UsageAnalytics() {
  const [analytics] = useState({
    tokensConsumed: "148.5K Tokens",
    apiRequests: "1,242 Calls",
    connectorsSyncCount: "428 Events",
    workflowActionsCount: "42 Executions"
  });

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono">USAGE TELEMETRY ANALYTICS</h1>
        <p className="text-[10px] text-gray-500 font-mono">Multi-tenant usage metrics tracker, api call logs and model usage shares</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400 uppercase">Tokens Consumed</span>
            <Cpu className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white">{analytics.tokensConsumed}</div>
        </GlassCard>

        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400 uppercase">API Request Count</span>
            <BarChart3 className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white">{analytics.apiRequests}</div>
        </GlassCard>
      </div>
    </div>
  );
}
