import React, { useState } from 'react';
import { Activity, ShieldCheck, RefreshCw, Cpu } from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '../components/GlassComponents';

export default function Orchestrator() {
  const [logs, setLogs] = useState([
    { time: "11:24:02", service: "FASTAPI", msg: "Engine server booted up, listening on port 8109." },
    { time: "11:24:05", service: "OLLAMA", msg: "Decryption checking modules seeded successfully." },
    { time: "11:25:12", service: "INTELLIGENCE", msg: "Calculated delivery health metrics load: 94.2%" }
  ]);

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono">COGNITIVE ORCHESTRATOR ENGINE</h1>
        <p className="text-[10px] text-gray-500 font-mono">Live gateway telemetry event logs, pipeline tasks check and database sync queues</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="font-bold text-white">Live Event Log Console</span>
              <GlassBadge color="green">Streaming</GlassBadge>
            </div>
            
            <div className="bg-black/50 p-3 rounded border border-white/5 text-[10px] text-gray-400 space-y-2 h-[250px] overflow-y-auto">
              {logs.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-gray-600 shrink-0">[{l.time}]</span>
                  <span className="text-cyan-400 font-bold shrink-0">{l.service}:</span>
                  <span className="text-gray-300">{l.msg}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
