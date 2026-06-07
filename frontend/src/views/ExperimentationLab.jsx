import React, { useState } from 'react';
import { Sparkles, RefreshCw, BarChart3, Users2, Award, Play } from 'lucide-react';
import SkeletonLoader from '../components/Common/SkeletonLoader';

const ExperimentationLab = ({ model = 'qwen', addToast = () => {} }) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('SMS scheduling CTA size vs conversion');
  const [hypothesis, setHypothesis] = useState('If we increase the size and contrast of the text scheduling CTA link in patient reminders, then checkout conversion will increase by 10% relatively.');
  const [productArea, setProductArea] = useState('Patient Booking flow');
  const [kpiGoal, setKpiGoal] = useState('Checkout Conversion Rate');

  // Plan results
  const [planMarkdown, setPlanMarkdown] = useState('');
  const [reviews, setReviews] = useState([]);
  const [decision, setDecision] = useState(null);

  const loadExample = () => {
    setName('SMS scheduling CTA size vs conversion');
    setHypothesis('If we increase the size and contrast of the text scheduling CTA link in patient reminders, then checkout conversion will increase by 10% relatively.');
    setProductArea('Patient Booking flow');
    setKpiGoal('Checkout Conversion Rate');
    addToast('Preloaded template experiment!', 'success');
  };

  const handleEvaluate = async () => {
    if (!name.trim() || !hypothesis.trim()) {
      addToast('Experiment Name and Hypothesis are required.', 'warning');
      return;
    }

    setLoading(true);
    setPlanMarkdown('');
    setReviews([]);
    setDecision(null);

    try {
      const response = await fetch('http://127.0.0.1:8109/api/experimentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, hypothesis, product_area: productArea, kpi_goal: kpiGoal, model })
      });

      if (response.ok) {
        const data = await response.json();
        setPlanMarkdown(data.content || '');
        setReviews(data.review || []);
        setDecision(data.decision || null);
        addToast('Experiment blueprint generated successfully!', 'success');
      } else {
        const err = await response.json();
        addToast(`Error: ${err.detail || 'Evaluation failed'}`, 'error');
      }
    } catch (e) {
      // Fallback loader
      const response = await fetch('http://127.0.0.1:8109/api/experimentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, hypothesis, product_area: productArea, kpi_goal: kpiGoal, model: 'mock' })
      });
      const data = await response.json();
      setPlanMarkdown(data.content || '');
      setReviews(data.review || []);
      setDecision(data.decision || null);
      addToast('Blueprint generated in Fallback Experiment Simulator!', 'info');
    } finally {
      setLoading(false);
    }
  };

  // SVG Chart Mock Coordinates
  const controlPoints = "30,120 70,115 110,118 150,110 190,112 230,105 270,103 310,95 350,92 390,94 430,88 470,85 510,87 550,86";
  const variantPoints = "30,120 70,110 110,102 150,92 190,85 230,80 270,78 310,65 350,58 390,52 430,46 470,41 510,38 550,35";

  const getAvatarColor = (role) => {
    switch (role) {
      case 'Product Owner': return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
      case 'Business Analyst': return 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30';
      case 'Data Analyst': return 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30';
      case 'Dev Lead': return 'bg-rose-600/20 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-700/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-mono text-xs text-white">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-wider uppercase flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-400" /> Experimentation Lab
          </h2>
          <p className="text-[10px] text-gray-500 mt-1">
            Plan growth experiments, evaluate telemetry frameworks, and run statistical decision matrices.
          </p>
        </div>
        <button
          onClick={loadExample}
          className="px-4 py-2 text-xs font-bold text-indigo-400 bg-slate-900 border border-white/5 rounded-xl hover:text-white hover:bg-slate-800 transition-all flex items-center cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-cyan-400 animate-pulse" />
          Load CTA Experiment Template
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-[500px]">
        {/* Left Input panel */}
        <div className="p-6 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4 bg-slate-900/60">
          <div className="space-y-4">
            <div className="border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Experiment Scope</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Experiment Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. CTA Button color change"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Strategic Hypothesis</label>
                <textarea
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  placeholder="If we [change], then [KPI] will increase because [reason]..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 h-24 resize-none placeholder-slate-600 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Product Area</label>
                  <input
                    type="text"
                    value={productArea}
                    onChange={(e) => setProductArea(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">KPI Goal</label>
                  <input
                    type="text"
                    value={kpiGoal}
                    onChange={(e) => setKpiGoal(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button
              onClick={handleEvaluate}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                  Compiling blueprint...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1.5 text-cyan-200 fill-current" />
                  Launch Experiment Lab
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output panel */}
        <div className="xl:col-span-2 p-6 rounded-2xl border border-white/5 flex flex-col justify-between bg-slate-900/30 max-h-[600px] overflow-hidden">
          <div className="border-b border-white/5 pb-4 mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <BarChart3 className="w-4 h-4 mr-1.5 text-cyan-400" />
              Experimentation Blueprint & Simulated Metrics
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6 scroll-smooth">
            {loading ? (
              <SkeletonLoader />
            ) : planMarkdown ? (
              <div className="space-y-6 animate-fade-in">
                {/* SVG Live Chart */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cumulative Conversion Timeline</h4>
                      <p className="text-[10px] text-slate-500">14-Day Cumulative Performance (Variant vs. Control)</p>
                    </div>
                    <div className="flex items-center space-x-3 text-[10px]">
                      <span className="flex items-center">
                        <span className="w-2.5 h-1 bg-cyan-400 inline-block mr-1.5"></span>
                        <span className="text-slate-350 font-medium">Variant B</span>
                      </span>
                      <span className="flex items-center">
                        <span className="w-2.5 h-1 bg-slate-550 inline-block mr-1.5"></span>
                        <span className="text-slate-500 font-medium">Control A</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* SVG Container */}
                  <div className="relative h-32 w-full mt-2">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 580 130" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="30" y1="10" x2="550" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="30" y1="50" x2="550" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="30" y1="90" x2="550" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="30" y1="120" x2="550" y2="120" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                      {/* Line paths */}
                      <polyline
                        fill="none"
                        stroke="rgba(148, 163, 184, 0.4)"
                        strokeWidth="2.5"
                        strokeDasharray="2"
                        points={controlPoints}
                      />
                      <polyline
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="3"
                        points={variantPoints}
                        className="animate-pulse"
                      />
                      
                      {/* X Axis labels */}
                      <text x="30" y="130" fill="rgba(255,255,255,0.3)" fontSize="8">Day 1</text>
                      <text x="310" y="130" fill="rgba(255,255,255,0.3)" fontSize="8">Day 7</text>
                      <text x="540" y="130" fill="rgba(255,255,255,0.3)" fontSize="8">Day 14</text>
                    </svg>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 bg-black/40 p-2 rounded-lg border border-white/5">
                    <span>Statistical Significance: <strong className="text-emerald-400">p = 0.021</strong> (alpha = 0.05)</span>
                    <span>Confidence Interval: <strong className="text-emerald-400">95% CI (+3.1% to +14.2%)</strong></span>
                  </div>
                </div>

                {/* Plan Blueprint Section */}
                <div className="p-1">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">A/B Testing Setup</h4>
                  <div className="markdown-body text-xs select-text whitespace-pre-wrap leading-relaxed text-gray-300 font-sans">
                    {planMarkdown}
                  </div>
                </div>

                {/* Simulated review pane */}
                {reviews.length > 0 && (
                  <div className="space-y-3 border-t border-white/5 pt-4">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center">
                      <Users2 className="w-4 h-4 mr-1.5 text-indigo-400" />
                      Cross-Functional Review Comments
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reviews.map((rev, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center border shrink-0 ${getAvatarColor(rev.role)}`}>
                              {rev.avatar || rev.role[0]}
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white leading-tight">{rev.name}</h5>
                              <p className="text-[9px] text-slate-500 leading-none">{rev.role}</p>
                            </div>
                          </div>
                          <div className="text-[10px] space-y-1.5 text-slate-300 pt-1.5 font-sans leading-relaxed">
                            <div>
                              <span className="font-bold text-indigo-400 block font-mono">Feasibility:</span>
                              {rev.feasibility}
                            </div>
                            <div>
                              <span className="font-bold text-cyan-400 block font-mono">Metric & Telemetry Validation:</span>
                              {rev.kpi_validity || rev.measurement_concerns}
                            </div>
                            <div>
                              <span className="font-bold text-rose-400 block font-mono">Risk Evaluation:</span>
                              {rev.risk}
                            </div>
                            <div className="pt-1.5 border-t border-white/5 flex items-center justify-between font-mono text-[9px]">
                              <span className="text-slate-500">Decision recommendation:</span>
                              <span className="px-2 py-0.5 rounded bg-black/40 font-bold text-indigo-300 border border-indigo-500/10">
                                {rev.recommendation}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Final Decision Engine Recommendation */}
                {decision && (
                  <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs relative overflow-hidden font-sans">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
                    <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2 font-mono">
                      <div className="flex items-center space-x-2 text-indigo-400 font-bold">
                        <Award className="w-4.5 h-4.5" />
                        <span>🏆 Decision Engine Resolution</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wider border ${
                        decision.recommendation === 'Launch' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        decision.recommendation === 'Iterate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {decision.recommendation}
                      </span>
                    </div>
                    <div className="markdown-body text-slate-200 font-mono text-[10px] whitespace-pre-wrap leading-relaxed">
                      {decision.rationale}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-20">
                <BarChart3 className="w-14 h-14 mb-3 text-slate-600 stroke-[1.5]" />
                <h4 className="font-semibold text-slate-400">Experimentation Lab Idle</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Specify name, hypothesis, and parameters on the left and click 'Launch Experiment Lab'. The analytics strategy and decision parameters will compile here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperimentationLab;
