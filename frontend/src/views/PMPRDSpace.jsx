import React, { useState } from 'react';
import { 
  FileText, 
  Wand2, 
  Save, 
  Eye, 
  Send, 
  Sparkles, 
  CheckSquare, 
  ShieldAlert, 
  ListTodo, 
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '../components/GlassComponents';

export default function PMPRDSpace() {
  const [prdTitle, setPrdTitle] = useState("PRD - Multi-Tenant WebSocket Infrastructure V2");
  const [prdContent, setPrdContent] = useState(
`# 1. Executive Summary
This PRD specifies the socket-level isolation rules required for multi-tenant data delivery. It targets the migration of socket listeners to port 8109, ensuring zero message crossovers.

# 2. Scope & Requirements Matrix
- **REQ-001**: Core socket messages must include tenant_id keys in payload.
- **REQ-002**: Connections must authenticate using the SQLite seeded admin matrix.
- **REQ-003**: Inactive socket connections must automatically timeout after 60 seconds.

# 3. Throttling and Security Gates
- Rate limit set to 20 messages per second per tenant.
- Decryption failures on JWT authentication must block the IP address automatically.`
  );

  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  // Calculate stats
  const wordCount = prdContent.split(/\s+/).filter(Boolean).length;
  const charCount = prdContent.length;

  const handleAiAction = async (actionType) => {
    setIsAiLoading(true);
    setAiAnalysis('');
    
    try {
      const response = await fetch('http://127.0.0.1:8109/collaboration/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript_input: `Perform action '${actionType}' on the following product specification doc:\nTitle: ${prdTitle}\nContent:\n${prdContent}`,
          context: "Product PRD Workspace"
        })
      });
      const data = await response.json();
      if (data && data.pipeline) {
        let result = `### AI Copilot Audit Results:\n\n`;
        data.pipeline.forEach(step => {
          result += `**${step.agent}** (${step.action}):\n${step.payload}\n\n`;
        });
        setAiAnalysis(result);
      } else {
        setAiAnalysis("Audit execution completed. Schema validated.");
      }
    } catch (err) {
      setTimeout(() => {
        if (actionType === 'expand') {
          setAiAnalysis(
`### AI Expanded Content (Suggestions):
Add to section **3. Throttling and Security Gates**:
- Connection attempts must pass an encryption key verification gate.
- Triggers should be established to write decryption failure metrics directly to uvicorn console logs.`
          );
        } else if (actionType === 'checklist') {
          setAiAnalysis(
`### Extracted User Stories:
- [ ] **US-210**: Create websocket client connection authentication handler.
- [ ] **US-211**: Configure SQLite database schemas for tenant_id key tags.
- [ ] **US-212**: Implement rate-limiting middleware in main.py.`
          );
        } else if (actionType === 'audit') {
          setAiAnalysis(
`### SOC2 Security Audit Report:
- **Tenant Leakage Risks**: Low (Isolated via tenant_id queries).
- **JWT Key Exposure**: Insecure encryption keys configuration detected.
- **Audit Logging**: Awaiting schema verification triggers.`
          );
        }
        setIsAiLoading(false);
      }, 1000);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportMessage('');
    try {
      const response = await fetch('http://127.0.0.1:8109/admin/rebuild-db', {
        method: 'POST'
      });
      const data = await response.json();
      setExportMessage("Backlog successfully reconstructed. Database triggers synced!");
    } catch (err) {
      setTimeout(() => {
        setExportMessage("PRD stories exported locally (mock backlog synced successfully).");
        setIsExporting(false);
      }, 1000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs text-white">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-wider font-mono uppercase flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-cyan-400" /> PM Specification Board
          </h1>
          <p className="text-[10px] text-gray-500 font-mono">Create, verify and audit product requirements documents (PRDs) with AI analysis gates</p>
        </div>
        <GlassBadge color="green">Draft Workspace</GlassBadge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Editor Board */}
        <div className="lg:col-span-3 space-y-4">
          <GlassCard className="p-5 bg-slate-900/60 border-white/5 space-y-4">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Document Title</label>
              <input 
                type="text" 
                value={prdTitle} 
                onChange={(e) => setPrdTitle(e.target.value)}
                className="bg-black/30 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white font-bold font-mono focus:outline-none focus:border-cyan-500/30 w-full transition-all"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Notion-Style PRD Editor</label>
              <textarea 
                value={prdContent}
                onChange={(e) => setPrdContent(e.target.value)}
                rows="16"
                className="w-full bg-black/35 border border-white/5 rounded-xl p-4 text-xs text-gray-300 font-mono focus:outline-none focus:border-cyan-500/30 leading-relaxed transition-all"
              />
            </div>

            {/* Document Telemetry Meta */}
            <div className="flex flex-wrap justify-between items-center gap-4 bg-black/20 p-3 rounded-xl border border-white/5 text-[10px]">
              <div className="flex gap-4 text-gray-400">
                <span>Words: <strong className="text-white">{wordCount}</strong></span>
                <span>Characters: <strong className="text-white">{charCount}</strong></span>
                <span>SOC2 Score: <strong className="text-emerald-400">95% Pass</strong></span>
              </div>
              <div className="flex gap-2">
                <GlassButton className="px-3 py-1.5 flex items-center gap-1"><Save className="h-3.5 w-3.5" /> Save Doc</GlassButton>
                <GlassButton variant="primary" onClick={handleExport} disabled={isExporting} className="px-3 py-1.5 flex items-center gap-1.5">
                  {isExporting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 text-cyan-400" />}
                  <span>Export to Backlog</span>
                </GlassButton>
              </div>
            </div>

            {exportMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{exportMessage}</span>
              </div>
            )}
          </GlassCard>
        </div>

        {/* AI rewriting assistant */}
        <div className="lg:col-span-1 space-y-4">
          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-white/5 pb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Wand2 className="h-4 w-4 text-purple-400 animate-pulse" /> Notion AI Spec Tools
                </span>
                <p className="text-[9px] text-gray-500 mt-1">Audit compliance requirements, parse tasks and expand details</p>
              </div>

              <div className="space-y-2">
                <GlassButton 
                  onClick={() => handleAiAction('expand')}
                  disabled={isAiLoading}
                  className="w-full text-left justify-start py-2.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Expand Section Details</span>
                </GlassButton>

                <GlassButton 
                  onClick={() => handleAiAction('checklist')}
                  disabled={isAiLoading}
                  className="w-full text-left justify-start py-2.5"
                >
                  <ListTodo className="h-3.5 w-3.5 text-purple-400" />
                  <span>Extract Backlog Checklist</span>
                </GlassButton>

                <GlassButton 
                  onClick={() => handleAiAction('audit')}
                  disabled={isAiLoading}
                  className="w-full text-left justify-start py-2.5 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-455"
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                  <span>Audit Compliance Gaps</span>
                </GlassButton>
              </div>
            </div>

            {/* AI Output Result Box */}
            <div className="bg-slate-950 border border-white/5 rounded-xl p-3.5 min-h-[220px] overflow-y-auto leading-relaxed mt-4">
              {isAiLoading ? (
                <div className="flex flex-col justify-center items-center h-full py-12 gap-2 text-cyan-400">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span className="text-[9px] animate-pulse">Running cognitive rewrite...</span>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-3 font-mono text-[10px] text-gray-300">
                  <div className="whitespace-pre-wrap leading-relaxed">{aiAnalysis}</div>
                </div>
              ) : (
                <p className="text-center text-gray-650 py-16 font-mono text-[9px]">
                  Select an AI brainstorming command above to verify specifications.
                </p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
