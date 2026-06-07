import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Cpu, Milestone, Zap, Compass } from 'lucide-react';
import { GlassCard } from './GlassComponents';

export default function RoadProgress({ sprintStatus = 45, setSprintStatus }) {
  const stages = [
    { name: 'Backlog', percentage: 10, label: '01. Plan' },
    { name: 'Development', percentage: 35, label: '02. Code' },
    { name: 'QA Testing', percentage: 60, label: '03. Test' },
    { name: 'Staging Gate', percentage: 80, label: '04. Gate' },
    { name: 'Production', percentage: 100, label: '05. Ship' }
  ];

  const [predictions, setPredictions] = React.useState({
    velocity: 70,
    confidence: 90,
    delay: 0.0,
    blockers: 0,
    risk: 'Low'
  });

  React.useEffect(() => {
    const fetchPredictiveData = async () => {
      try {
        const userStr = localStorage.getItem('icdf_user');
        const user = userStr ? JSON.parse(userStr) : null;
        const tenant = user?.tenant_id || 'acme_corp';
        const activeRole = localStorage.getItem('icdf_active_role') || user?.role || 'Guest';
        
        const response = await fetch(`http://127.0.0.1:8109/workflows/tickets?tenant_id=${tenant}`, {
          headers: {
            'X-User-Role': activeRole,
            'X-User-Tenant': tenant
          }
        });
        const tickets = await response.json();
        
        if (tickets && tickets.length > 0) {
          const blockersCount = tickets.filter(t => 
            t.status.toLowerCase() === 'blocked' || 
            t.priority.toLowerCase() === 'critical' || 
            (t.description && t.description.toLowerCase().includes('blocked'))
          ).length;
          
          const riskProfile = blockersCount > 2 ? 'High' : (blockersCount > 0 ? 'Medium' : 'Low');
          const totalTickets = tickets.length;
          const completedTickets = tickets.filter(t => 
            t.status.toLowerCase() === 'completed' || 
            t.status.toLowerCase() === 'done' || 
            t.status.toLowerCase() === 'ready' || 
            t.status.toLowerCase() === 'merged'
          ).length;
          
          const confidencePct = totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 90;
          const delayDays = Number((blockersCount * 1.5 + (totalTickets - completedTickets) * 0.2).toFixed(1));
          const predictedVelocity = Math.max(30, 68 + totalTickets - blockersCount * 4);
          
          setPredictions({
            velocity: predictedVelocity,
            confidence: Math.max(10, Math.min(100, confidencePct)),
            delay: delayDays,
            blockers: blockersCount,
            risk: riskProfile
          });
        }
      } catch (err) {
        console.error("Error loading Sprint Highway predictions:", err);
      }
    };
    
    fetchPredictiveData();
    const interval = setInterval(fetchPredictiveData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard className="p-4 bg-slate-955/75 border-white/5 flex flex-col xl:flex-row justify-between items-center gap-6 relative overflow-hidden font-mono shadow-[0_0_25px_rgba(0,0,0,0.8)]">
      {/* Background animated grid for cyber highway feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />

      <div className="flex items-center gap-3 shrink-0 z-10">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white tracking-widest uppercase flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-cyan-400 animate-spin-slow" /> Sprint Highway V2
          </span>
          <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">Active Run: Sprint 42</span>
        </div>
      </div>

      {/* Main road progress bar */}
      <div className="flex-grow w-full max-w-[700px] relative h-10 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-xl overflow-hidden flex items-center px-6 shadow-inner z-10">
        <div className="absolute inset-0 bg-noise opacity-5" />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-slate-600/50" />
        <div className="absolute bottom-0 inset-x-0 h-[2px] bg-slate-600/50" />
        <div className="absolute inset-x-0 h-0.5 border-t border-dashed border-yellow-400/50 z-0 top-[18px]" />
        
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${sprintStatus}%` }}
          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/25 to-cyan-400/40 border-r-[3px] border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)] z-0"
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        <motion.div
          className="absolute z-20 pointer-events-none"
          initial={{ left: 0 }}
          animate={{ left: `calc(${sprintStatus}% - 24px)` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="absolute -inset-1.5 bg-cyan-500/50 rounded-full blur-[8px] animate-pulse" />
          <div className="relative bg-slate-900 border border-cyan-400 text-cyan-400 p-1 rounded-md shadow-md flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 fill-cyan-400/20 animate-bounce" />
          </div>
        </motion.div>

        <div className="w-full flex justify-between items-center z-10 relative">
          {stages.map((stage, idx) => {
            const isActive = sprintStatus >= stage.percentage;
            return (
              <div key={idx} className="flex flex-col items-center">
                <button 
                  onClick={() => setSprintStatus && setSprintStatus(stage.percentage)}
                  className={`h-4 w-4 rounded-full border-2 transition-all flex items-center justify-center ${
                    isActive 
                      ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)] scale-110' 
                      : 'bg-slate-950 border-slate-700 hover:border-slate-500'
                  }`}
                  title={`Set progress to ${stage.percentage}%`}
                >
                  {isActive && <div className="h-1.5 w-1.5 rounded-full bg-slate-950" />}
                </button>
                <div className="flex flex-col items-center mt-1">
                  <span className={`text-[7px] uppercase tracking-wider font-bold ${isActive ? 'text-cyan-400' : 'text-gray-500'}`}>
                    {stage.name}
                  </span>
                  <span className="text-[6px] text-gray-500 font-bold">{stage.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded V2 HUD Telemetry Panel */}
      <div className="flex items-center gap-4 shrink-0 text-[9px] text-gray-400 z-10 select-none font-mono">
        <div className="flex flex-col">
          <span className="text-gray-500 text-[7px] uppercase font-bold">Velocity Pred.</span>
          <span className="text-white font-bold text-xs">{predictions.velocity} pts</span>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex flex-col">
          <span className="text-gray-500 text-[7px] uppercase font-bold">Release Conf.</span>
          <span className={`font-bold text-xs ${predictions.confidence >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {predictions.confidence}%
          </span>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex flex-col">
          <span className="text-gray-500 text-[7px] uppercase font-bold">Delay Forecast</span>
          <span className={`font-bold text-xs ${predictions.delay > 1 ? 'text-rose-455' : 'text-white'}`}>
            +{predictions.delay}d
          </span>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex flex-col">
          <span className="text-gray-500 text-[7px] uppercase font-bold">Blockers</span>
          <span className={`font-bold text-xs ${predictions.blockers > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
            {predictions.blockers} Active
          </span>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex flex-col">
          <span className="text-gray-500 text-[7px] uppercase font-bold">Risk Profile</span>
          <span className={`font-bold uppercase text-[9px] px-1 py-0.5 rounded ${
            predictions.risk === 'High' ? 'bg-rose-500/10 text-rose-400' : 
            (predictions.risk === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400')
          }`}>
            {predictions.risk}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
