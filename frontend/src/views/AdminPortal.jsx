import React, { useState } from 'react';
import { Database, ShieldCheck, Activity, Key } from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '../components/GlassComponents';

export default function AdminPortal() {
  const [dbStatus, setDbStatus] = useState("Online");
  const [rebuildStatus, setRebuildStatus] = useState(null);

  const handleRebuild = async () => {
    setRebuildStatus("Rebuilding...");
    try {
      const res = await fetch('http://127.0.0.1:8109/admin/rebuild-db', { method: 'POST' });
      const data = await res.json();
      setRebuildStatus(data.status || "Rebuild complete.");
    } catch (err) {
      setRebuildStatus("Error executing rebuild.");
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono">SYSTEM CONFIGURATION PORTAL</h1>
        <p className="text-[10px] text-gray-500 font-mono">Perform database re-indexing, triggers check, and encryption keys setup</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-400" /> Database Administration
          </h2>
          <div className="space-y-2 text-[10px]">
            <div className="flex justify-between"><span>SQLite Engine:</span><GlassBadge color="green">{dbStatus}</GlassBadge></div>
            <div className="flex justify-between"><span>Active Connection Pool:</span><span className="text-white">5 Active</span></div>
          </div>
          <div className="flex gap-2">
            <GlassButton onClick={handleRebuild}>Rebuild Schema</GlassButton>
          </div>
          {rebuildStatus && <div className="text-[10px] text-cyan-400 mt-2">{rebuildStatus}</div>}
        </GlassCard>

        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <Key className="h-4 w-4 text-purple-400" /> Encryption Keys
          </h2>
          <p className="text-[10px] text-gray-400">SOC2 compliant AES-256 decryption keys rotates automatically every 30 days.</p>
          <GlassButton>Rotate Key Matrix</GlassButton>
        </GlassCard>
      </div>
    </div>
  );
}
