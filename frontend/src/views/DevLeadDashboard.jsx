import React, { useState } from 'react';
import { 
  GitPullRequest, 
  Flame, 
  Code2, 
  ShieldAlert, 
  CheckCircle2, 
  Play, 
  RefreshCw, 
  AlertTriangle, 
  ShieldCheck,
  Server,
  Database,
  ArrowRight,
  Sparkles,
  GitBranch,
  FileCode
} from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '../components/GlassComponents';
import AIAgentSandbox from '../components/AIAgentSandbox';

export default function DevLeadDashboard() {
  const [activeTab, setActiveTab] = useState('summary'); // summary, architecture, api, db, techdebt, pipeline, refactor

  const [pullRequests, setPullRequests] = useState([
    { id: "#104", title: "Feat/websockets telemetry integration pipeline", author: "dev_sprint@icdf.io", checks: "Success", approvals: "Approved", status: "Ready" },
    { id: "#105", title: "Fix/sqlite schema constraints error parameters", author: "dev_db@icdf.io", checks: "Running", approvals: "Pending Review", status: "Running" },
    { id: "#106", title: "Refactor/auth token cached decryption keys", author: "dev_sec@icdf.io", checks: "Success", approvals: "Changes Requested", status: "Blocked" }
  ]);

  const [securityViolations, setSecurityViolations] = useState([
    { id: "SEC-01", file: "connectors/normalize.py:L142", bug: "Plaintext secrets in configuration config_details", severity: "Critical", status: "Open" },
    { id: "SEC-02", file: "auth/bcrypt_patch.py:L12", bug: "Bcrypt rounds factor below compliance levels", severity: "Warning", status: "Mitigated" },
    { id: "SEC-03", file: "api/intelligence.py:L84", bug: "WebSocket listener context connection leak", severity: "Warning", status: "Open" }
  ]);

  const [refactoringDebt, setRefactoringDebt] = useState([
    { module: "database/seed.py", loc: 680, debt: "High duplication on mock loops", difficulty: "Easy" },
    { module: "agents/ollama_client.py", loc: 96, debt: "Mock fallback bypass contains duplicate strings", difficulty: "Medium" }
  ]);

  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  
  // AI Refactor states
  const [refactorCodeInput, setRefactorCodeInput] = useState("def calculate_wsjf(biz_value, time_crit, risk_red, job_size):\n    cod = biz_value + time_crit + risk_red\n    wsjf = cod / job_size\n    return wsjf");
  const [refactorCodeOutput, setRefactorCodeOutput] = useState("");
  const [isRefactoring, setIsRefactoring] = useState(false);

  const handleRunSecurityScan = () => {
    setIsScanning(true);
    setScanMessage("Engaging AI Code compliance scanner on staging repository...");
    setTimeout(() => {
      setSecurityViolations(prev => prev.map(sec => 
        sec.id === "SEC-02" ? { ...sec, status: "Mitigated" } : sec
      ));
      setIsScanning(false);
      setScanMessage("Codebase compliance checks complete. 0 new security violations found!");
      setTimeout(() => setScanMessage(""), 3000);
    }, 2000);
  };

  const handleMergePR = (id) => {
    setPullRequests(prev => prev.map(pr => 
      pr.id === id ? { ...pr, approvals: "Merged", status: "Merged" } : pr
    ));
  };

  const handleAIRefactor = async () => {
    setIsRefactoring(true);
    setRefactorCodeOutput("");
    
    const userStr = localStorage.getItem('icdf_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const tenant = user?.tenant_id || 'acme_corp';
    const activeRole = localStorage.getItem('icdf_active_role') || user?.role || 'Guest';

    try {
      const response = await fetch('http://127.0.0.1:8109/agents/query', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Role': activeRole,
          'X-User-Tenant': tenant
        },
        body: JSON.stringify({
          role: "Dev Lead",
          query: `Refactor this code to follow clean coding standards, add typing, and include error handling:\n\n${refactorCodeInput}`,
          context: "Code Refactor assistant",
          tenant_id: tenant
        })
      });
      const res = await response.json();
      setRefactorCodeOutput(res.response || "Refactoring complete.");
    } catch (err) {
      setTimeout(() => {
        setRefactorCodeOutput(
`# Refactored Code suggestions:
def calculate_wsjf(
    biz_value: float, 
    time_criticality: float, 
    risk_reduction: float, 
    job_size: float
) -> float:
    \"\"\"Calculates Weighted Shortest Job First score to optimize backlog prioritization.\"\"\"
    if job_size <= 0:
        raise ValueError("Job size must be positive and non-zero")
    
    cost_of_delay = biz_value + time_criticality + risk_reduction
    return cost_of_delay / job_size`
        );
        setIsRefactoring(false);
      }, 1000);
    } finally {
      setIsRefactoring(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs text-white">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider font-mono uppercase">Dev Lead Command Center</h1>
          <p className="text-[10px] text-gray-500 font-mono">Verify architectural compliance, merge pull requests, review schemas, and refactor code complexity</p>
        </div>
        
        {/* Tab Selectors */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'summary', label: 'Summary' },
            { id: 'architecture', label: 'Architecture' },
            { id: 'api', label: 'API Board' },
            { id: 'db', label: 'DB Designer' },
            { id: 'techdebt', label: 'Tech Debt' },
            { id: 'pipeline', label: 'Pipeline' },
            { id: 'refactor', label: 'AI Refactor' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-bold uppercase transition-all ${
                activeTab === tab.id 
                  ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-400' 
                  : 'bg-black/30 border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {scanMessage && (
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded text-center animate-pulse">
          {scanMessage}
        </div>
      )}

      {/* Main rendering area based on active tab */}
      {activeTab === 'summary' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "PR Cycle Velocity", val: "4.8 days", sub: "15% faster than average", icon: GitPullRequest, color: "text-blue-400" },
              { label: "Test Coverage %", val: "91.8%", sub: "Staging build pass threshold", icon: ShieldCheck, color: "text-emerald-400" },
              { label: "Secrets Violations", val: "0 Active", sub: "AES key scans complete", icon: Code2, color: "text-cyan-400" },
              { label: "Refactoring Hotspots", val: "2 Modules", sub: "Calculated tech debt: High", icon: Flame, color: "text-rose-400" }
            ].map((m, idx) => (
              <GlassCard key={idx} className="p-4 flex flex-col justify-between space-y-2 bg-slate-900/60 border-white/5 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] text-gray-400 font-mono uppercase">{m.label}</span>
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                </div>
                <div>
                  <div className="text-lg font-bold text-white tracking-wide font-mono">{m.val}</div>
                  <div className="text-[9px] text-gray-500 font-mono mt-0.5">{m.sub}</div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4 xl:col-span-1 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-1.5">
                  <GitPullRequest className="h-4 w-4 text-cyan-400" /> Git PR Merge Gates
                </h2>
                <div className="space-y-3">
                  {pullRequests.map((pr) => (
                    <div key={pr.id} className="p-2.5 bg-black/20 border border-white/5 rounded-xl space-y-2 flex flex-col">
                      <div className="flex justify-between font-bold text-white">
                        <span>{pr.id}: {pr.title.substring(5)}</span>
                        <GlassBadge color={pr.status === "Merged" ? "green" : (pr.status === "Blocked" ? "red" : "yellow")}>
                          {pr.status}
                        </GlassBadge>
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-400">
                        <span>By: {pr.author}</span>
                        <span>Checks: {pr.checks}</span>
                      </div>
                      {pr.status === "Ready" && (
                        <GlassButton 
                          onClick={() => handleMergePR(pr.id)}
                          className="py-1 text-[9px] w-full mt-1 justify-center"
                        >
                          Approve & Merge
                        </GlassButton>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4 xl:col-span-1 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-rose-500" /> Code Security Violations
                </h2>
                <div className="space-y-3">
                  {securityViolations.map((sec) => (
                    <div key={sec.id} className="p-2.5 bg-black/20 border border-white/5 rounded-xl space-y-1.5 flex flex-col">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-white text-[10px] truncate max-w-[75%]">{sec.id}: {sec.bug}</span>
                        <GlassBadge color={sec.severity === "Critical" ? "red" : "yellow"}>
                          {sec.severity}
                        </GlassBadge>
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-500">
                        <span>Location: <code>{sec.file}</code></span>
                        <span className={sec.status === "Mitigated" ? "text-emerald-400" : "text-rose-400"}>
                          {sec.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-white/5">
                <GlassButton 
                  onClick={handleRunSecurityScan}
                  disabled={isScanning}
                  className="w-full justify-center text-[10px] flex items-center gap-1"
                >
                  {isScanning ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" /> : <Play className="h-3.5 w-3.5 text-cyan-400" />}
                  Trigger AI Security Scan
                </GlassButton>
              </div>
            </GlassCard>

            <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4 xl:col-span-1">
              <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-500 animate-pulse" /> Refactoring Hotspots
              </h2>
              <div className="space-y-3">
                {refactoringDebt.map((ref, idx) => (
                  <div key={idx} className="p-3 bg-black/20 border border-white/5 rounded-xl flex justify-between items-center gap-3">
                    <div className="space-y-1">
                      <div className="font-bold text-white text-[11px] truncate max-w-[140px]">{ref.module}</div>
                      <div className="text-[9px] text-gray-500">{ref.debt}</div>
                      <div className="text-[8px] text-gray-400 font-semibold">Size: {ref.loc} lines</div>
                    </div>
                    <GlassBadge color={ref.difficulty === 'Easy' ? 'green' : 'yellow'}>{ref.difficulty}</GlassBadge>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </>
      )}

      {activeTab === 'architecture' && (
        <GlassCard className="p-5 bg-slate-900/60 border-white/5 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <Server className="h-4 w-4 text-cyan-400" /> Architecture Designer
          </h2>
          <p className="text-gray-400 text-[10px]">Visually coordinate microservice structures and component mappings.</p>
          <div className="bg-black/40 border border-white/5 rounded-2xl p-6 min-h-[300px] flex flex-col justify-center items-center text-center space-y-4 relative">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1.5px,transparent_1.5px)] bg-[size:16px_16px] pointer-events-none" />
            
            <div className="flex items-center gap-4 z-10 flex-wrap justify-center">
              <div className="p-3 bg-slate-900 border border-cyan-500/25 rounded-xl text-center w-28">
                <div className="font-bold">Client UI</div>
                <div className="text-[8px] text-cyan-400 mt-1">Vite + React</div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-600" />
              <div className="p-3 bg-slate-900 border border-purple-500/25 rounded-xl text-center w-28">
                <div className="font-bold">API Router</div>
                <div className="text-[8px] text-purple-400 mt-1">FastAPI Engine</div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-600" />
              <div className="p-3 bg-slate-900 border border-emerald-500/25 rounded-xl text-center w-28">
                <div className="font-bold">RAG Memory</div>
                <div className="text-[8px] text-emerald-400 mt-1">SQLite Vector</div>
              </div>
            </div>

            <p className="text-gray-500 text-[9px] max-w-md">
              The platform v3 system architecture enforces decoupled data flows between the frontend and the multi-agent cognitive backplanes, validating authorization tokens on every pipeline transition.
            </p>
          </div>
        </GlassCard>
      )}

      {activeTab === 'api' && (
        <GlassCard className="p-5 bg-slate-900/60 border-white/5 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <Server className="h-4 w-4 text-cyan-400" /> API Mapping Board
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 font-bold uppercase text-[9px]">
                  <th className="pb-2">Method</th>
                  <th className="pb-2">Path</th>
                  <th className="pb-2">Engine Module</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Avg Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[10px]">
                {[
                  { method: "POST", path: "/auth/login", engine: "Auth Engine", status: "Active", latency: "14ms" },
                  { method: "GET", path: "/workflows/tickets", engine: "Workflow Automation", status: "Active", latency: "22ms" },
                  { method: "POST", path: "/collaboration/consensus", engine: "Tri-Agent Consensus", status: "Active", latency: "180ms" },
                  { method: "GET", path: "/admin/brain-config", engine: "Product Brain Config", status: "Active", latency: "9ms" }
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="py-2.5 font-bold"><span className={item.method === 'POST' ? 'text-cyan-400' : 'text-blue-400'}>{item.method}</span></td>
                    <td className="py-2.5 text-gray-300"><code>{item.path}</code></td>
                    <td className="py-2.5 text-gray-450">{item.engine}</td>
                    <td className="py-2.5"><GlassBadge color="green">{item.status}</GlassBadge></td>
                    <td className="py-2.5 text-right font-bold text-white">{item.latency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {activeTab === 'db' && (
        <GlassCard className="p-5 bg-slate-900/60 border-white/5 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-400" /> Database Relationship Designer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { table: "users", keys: ["id (PK)", "email", "hashed_password", "role", "tenant_id"] },
              { table: "tickets", keys: ["id (PK)", "title", "description", "status", "tenant_id"] },
              { table: "prds", keys: ["id (PK)", "title", "overview", "status", "tenant_id"] }
            ].map(model => (
              <div key={model.table} className="p-3 bg-black/30 border border-white/5 rounded-xl space-y-2">
                <div className="font-bold text-cyan-400 border-b border-white/5 pb-1 flex items-center justify-between">
                  <span>{model.table}</span>
                  <span className="text-[7px] text-gray-500 uppercase">SQLite Table</span>
                </div>
                <div className="space-y-1">
                  {model.keys.map(k => (
                    <div key={k} className="text-[9px] text-gray-400 font-mono">{k}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {activeTab === 'techdebt' && (
        <GlassCard className="p-5 bg-slate-900/60 border-white/5 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <Flame className="h-4 w-4 text-rose-500" /> Technical Debt Heatmap
          </h2>
          <p className="text-gray-400 text-[10px]">Visualizing complexity and duplications metrics across repository paths.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { name: "db/models.py", lines: 405, complexity: "Medium", rating: "bg-amber-500/10 border-amber-500/30 text-amber-400" },
              { name: "api/auth.py", lines: 162, complexity: "Low", rating: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
              { name: "agents/ollama_client.py", lines: 142, complexity: "High", rating: "bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse" },
              { name: "main.py", lines: 120, complexity: "Low", rating: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" }
            ].map(hot => (
              <div key={hot.name} className={`p-3 border rounded-xl flex flex-col justify-between min-h-24 ${hot.rating}`}>
                <div className="font-bold truncate">{hot.name}</div>
                <div>
                  <div className="text-[9px] opacity-60">Lines: {hot.lines}</div>
                  <div className="text-[8px] uppercase font-bold mt-1">Debt: {hot.complexity}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {activeTab === 'pipeline' && (
        <GlassCard className="p-5 bg-slate-900/60 border-white/5 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-cyan-400" /> Deployment Pipeline Visualization
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-black/20 border border-white/5 rounded-2xl">
            {[
              { step: "Commit", status: "Success", desc: "Push to main" },
              { step: "Scan", status: "Success", desc: "Vulnerability scan" },
              { step: "Build", status: "Success", desc: "Bundle check" },
              { step: "QA Gate", status: "Success", desc: "Staging regressions" },
              { step: "Production", status: "Pending", desc: "Release train" }
            ].map((p, idx, arr) => (
              <React.Fragment key={p.step}>
                <div className="flex-1 flex flex-col items-center text-center p-3 bg-black/40 border border-white/5 rounded-xl w-full">
                  <div className="font-bold text-white">{p.step}</div>
                  <div className="text-[8px] text-gray-500 mt-0.5">{p.desc}</div>
                  <GlassBadge color={p.status === 'Success' ? 'green' : 'yellow'} className="mt-2">
                    {p.status}
                  </GlassBadge>
                </div>
                {idx < arr.length - 1 && <ArrowRight className="h-4 w-4 text-slate-700 hidden md:block" />}
              </React.Fragment>
            ))}
          </div>
        </GlassCard>
      )}

      {activeTab === 'refactor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
            <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-1.5">
              <FileCode className="h-4 w-4 text-cyan-400" /> Input Code Module
            </h2>
            <textarea
              value={refactorCodeInput}
              onChange={(e) => setRefactorCodeInput(e.target.value)}
              rows="10"
              className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-cyan-300 font-mono focus:outline-none"
            />
            <div className="flex justify-end">
              <GlassButton variant="primary" onClick={handleAIRefactor} disabled={isRefactoring} className="flex items-center gap-1.5">
                {isRefactoring ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>Refactor with AI</span>
              </GlassButton>
            </div>
          </GlassCard>

          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
            <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-400" /> AI Suggestions & Refactored Output
            </h2>
            <div className="bg-slate-950 border border-white/5 rounded-xl p-4 overflow-y-auto min-h-[200px] leading-relaxed whitespace-pre-wrap text-emerald-400 text-[10px]">
              {isRefactoring ? (
                <div className="flex flex-col justify-center items-center h-full py-16 gap-2 text-cyan-400">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span className="text-[9px] animate-pulse">Running refactoring engine...</span>
                </div>
              ) : refactorCodeOutput ? (
                refactorCodeOutput
              ) : (
                <span className="text-gray-650 font-mono text-[9px]">Submit a code block in the left panel to execute AI optimization analysis.</span>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Dev Lead AI Agent Sandbox */}
      <AIAgentSandbox role="Dev Lead" />
    </div>
  );
}
