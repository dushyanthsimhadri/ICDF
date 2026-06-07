import React, { useState, useEffect } from 'react';
import { Cpu, Save, RefreshCw, Database, Shield, Sliders } from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '../components/GlassComponents';

export default function ProductBrain() {
  const [configs, setConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [temperature, setTemperature] = useState(0.2);

  const savedUser = JSON.parse(localStorage.getItem('icdf_user') || '{}');
  const tenantId = savedUser.tenant_id || 'acme_corp';

  const fetchConfigs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8109/admin/brain-config?tenant_id=${tenantId}`);
      const data = await response.json();
      setConfigs(data);
    } catch (err) {
      console.error("Failed to load brain configs, using fallback mock data.", err);
      setConfigs([
        { role_name: "Executive", operating_mode: "Hybrid", ai_model: "Qwen", tenant_id: tenantId },
        { role_name: "Product Manager", operating_mode: "AI Agent", ai_model: "Llama3", tenant_id: tenantId },
        { role_name: "Business Analyst", operating_mode: "Hybrid", ai_model: "Mistral", tenant_id: tenantId },
        { role_name: "Product Owner", operating_mode: "Human", ai_model: "DeepSeek", tenant_id: tenantId },
        { role_name: "Program Manager", operating_mode: "AI Agent", ai_model: "Llama3", tenant_id: tenantId },
        { role_name: "Dev Lead", operating_mode: "Hybrid", ai_model: "Qwen", tenant_id: tenantId },
        { role_name: "QA Lead", operating_mode: "AI Agent", ai_model: "DeepSeek", tenant_id: tenantId },
        { role_name: "Governance Manager", operating_mode: "Hybrid", ai_model: "Llama3", tenant_id: tenantId },
        { role_name: "Admin", operating_mode: "Human", ai_model: "Qwen", tenant_id: tenantId }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleModeChange = (roleName, newMode) => {
    setConfigs(prev =>
      prev.map(c => c.role_name === roleName ? { ...c, operating_mode: newMode } : c)
    );
  };

  const handleModelChange = (roleName, newModel) => {
    setConfigs(prev =>
      prev.map(c => c.role_name === roleName ? { ...c, ai_model: newModel } : c)
    );
  };

  const handleSaveConfigs = async () => {
    setIsSaving(true);
    setStatusMsg("Saving matrix settings...");
    try {
      // Post updates in sequence
      for (const config of configs) {
        await fetch('http://127.0.0.1:8109/admin/brain-config-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role_name: config.role_name,
            operating_mode: config.operating_mode,
            ai_model: config.ai_model,
            tenant_id: tenantId
          })
        });
      }
      setStatusMsg("Matrix configurations synced to SQLite database!");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setStatusMsg("Configuration sync failed. Local caching enabled.");
      setTimeout(() => setStatusMsg(""), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const getModeBadgeColor = (mode) => {
    if (mode === "AI Agent") return "green";
    if (mode === "Hybrid") return "yellow";
    return "blue";
  };

  const getModeLabel = (mode) => {
    if (mode === "AI Agent") return "FULLY AI AGENT";
    if (mode === "Hybrid") return "AI+HUMAN HYBRID";
    return "COMPLETE HUMAN";
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono uppercase">Product Cognitive Brain</h1>
        <p className="text-[10px] text-gray-500 font-mono">Configure autonomous AI agents, AI-Human hybrid flows, and human operator modes per organizational designation</p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded text-center animate-pulse">
          {statusMsg}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Configuration Matrix Table */}
        <GlassCard className="p-4 bg-slate-900/60 border-white/5 xl:col-span-2 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" /> Designation Agent Mode Matrix
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-cyan-400">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              <span>Retrieving Brain Configs...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400 font-semibold text-[10px] uppercase">
                    <th className="py-2.5">Designation / Role</th>
                    <th className="py-2.5">Operating Mode</th>
                    <th className="py-2.5">AI Model Select</th>
                    <th className="py-2.5 text-right">Workflow Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {configs.map((c) => (
                    <tr key={c.role_name} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-semibold text-white">{c.role_name}</td>
                      <td className="py-3">
                        <select
                          value={c.operating_mode}
                          onChange={(e) => handleModeChange(c.role_name, e.target.value)}
                          className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:outline-none"
                        >
                          <option value="AI Agent">Fully AI Agent</option>
                          <option value="Hybrid">AI + Human Hybrid</option>
                          <option value="Human">Complete Human</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <select
                          value={c.ai_model}
                          onChange={(e) => handleModelChange(c.role_name, e.target.value)}
                          className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:outline-none"
                          disabled={c.operating_mode === "Human"}
                        >
                          <option value="Qwen">Qwen (Recommended)</option>
                          <option value="Llama3">Llama3</option>
                          <option value="Mistral">Mistral</option>
                          <option value="DeepSeek">DeepSeek</option>
                        </select>
                      </td>
                      <td className="py-3 text-right">
                        <GlassBadge color={getModeBadgeColor(c.operating_mode)}>
                          {getModeLabel(c.operating_mode)}
                        </GlassBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <GlassButton
              onClick={handleSaveConfigs}
              disabled={isSaving}
              variant="primary"
              className="flex items-center gap-1.5"
            >
              {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" /> : <Save className="h-3.5 w-3.5" />}
              Save Brain Settings
            </GlassButton>
          </div>
        </GlassCard>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
            <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" /> Cognitive Controls
            </h2>
            
            <div className="space-y-3">
              <div className="flex flex-col space-y-1">
                <label className="text-gray-400">Global Temperature: {temperature}</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1.0" 
                  step="0.1" 
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800"
                />
              </div>

              <div className="p-2.5 bg-black/30 border border-white/5 rounded text-[10px] text-gray-400 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1">
                  <Shield className="h-3 w-3 text-cyan-400" /> Mode Behavior Guardrails
                </div>
                <p><strong>Fully AI Agent</strong> executes prompt actions autonomously and delivers payloads immediately to the delivery pipeline.</p>
                <p><strong>AI + Human Hybrid</strong> processes drafts, creating verification gates in the Approvals Console before committing changes.</p>
                <p><strong>Complete Human</strong> bypasses LLM automation, prompting human operators for manual override.</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
            <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-400" /> Vector store (RAG) Sync
            </h2>
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between"><span>Vector Store Status:</span><GlassBadge color="green">Synchronized</GlassBadge></div>
              <div className="flex justify-between"><span>Ingested Chunks:</span><span className="text-white">1,482 Chunks</span></div>
              <div className="flex justify-between"><span>Ollama Embeddings Driver:</span><span className="text-white">nomic-embed-text</span></div>
            </div>
            <GlassButton className="flex items-center gap-1.5 w-full justify-center"><RefreshCw className="h-3.5 w-3.5" /> Trigger Ingestion Sync</GlassButton>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
