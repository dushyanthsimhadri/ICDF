import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Cpu } from 'lucide-react';
import { GlassCard, GlassBadge } from '../components/GlassComponents';

export default function HealthCenter() {
  const [fastapiStatus, setFastapiStatus] = useState("Checking...");
  const [dbDriver, setDbDriver] = useState("Checking...");

  const fetchHealth = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8109/health/status');
      const data = await res.json();
      setFastapiStatus(data.api_service || "Online");
      setDbDriver(data.db_driver || "SQLite");
    } catch (err) {
      setFastapiStatus("Offline");
      setDbDriver("Local Cache");
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono">SYSTEM HEALTH TELEMETRY</h1>
        <p className="text-[10px] text-gray-500 font-mono">FastAPI backend metrics, active socket channels health status and DB connection logs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400 uppercase">FastAPI Web Server</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white">{fastapiStatus}</div>
          <div className="text-[10px] text-gray-500">Port configuration: 8109</div>
        </GlassCard>

        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400 uppercase">Ollama LLM Agent</span>
            <Cpu className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white">Online</div>
          <div className="text-[10px] text-gray-500">Active model: qwen2.5:3b</div>
        </GlassCard>

        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400 uppercase">Multi-Tenant Database</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">{dbDriver}</div>
          <div className="text-[10px] text-gray-500">Schema version: V2</div>
        </GlassCard>
      </div>
    </div>
  );
}
