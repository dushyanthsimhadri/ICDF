import React, { useState, useEffect } from 'react';
import { Sparkles, Play, RefreshCw, AlertCircle, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from './GlassComponents';

export default function AIAgentSandbox({ role }) {
  const [config, setConfig] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  const savedUser = JSON.parse(localStorage.getItem('icdf_user') || '{}');
  const tenantId = savedUser.tenant_id || 'acme_corp';

  // Map roles to suggested prompts
  const suggestionsMap = {
    "Executive": [
      "Verify release confidence index and risk factors",
      "Audit Q3 portfolio budget allocation and spent ratio",
      "Evaluate incident response risk projection"
    ],
    "Product Manager": [
      "Draft spec requirements for WebSockets telemetry transition",
      "Summarize weekly standup transcripts and decisions",
      "Calculate RICE prioritization matrix for active specs"
    ],
    "Business Analyst": [
      "Extract functional requirements from discovery meeting notes",
      "Draft user stories for JWT token rotation integration",
      "Verify SOC2 policy compliance audit checkpoints"
    ],
    "Product Owner": [
      "Prioritize Jira delivery tickets backlog by dependency weights",
      "Score sprint ticket velocities and burnout risk metrics",
      "Create release train checklist validation items"
    ],
    "Program Manager": [
      "Simulate capacity slip by 2 weeks on roadmap timeline",
      "Verify engineering resource allocation and team burnout",
      "Audit cross-team dependencies blocking release v2.4"
    ],
    "Dev Lead": [
      "Scan codebase for plain-text secrets and configurations",
      "Evaluate WebSocket handshake connection handshake latency",
      "Draft GitHub actions deployment workflow for staging"
    ],
    "QA Lead": [
      "Generate QA regression suite outline for websocket module",
      "Verify automated staging integration tests status",
      "Analyze failed build log files and check warnings"
    ],
    "Admin": [
      "Verify SOC2 security configurations on database connections",
      "List organization audit logs summary and alert anomalies",
      "Check API connector health score and token expires"
    ]
  };

  const suggestions = suggestionsMap[role] || [
    "Run agent diagnostic suite",
    "List active tasks status summary",
    "Evaluate workspace telemetry parameters"
  ];

  const fetchAgentConfig = async () => {
    setIsConfigLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8109/agents/config/${role}?tenant_id=${tenantId}`);
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      console.error("Config fetch failed", err);
      // Fallback
      setConfig({
        role_name: role,
        operating_mode: "Hybrid",
        ai_model: "Qwen"
      });
    } finally {
      setIsConfigLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentConfig();
    setOutput(null);
    setPrompt("");
  }, [role]);

  const handleExecute = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setOutput(null);

    try {
      const response = await fetch('http://127.0.0.1:8109/agents/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: role,
          query: prompt,
          context: `Executing under tenant workspace: ${tenantId}. Active model: ${config?.ai_model || "Qwen"}. Mode: ${config?.operating_mode || "Hybrid"}.`,
          tenant_id: tenantId
        })
      });
      const data = await response.json();
      setOutput(data);
    } catch (err) {
      console.error(err);
      setOutput({
        mode: config?.operating_mode || "Hybrid",
        model: config?.ai_model || "Qwen",
        response: "[COMMUNICATION FAILURE] The local Ollama backend connector failed to respond. Fallback mock generated:\n\nExecution simulated. Delivery gates cleared.",
        status: "Error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getModeBadge = () => {
    if (isConfigLoading || !config) {
      return <GlassBadge color="blue">RETRIEVING STATUS...</GlassBadge>;
    }
    const mode = config.operating_mode;
    const model = config.ai_model;
    
    if (mode === "AI Agent") {
      return <GlassBadge color="green">FULLY AI AGENT ({model})</GlassBadge>;
    }
    if (mode === "Hybrid") {
      return <GlassBadge color="yellow">AI+HUMAN HYBRID ({model})</GlassBadge>;
    }
    return <GlassBadge color="blue">COMPLETE HUMAN</GlassBadge>;
  };

  return (
    <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-2.5 gap-2">
        <h2 className="font-bold text-white flex items-center gap-1.5 uppercase font-mono tracking-wider">
          <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" /> {role} AI Agent Sandbox
        </h2>
        <div className="flex items-center gap-2">
          {getModeBadge()}
          <GlassButton onClick={fetchAgentConfig} className="p-1 rounded hover:bg-white/5">
            <RefreshCw className="h-3 w-3 text-gray-400" />
          </GlassButton>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Suggested Instructions:</label>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(s)}
              className="text-[9px] bg-black/40 border border-white/5 rounded px-2 py-1 text-gray-400 hover:text-white hover:border-cyan-500/30 transition-all text-left font-mono truncate max-w-full"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Action Prompt Input */}
      <div className="space-y-2">
        <textarea
          rows={2}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Enter instruction/command for the ${role} AI Agent...`}
          className="w-full bg-black/30 border border-white/5 rounded p-2 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/30 transition-all font-mono text-xs"
        />

        <div className="flex justify-between items-center">
          <span className="text-[9px] text-gray-500 font-mono">
            {config?.operating_mode === "Human" 
              ? "⚠️ Automation disabled: Routed directly to human operator queue" 
              : `🤖 Powered by local ${config?.ai_model || "Qwen"} model profile`}
          </span>
          <GlassButton
            onClick={handleExecute}
            disabled={isLoading || !prompt.trim()}
            variant="primary"
            className="flex items-center gap-1.5"
          >
            {isLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" /> : <Play className="h-3.5 w-3.5 fill-cyan-400/20 text-cyan-400" />}
            Execute Autopilot
          </GlassButton>
        </div>
      </div>

      {/* Output Screen */}
      {(isLoading || output) && (
        <div className="bg-black/40 border border-white/5 rounded p-3 space-y-2 relative overflow-hidden">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-6 text-cyan-400 space-y-2 font-mono">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="text-[10px] animate-pulse">Agent thinking & scanning context...</span>
            </div>
          )}

          {output && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                <span className="text-[10px] text-gray-400">Autopilot Execution Result:</span>
                {output.status === "Awaiting Human" || output.mode === "Human" ? (
                  <GlassBadge color="blue" className="flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" /> HUMAN ASSIGNED
                  </GlassBadge>
                ) : output.status === "Pending Approval" || output.response.includes("QUEUED") ? (
                  <GlassBadge color="yellow" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> PENDING GATE APPROVAL
                  </GlassBadge>
                ) : (
                  <GlassBadge color="green" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> DISPATCHED SUCCESS
                  </GlassBadge>
                )}
              </div>

              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-[11px] bg-black/10 p-2 rounded border border-white/5 font-mono max-h-48 overflow-y-auto">
                {output.response || output.output}
              </div>

              {/* Action metadata indicator */}
              {(output.status === "Pending Approval" || output.response.includes("QUEUED")) && (
                <div className="text-[9px] text-amber-400/90 bg-amber-500/5 border border-amber-500/10 rounded p-2 flex items-start gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <div>
                    <strong>Hybrid Verification Gate Triggered:</strong> The drafted output above was queued as a pending Workflow Action in the database. Go to the **Approval Gates** console to approve or override this action.
                  </div>
                </div>
              )}

              {(output.status === "Awaiting Human" || output.mode === "Human") && (
                <div className="text-[9px] text-cyan-400/90 bg-cyan-500/5 border border-cyan-500/10 rounded p-2 flex items-start gap-1.5">
                  <Cpu className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <div>
                    <strong>Manual Override Required:</strong> Complete Human mode suspends autonomous agent execution. The request remains in the queue for direct manual operation.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
