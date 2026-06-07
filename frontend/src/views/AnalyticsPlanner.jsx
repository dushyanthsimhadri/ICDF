import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  Award, 
  MessageSquare,
  Network,
  Workflow,
  ShieldAlert
} from 'lucide-react';
import SkeletonLoader from '../components/Common/SkeletonLoader';

const AnalyticsPlanner = ({ 
  model = 'qwen', 
  generatedPrd, 
  analyticsStrategy, 
  setAnalyticsStrategy = () => {}, 
  addToast = () => {} 
}) => {
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('hierarchy'); // hierarchy, events, risks, abtest

  // Structured response states
  const [hierarchy, setHierarchy] = useState(null);
  const [eventTaxonomy, setEventTaxonomy] = useState([]);
  const [abTest, setAbTest] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [risks, setRisks] = useState([]);
  const [maturity, setMaturity] = useState(null);

  useEffect(() => {
    if (generatedPrd && !analyticsStrategy && !loading) {
      handleExtract();
    }
  }, [generatedPrd]);

  const handleExtract = async () => {
    if (!generatedPrd) {
      addToast('No active PRD found. Please generate a PRD first or use the fallback.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8109/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prd: generatedPrd, model })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyticsStrategy(data.content);
        setHierarchy(data.hierarchy);
        setEventTaxonomy(data.event_taxonomy || []);
        setAbTest(data.ab_test);
        setReviews(data.review || []);
        setRisks(data.risks || []);
        setMaturity(data.maturity_advisor);
        
        addToast('Product Analytics Copilot mapping complete!', 'success');
      } else {
        const err = await response.json();
        addToast(`Error: ${err.detail || 'Extraction failed'}`, 'error');
      }
    } catch (e) {
      // Fallback mock loader
      const response = await fetch('http://127.0.0.1:8109/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prd: generatedPrd || 'Mock Active Scheduling App', model: 'mock' })
      });
      const data = await response.json();
      setAnalyticsStrategy(data.content);
      setHierarchy(data.hierarchy);
      setEventTaxonomy(data.event_taxonomy || []);
      setAbTest(data.ab_test);
      setReviews(data.review || []);
      setRisks(data.risks || []);
      setMaturity(data.maturity_advisor);
      addToast('Copilot loaded in Fallback Analytics Simulator!', 'info');
    } finally {
      setLoading(false);
    }
  };

  const getRoleStyle = (role) => {
    const styles = {
      'Product Owner': 'bg-blue-600/20 text-blue-400 border-blue-500/30',
      'Business Analyst': 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30',
      'Data Analyst': 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30',
      'Business User': 'bg-orange-600/20 text-orange-400 border-orange-500/30',
      'Real User': 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
    };
    return styles[role] || 'bg-slate-700/20 text-slate-400 border-slate-500/30';
  };

  return (
    <div className="space-y-6 animate-fade-in font-mono text-xs text-white">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-wider uppercase flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-400" /> Product Analytics Copilot
          </h2>
          <p className="text-[10px] text-gray-500 mt-1 font-mono">
            Generate event schemas, map metric hierarchies, review tracking risks, and advice growth experiments.
          </p>
        </div>
        {generatedPrd && (
          <button
            onClick={handleExtract}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center transition-colors cursor-pointer"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5 text-cyan-200" />}
            Run Analytics Audit
          </button>
        )}
      </div>

      {!generatedPrd ? (
        <div className="p-8 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center min-h-[300px] bg-slate-900/60">
          <BarChart3 className="w-14 h-14 mb-4 text-slate-600 stroke-[1.5]" />
          <h4 className="text-sm font-bold text-slate-355 font-mono">No Active PRD Pipeline Found</h4>
          <p className="text-xs text-slate-500 max-w-md mt-1 mb-6 leading-relaxed font-mono">
            We extract KPIs directly from your working PRD. Go to the PRD Generator first to create a product document, or click below to trigger a pre-loaded simulation.
          </p>
          <button
            onClick={handleExtract}
            className="bg-slate-800 border border-white/10 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center cursor-pointer font-mono"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400 animate-pulse" />
            Analyze Simulated Product Metrics
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sub menu tabs */}
          <div className="flex bg-slate-900 border border-white/5 rounded-2xl p-1 w-fit">
            {[
              { id: 'hierarchy', label: 'Metric Hierarchy', icon: Network },
              { id: 'events', label: 'Taxonomy & Funnel', icon: Workflow },
              { id: 'risks', label: 'Risks & Maturity', icon: ShieldAlert },
              { id: 'abtest', label: 'Stakeholder Reviews & A/B', icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    activeSubTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/40">
              <SkeletonLoader type="table" rows={4} />
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Tab workspaces (Left panel) */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* 1. Metric Hierarchy Builder */}
                {activeSubTab === 'hierarchy' && hierarchy && (
                  <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/60 space-y-6">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Metric Dependency Flow</h3>
                    </div>

                    {/* Nodes flow */}
                    <div className="space-y-4">
                      {/* Business Goal */}
                      <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 max-w-lg relative">
                        <span className="text-[9px] font-bold text-orange-400 uppercase tracking-wider block mb-1">Business Goal</span>
                        <p className="text-xs font-bold text-white leading-snug">{hierarchy.business_goal}</p>
                      </div>

                      <div className="pl-6 text-slate-600">➔</div>

                      {/* North Star Metric */}
                      <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 max-w-lg ml-4 relative">
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">North Star Metric (Valuation Core)</span>
                        <p className="text-xs font-bold text-white leading-snug flex items-center">
                          <Award className="w-4 h-4 mr-1.5 text-indigo-400 animate-pulse" />
                          {hierarchy.north_star}
                        </p>
                      </div>

                      <div className="pl-12 text-slate-600">➔</div>

                      {/* Primary Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
                        {hierarchy.primary_metrics.map((metric, i) => (
                          <div key={i} className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 relative">
                            <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">Primary Success Metric</span>
                            <p className="text-xs font-semibold text-white leading-snug">{metric}</p>
                          </div>
                        ))}
                      </div>

                      <div className="pl-20 text-slate-600">➔</div>

                      {/* Secondary Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 ml-12">
                        {hierarchy.secondary_metrics.map((metric, i) => (
                          <div key={i} className="p-3.5 rounded-xl bg-black/20 border border-white/5 relative">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Secondary / Guardrail</span>
                            <p className="text-[10px] font-medium text-slate-300 leading-snug">{metric}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Event Taxonomy & Funnels */}
                {activeSubTab === 'events' && (
                  <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/60 space-y-6">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Event Schema & Funnel Conversion</h3>
                    </div>

                    {/* Funnel chart preview */}
                    <div className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Funnel Conversion Rate</h4>
                          <p className="text-[10px] text-slate-500">Simulated conversion drops per pipeline stage</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          Total Funnel: 35.8% Conversion
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-4 pt-2 h-20 items-end text-center">
                        <div className="space-y-1">
                          <div className="w-full bg-indigo-650/40 border border-indigo-500/20 h-16 rounded-lg flex items-center justify-center font-mono font-bold text-xs text-white">
                            100%
                          </div>
                          <span className="text-[9px] text-slate-400 block truncate">1. Initiated</span>
                        </div>
                        <div className="space-y-1">
                          <div className="w-full bg-indigo-650/40 border border-indigo-500/20 h-11 rounded-lg flex items-center justify-center font-mono font-bold text-xs text-white">
                            68%
                          </div>
                          <span className="text-[9px] text-slate-400 block truncate">2. SMS Request</span>
                        </div>
                        <div className="space-y-1">
                          <div className="w-full bg-indigo-650/40 border border-indigo-500/20 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs text-white">
                            49%
                          </div>
                          <span className="text-[9px] text-slate-400 block truncate">3. Code Verified</span>
                        </div>
                        <div className="space-y-1">
                          <div className="w-full bg-indigo-650/40 border border-indigo-500/20 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs text-white">
                            35%
                          </div>
                          <span className="text-[9px] text-slate-400 block truncate">4. Clinic Sync</span>
                        </div>
                      </div>
                    </div>

                    {/* Taxonomy table */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-xs text-left">
                        <thead>
                          <tr className="border-b border-white/5 text-slate-400">
                            <th className="py-2 px-3">Amplitude Event Name</th>
                            <th className="py-2 px-3">Telemetry Trigger</th>
                            <th className="py-2 px-3">Context Properties Schema</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-350 font-sans">
                          {eventTaxonomy.map((evt, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                              <td className="py-3 px-3 font-mono font-bold text-indigo-400">{evt.event_name}</td>
                              <td className="py-3 px-3">{evt.trigger}</td>
                              <td className="py-3 px-3 font-mono text-[9px] text-slate-500">{evt.properties}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. Risks & Maturity Advisor */}
                {activeSubTab === 'risks' && (
                  <div className="space-y-6">
                    {/* Risks detected */}
                    <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/60 space-y-4">
                      <div className="border-b border-white/5 pb-3">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Analytics Risk Detector</h3>
                      </div>
                      <div className="space-y-3 font-sans">
                        {risks.map((risk, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1.5">
                            <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs font-mono">
                              <AlertTriangle className="w-4 h-4" />
                              <span>{risk.type}</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{risk.description}</p>
                            <p className="text-[10px] text-slate-400 pt-1.5 border-t border-white/5 font-mono">
                              <strong className="text-indigo-400">Mitigation: </strong> {risk.mitigation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Maturity Roadmap */}
                    {maturity && (
                      <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/60 space-y-4">
                        <div className="border-b border-white/5 pb-3 flex items-center justify-between">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Analytics Maturity Advisor</h3>
                          <span className="px-2.5 py-0.5 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 font-bold text-[10px]">
                            {maturity.level}
                          </span>
                        </div>
                        <div className="markdown-body text-xs whitespace-pre-wrap leading-relaxed select-text text-gray-300 font-sans">
                          {maturity.recommendations}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. A/B Testing & Reviews */}
                {activeSubTab === 'abtest' && (
                  <div className="space-y-6">
                    {/* A/B Test Plan */}
                    {abTest && (
                      <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/60 space-y-4">
                        <div className="border-b border-white/5 pb-3">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">A/B Testing Growth Parameters</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 font-sans">
                          <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-1">
                            <strong className="text-indigo-400 block uppercase text-[9px] tracking-wide font-mono">A/B Experiment Hypothesis</strong>
                            <p>{abTest.hypothesis}</p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-1">
                            <strong className="text-cyan-400 block uppercase text-[9px] tracking-wide font-mono">Primary Target KPI</strong>
                            <p>{abTest.kpis}</p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-1">
                            <strong className="text-orange-400 block uppercase text-[9px] tracking-wide font-mono">Success Criteria Thresholds</strong>
                            <p>{abTest.success_criteria}</p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-1">
                            <strong className="text-slate-400 block uppercase text-[9px] tracking-wide font-mono">Statistical Runtime Duration</strong>
                            <p>{abTest.duration}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stakeholder review log */}
                    <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/60 space-y-4">
                      <div className="border-b border-white/5 pb-3">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Telemetry Setup Reviews</h3>
                      </div>
                      <div className="space-y-4 font-sans">
                        {reviews.map((rev, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-xs animate-slide-in">
                            <div className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center border shrink-0 font-mono ${getRoleStyle(rev.role)}`}>
                              {rev.avatar || rev.role[0]}
                            </div>
                            <div className="flex-1 p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-1">
                              <div className="flex items-baseline justify-between mb-1 font-mono">
                                <span className="font-bold text-white">{rev.name}</span>
                                <span className="text-[9px] text-slate-500">({rev.role})</span>
                              </div>
                              <p className="text-slate-350 leading-relaxed font-medium">"{rev.comment}"</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Right Panel: Strategy Report Preview */}
              <div className="p-6 rounded-2xl border border-white/5 flex flex-col justify-between bg-slate-900/30">
                <div className="border-b border-white/5 pb-4 mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                    <BarChart3 className="w-4 h-4 mr-1.5 text-indigo-400" />
                    Measurement Framework Summary
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[420px] pr-2 text-slate-350 leading-relaxed">
                  {analyticsStrategy ? (
                    <div className="markdown-body text-xs select-text whitespace-pre-wrap">
                      {analyticsStrategy}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-20 font-mono">
                      <BarChart3 className="w-12 h-12 mb-3 text-slate-600 stroke-[1.5]" />
                      <h4 className="font-semibold text-slate-400">Measurement Blueprint Workspace</h4>
                      <p className="text-xs text-slate-500 max-w-xs mt-1">
                        Audit results will compile here. Draft/generate a PRD to load and run diagnostics.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsPlanner;
