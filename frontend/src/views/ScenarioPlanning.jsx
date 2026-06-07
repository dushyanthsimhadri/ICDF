import React, { useState } from 'react';
import { Settings, Play, Award } from 'lucide-react';
import { GlassCard, GlassButton } from '../components/GlassComponents';

export default function ScenarioPlanning() {
  const [engineers, setEngineers] = useState(12);
  const [scopeMultiplier, setScopeMultiplier] = useState(1.0);

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono">SCENARIO WHAT-IF SIMULATIONS</h1>
        <p className="text-[10px] text-gray-500 font-mono">Model capacity shifts, scope expansion/reduction and impact on sprint milestones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <Settings className="h-4 w-4 text-cyan-400" /> Simulation Sliders
          </h2>
          
          <div className="space-y-3">
            <div className="flex flex-col space-y-1">
              <label className="text-gray-400">Allocated Engineers Count: {engineers}</label>
              <input 
                type="range" 
                min="5" 
                max="30" 
                value={engineers}
                onChange={(e) => setEngineers(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-gray-400">Scope Complexity Multiplier: {scopeMultiplier}x</label>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1" 
                value={scopeMultiplier}
                onChange={(e) => setScopeMultiplier(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-400" /> Predicted Output
            </h2>
            <div className="space-y-2 text-[10px] pt-2">
              <div className="flex justify-between"><span>Estimated Velocity:</span><span className="text-cyan-400 font-bold">{(engineers * 5.2 / scopeMultiplier).toFixed(1)} Points / Sprint</span></div>
              <div className="flex justify-between"><span>Risk Index:</span><span className={scopeMultiplier > 1.4 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>{scopeMultiplier > 1.4 ? 'High' : 'Low'}</span></div>
            </div>
          </div>
          <GlassButton variant="primary" className="flex items-center gap-1.5 self-start"><Play className="h-3.5 w-3.5" /> Run Simulation model</GlassButton>
        </GlassCard>
      </div>
    </div>
  );
}
