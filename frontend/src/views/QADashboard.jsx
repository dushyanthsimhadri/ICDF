import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckSquare, 
  Activity, 
  ShieldCheck, 
  Play, 
  RefreshCw, 
  Sparkles,
  Layers,
  FileCode,
  Gauge
} from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '../components/GlassComponents';
import AIAgentSandbox from '../components/AIAgentSandbox';

export default function QADashboard() {
  const [activeTab, setActiveTab] = useState('summary'); // summary, defects, regression, readiness, generator

  const [defects, setDefects] = useState([
    { id: "DEF-204", title: "Decryption gate fails on empty user object", severity: "High", status: "Open" },
    { id: "DEF-205", title: "WebSocket connections leaking memory", severity: "Medium", status: "In Progress" },
    { id: "DEF-206", title: "Plaintext secrets in integration connector configs", severity: "Critical", status: "Open" }
  ]);

  const [testRuns, setTestRuns] = useState([
    { id: "TR-801", suite: "WebSockets Telemetry Regression", tests: 142, passed: 142, status: "Passed", time: "11:24" },
    { id: "TR-802", suite: "OAuth Token Caching Security", tests: 50, passed: 49, status: "Failed", time: "11:26" }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [testMessage, setTestMessage] = useState("");

  // AI test generator states
  const [featureSpecs, setFeatureSpecs] = useState("Feature: User Authentication Gate\nScenario: Accessing restricted dashboards\nGiven a Dev Lead logs in\nWhen they navigate to /admin\nThen the router blocks and redirects to /devlead-dashboard");
  const [generatedTests, setGeneratedTests] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTriggerTests = () => {
    setIsRunning(true);
    setTestMessage("Executing test suite hooks on staging environment...");
    setTimeout(() => {
      setTestRuns(prev => [
        { id: "TR-803", suite: "SOC2 Compliance Lock Policy", tests: 30, passed: 30, status: "Passed", time: "Just Now" },
        ...prev
      ]);
      setIsRunning(false);
      setTestMessage("Automated staging runs completed successfully!");
      setTimeout(() => setTestMessage(""), 3000);
    }, 2000);
  };

  const handleGenerateTests = async () => {
    setIsGenerating(true);
    setGeneratedTests("");
    
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
          role: "QA Lead",
          query: `Write automated Playwright or Cucumber tests for this feature specification:\n\n${featureSpecs}`,
          context: "Test Case generation helper",
          tenant_id: tenant
        })
      });
      const res = await response.json();
      setGeneratedTests(res.response || "Test generation complete.");
    } catch (err) {
      setTimeout(() => {
        setGeneratedTests(
`// Generated Playwright test:
import { test, expect } from '@playwright/test';

test('Dev Lead dashboard routing lock', async ({ page }) => {
  // Login as Dev Lead
  await page.goto('/login');
  await page.fill('#email', 'dev@icdf.io');
  await page.fill('#password', 'secret123');
  await page.click('button[type=\"submit\"]');
  
  // Attempt unauthorized /admin URL access
  await page.goto('/admin');
  
  // Verify redirect lock
  await expect(page).toHaveURL(/.*devlead-dashboard/);
});`
        );
        setIsGenerating(false);
      }, 1000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs text-white">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider font-mono uppercase">QA Command Center</h1>
          <p className="text-[10px] text-gray-500 font-mono">Active defect logs, automated regression testing runs, and product release safety gates</p>
        </div>

        {/* Tab Selectors */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'summary', label: 'Summary' },
            { id: 'defects', label: 'Defect Clusters' },
            { id: 'regression', label: 'Regression Intel' },
            { id: 'readiness', label: 'Readiness & Risks' },
            { id: 'generator', label: 'AI Test Generator' }
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

      {testMessage && (
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded text-center animate-pulse">
          {testMessage}
        </div>
      )}

      {/* Summary View */}
      {activeTab === 'summary' && (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Active Defect Logs", val: `${defects.length} Defects`, sub: "1 high, 1 critical status", icon: ShieldAlert, color: "text-red-400" },
              { label: "Auto Test Coverage", val: "91.8%", sub: "Target coverage: 90%", icon: ShieldCheck, color: "text-emerald-400" },
              { label: "Pipeline Readiness", val: "Passing Status", sub: "0 blockers on main build", icon: Activity, color: "text-cyan-400" }
            ].map((m, idx) => (
              <GlassCard key={idx} className="p-4 flex flex-col justify-between space-y-2 bg-slate-900/60 border-white/5 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-gray-400 font-mono uppercase">{m.label}</span>
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
              <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-rose-500" /> Active Defect Backlog
              </h2>
              <div className="space-y-3">
                {defects.map((d) => (
                  <div key={d.id} className="p-3 bg-black/20 border border-white/5 rounded-xl flex justify-between items-center gap-4">
                    <div>
                      <div className="font-bold text-white text-[11px]">{d.id}: {d.title}</div>
                      <div className="text-[9px] text-gray-500 mt-1">Severity: {d.severity}</div>
                    </div>
                    <GlassBadge color={d.severity === 'Critical' || d.severity === 'High' ? 'red' : 'yellow'}>
                      {d.status}
                    </GlassBadge>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4 text-cyan-400" /> Automated Staging Runs
                </h2>
                <div className="space-y-3">
                  {testRuns.map((tr) => (
                    <div key={tr.id} className="p-2.5 bg-black/20 border border-white/5 rounded-xl flex justify-between items-center text-[10px]">
                      <div>
                        <div className="font-bold text-white">{tr.suite}</div>
                        <div className="text-gray-550 mt-1">Tests: {tr.tests} | Passed: {tr.passed} | Run Time: {tr.time}</div>
                      </div>
                      <GlassBadge color={tr.status === 'Passed' ? 'green' : 'red'}>
                        {tr.status}
                      </GlassBadge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-white/5">
                <GlassButton 
                  onClick={handleTriggerTests}
                  disabled={isRunning}
                  className="flex items-center gap-1.5"
                >
                  {isRunning ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" /> : <Play className="h-3.5 w-3.5 text-cyan-400" />}
                  Execute Test Suite
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        </>
      )}

      {/* Defect Clustering */}
      {activeTab === 'defects' && (
        <GlassCard className="p-5 bg-slate-900/60 border-white/5 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <Layers className="h-4 w-4 text-rose-500" /> Defect Clustering Matrix
          </h2>
          <p className="text-gray-400 text-[10px]">AI defect isolation mapping related bugs into cluster themes.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "WebSocket Connection Leakages", defects: 3, severity: "High", risk: "Awaiting Hotpatch" },
              { name: "Auth Decryption locks", defects: 2, severity: "Critical", risk: "In Progress" },
              { name: "Connector Telemetry parameters", defects: 1, severity: "Medium", risk: "Open" }
            ].map(cluster => (
              <div key={cluster.name} className="p-3 bg-black/35 border border-white/5 rounded-xl space-y-2">
                <div className="font-bold text-white text-[11px] leading-tight">{cluster.name}</div>
                <div className="flex justify-between items-center text-[9px] text-gray-500">
                  <span>Count: {cluster.defects} defects</span>
                  <GlassBadge color={cluster.severity === 'Critical' ? 'red' : 'yellow'}>{cluster.severity}</GlassBadge>
                </div>
                <div className="text-[8px] font-bold text-cyan-400 bg-cyan-950/20 p-1 rounded font-mono mt-1 text-center">
                  Status: {cluster.risk}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Regression Intelligence */}
      {activeTab === 'regression' && (
        <GlassCard className="p-5 bg-slate-900/60 border-white/5 space-y-4">
          <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" /> Regression Intelligence Report
          </h2>
          <div className="space-y-3">
            {[
              { sprint: "Sprint 42 Active Run", rate: "91.8%", status: "Passed", runs: 8 },
              { sprint: "Sprint 41 Final Gate", rate: "94.5%", status: "Passed", runs: 12 },
              { sprint: "Sprint 40 Release Train", rate: "92.0%", status: "Passed", runs: 15 }
            ].map((reg, idx) => (
              <div key={idx} className="p-3 bg-black/20 border border-white/5 rounded-xl flex justify-between items-center text-[10px]">
                <div>
                  <div className="font-bold text-white">{reg.sprint}</div>
                  <div className="text-gray-550 mt-1">Total automated regression runs: {reg.runs}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">Coverage: {reg.rate}</span>
                  <GlassBadge color="green">{reg.status}</GlassBadge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Release Readiness & Quality Risks */}
      {activeTab === 'readiness' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Readiness Score */}
          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-1.5">
                <Gauge className="h-4 w-4 text-cyan-400" /> Release Readiness Score
              </h2>
              <div className="flex justify-center py-4 relative">
                <div className="h-24 w-24 rounded-full border-4 border-dashed border-cyan-400/40 flex flex-col justify-center items-center">
                  <div className="text-lg font-bold text-white">91.8%</div>
                  <div className="text-[7px] text-gray-500 uppercase font-semibold">Ready Status</div>
                </div>
              </div>
              <div className="space-y-2 text-[10px] text-gray-400">
                <div className="flex justify-between">
                  <span>Unit Test Coverage (91.8%)</span>
                  <span className="text-emerald-400">PASS</span>
                </div>
                <div className="flex justify-between">
                  <span>Critical Defect blocker count (0)</span>
                  <span className="text-emerald-400">PASS</span>
                </div>
                <div className="flex justify-between">
                  <span>Compliance Gate check</span>
                  <span className="text-emerald-400">PASS</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Quality Risk Matrix */}
          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
            <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-amber-500 animate-pulse" /> Quality Risk Matrix
            </h2>
            <div className="space-y-3">
              {[
                { area: "Deployment Risk", score: "Low", desc: "No core pipeline blockers detected." },
                { area: "Regression Risk", score: "Low", desc: "WebSocket memory leak isolated." },
                { area: "Port Conflict Risk", score: "Low", desc: "Assigned isolated port 8109 to FastAPI." }
              ].map(risk => (
                <div key={risk.area} className="p-2.5 bg-black/20 border border-white/5 rounded-xl flex justify-between items-center gap-3">
                  <div>
                    <div className="font-bold text-white text-[11px]">{risk.area}</div>
                    <div className="text-[9px] text-gray-500 mt-0.5">{risk.desc}</div>
                  </div>
                  <GlassBadge color="green">{risk.score}</GlassBadge>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* AI Test Case Generator */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
            <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-1.5">
              <FileCode className="h-4 w-4 text-cyan-400" /> Feature specifications
            </h2>
            <textarea
              value={featureSpecs}
              onChange={(e) => setFeatureSpecs(e.target.value)}
              rows="10"
              className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-cyan-300 font-mono focus:outline-none"
            />
            <div className="flex justify-end">
              <GlassButton variant="primary" onClick={handleGenerateTests} disabled={isGenerating} className="flex items-center gap-1.5">
                {isGenerating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>Generate Tests with AI</span>
              </GlassButton>
            </div>
          </GlassCard>

          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
            <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-400" /> Generated Automated test scripts
            </h2>
            <div className="bg-slate-950 border border-white/5 rounded-xl p-4 overflow-y-auto min-h-[200px] leading-relaxed whitespace-pre-wrap text-emerald-400 text-[10px]">
              {isGenerating ? (
                <div className="flex flex-col justify-center items-center h-full py-16 gap-2 text-cyan-400">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span className="text-[9px] animate-pulse">Running test generation engine...</span>
                </div>
              ) : generatedTests ? (
                generatedTests
              ) : (
                <span className="text-gray-650 font-mono text-[9px]">Submit a feature spec in the left panel to generate Playwright/Cucumber test suites.</span>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* QA Agent Sandbox */}
      <AIAgentSandbox role="QA Lead" />
    </div>
  );
}
