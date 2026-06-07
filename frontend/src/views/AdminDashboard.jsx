import React, { useState } from 'react';
import { Database, ShieldAlert, Activity, CheckSquare, Globe, Server, RefreshCw, Share2 } from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '../components/GlassComponents';
import AIAgentSandbox from '../components/AIAgentSandbox';

export default function AdminDashboard() {
  const [tenants] = useState([
    { name: "Acme Corp", id: "acme_corp", status: "Active", db: "SQLite", load: "12%" },
    { name: "Starfleet HQ", id: "starfleet_hq", status: "Active", db: "Postgres", load: "45%" }
  ]);

  const [replicas, setReplicas] = useState([
    { region: "US-East (Virginia)", role: "Primary / Writer", status: "Synchronized", latency: "0ms", health: 100 },
    { region: "EU-West (Ireland)", role: "Read Replica", status: "Replicating", latency: "14ms", health: 98 },
    { region: "AP-South (Mumbai)", role: "Read Replica", status: "Replicating", latency: "28ms", health: 99 }
  ]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const handleForceSync = () => {
    setIsSyncing(true);
    setSyncMessage("Synchronizing replica buffers...");
    setTimeout(() => {
      setReplicas(prev => prev.map(rep => ({ ...rep, latency: "0ms", status: "Synchronized" })));
      setIsSyncing(false);
      setSyncMessage("All database replication nodes are in 100% lockstep sync!");
      setTimeout(() => setSyncMessage(""), 4000);
    }, 2000);
  };

  return (
    <div className="space-y-6 font-mono text-xs text-white">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono uppercase">Admin System Console</h1>
        <p className="text-[10px] text-gray-500 font-mono">Verify database status, active multi-tenant scopes, distribution shards, and active database replicas</p>
      </div>

      {syncMessage && (
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded text-center animate-pulse">
          {syncMessage}
        </div>
      )}

      {/* Database Distribution & Replication Console */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Replicas Node List */}
        <GlassCard className="xl:col-span-2 p-4 bg-slate-900/60 border-white/5 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <Server className="h-4 w-4 text-emerald-400" /> Clustered Replica Nodes
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-semibold uppercase">
                  <th className="py-2">Replica Node / Region</th>
                  <th className="py-2">Replication Role</th>
                  <th className="py-2 text-center">Sync Latency</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {replicas.map(r => (
                  <tr key={r.region} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 font-bold flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-cyan-400" /> {r.region}
                    </td>
                    <td className="py-2.5 text-gray-300">{r.role}</td>
                    <td className="py-2.5 text-center text-cyan-400 font-bold">{r.latency}</td>
                    <td className="py-2.5 text-right">
                      <GlassBadge color={r.status === "Synchronized" ? "green" : "yellow"}>
                        {r.status}
                      </GlassBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end pt-2">
            <GlassButton 
              onClick={handleForceSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 text-[10px]"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin text-cyan-400" : ""}`} />
              Force Cluster Sync
            </GlassButton>
          </div>
        </GlassCard>

        {/* Shard Distribution Config Card */}
        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
              <Share2 className="h-4 w-4 text-purple-400" /> Database Shard Distribution
            </h2>
            <div className="space-y-2.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-gray-400">Failover Mode:</span>
                <GlassBadge color="green">AUTOMATED ACTIVE</GlassBadge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Cluster Shards:</span>
                <span className="text-white font-bold">12 Active Shards</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Consensus Engine:</span>
                <span className="text-white">Raft Consensus Core</span>
              </div>
            </div>
            <div className="p-2 bg-black/30 border border-white/5 rounded text-[10px] text-gray-500 leading-relaxed">
              Distribution engine replicates SQLite context transactions across US-East, EU-West, and AP-South regional disks instantly.
            </div>
          </div>
          <GlassButton className="w-full justify-center text-[10px] mt-2">Trigger Failover Simulation</GlassButton>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-400" /> Active Tenant Profiles
          </h2>
          <div className="space-y-2">
            {tenants.map(t => (
              <div key={t.id} className="p-2.5 bg-black/20 border border-white/5 rounded flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">{t.name}</div>
                  <div className="text-[10px] text-gray-500 mt-1">Tenant ID: {t.id} | DB Driver: {t.db}</div>
                </div>
                <div className="text-right">
                  <GlassBadge color="green">{t.status}</GlassBadge>
                  <div className="text-[9px] text-gray-400 mt-1">CPU Load: {t.load}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-yellow-500" /> SOC2 Compliance Logs
          </h2>
          <div className="space-y-2 text-[10px] text-gray-400 font-mono">
            <div>[11:24:02] tenant isolation validated for starfleet_hq</div>
            <div>[11:24:05] oauth credentials sync verification passed</div>
            <div>[11:25:12] database query executed on acme_corp context</div>
          </div>
        </GlassCard>
      </div>

      <AIAgentSandbox role="Admin" />
    </div>
  );
}
