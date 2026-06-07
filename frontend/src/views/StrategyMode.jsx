import React, { useState } from 'react';
import { Compass, Sparkles, RefreshCw, Scale } from 'lucide-react';
import SkeletonLoader from '../components/Common/SkeletonLoader';

const StrategyMode = ({ model = 'qwen', addToast = () => {} }) => {
  const [loading, setLoading] = useState(false);
  const [optionA, setOptionA] = useState('Option A: Customer Referral Program');
  const [optionB, setOptionB] = useState('Option B: Full Platform Dark Mode Support');
  const [goal, setGoal] = useState('Accelerate viral user expansion & organic growth loop');
  const [constraints, setConstraints] = useState('1 frontend developer + 1 backend developer, 3 weeks sprint deadline');
  const [comparisonResult, setComparisonResult] = useState('');

  const loadExample = () => {
    setOptionA('Option A: Customer Referral Program');
    setOptionB('Option B: Full Platform Dark Mode Support');
    setGoal('Accelerate viral user expansion & organic growth loop');
    setConstraints('1 frontend developer + 1 backend developer, 3 weeks sprint deadline');
    addToast('Preloaded comparison template!', 'success');
  };

  const handleEvaluate = async () => {
    if (!optionA.trim() || !optionB.trim()) {
      addToast('Option A and Option B are required.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8109/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          option_a: optionA,
          option_b: optionB,
          goal,
          constraints,
          model
        })
      });

      if (response.ok) {
        const data = await response.json();
        setComparisonResult(data.content || '');
        addToast('Strategic comparison compiled!', 'success');
      } else {
        const err = await response.json();
        addToast(`Error: ${err.detail || 'Comparison failed'}`, 'error');
      }
    } catch (e) {
      // Fallback loader
      const response = await fetch('http://127.0.0.1:8109/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          option_a: optionA,
          option_b: optionB,
          goal,
          constraints,
          model: 'mock' // force fallback mock
        })
      });
      const data = await response.json();
      setComparisonResult(data.content || '');
      addToast('Evaluated using Fallback Strategy Simulator!', 'info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-mono text-xs text-white">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-wider uppercase flex items-center gap-2">
            <Compass className="h-5 w-5 text-indigo-400" /> Strategy Comparison Lab
          </h2>
          <p className="text-[10px] text-gray-500 mt-1">
            Perform rigorous trade-off reviews comparing features, architectures, or roadmap paths against business constraints.
          </p>
        </div>
        <button
          onClick={loadExample}
          className="px-4 py-2 text-xs font-bold text-indigo-400 hover:text-white bg-slate-900 border border-white/5 rounded-xl hover:bg-slate-800 transition-all flex items-center cursor-pointer"
        >
          <Scale className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
          Load Example
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
        {/* Left Side: Comparison Form */}
        <div className="p-6 rounded-2xl border border-white/5 flex flex-col justify-between bg-slate-900/60">
          <div className="space-y-4">
            <div className="border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Strategic Options</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Option A Description</label>
                <textarea
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  placeholder="e.g. Build Option A..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 h-24 resize-none placeholder-slate-600 font-sans"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Option B Description</label>
                <textarea
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  placeholder="e.g. Build Option B..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 h-24 resize-none placeholder-slate-600 font-sans"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Business Objective / Success Metric Goal</label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Triple month-over-month signups"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Resource, Technical or Time Constraints</label>
                <input
                  type="text"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="e.g. 2 backend devs, release freeze in 2 weeks"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <button
              onClick={handleEvaluate}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                  Analyzing Strategy...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1.5 text-cyan-200" />
                  Evaluate Strategic Fit
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Comparative Output */}
        <div className="p-6 rounded-2xl border border-white/5 flex flex-col justify-between bg-slate-900/30">
          <div className="border-b border-white/5 pb-4 mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <Compass className="w-4 h-4 mr-1.5 text-indigo-400" />
              Strategic Evaluation Report
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[420px] pr-2">
            {loading ? (
              <SkeletonLoader />
            ) : comparisonResult ? (
              <div className="markdown-body text-xs whitespace-pre-wrap select-text leading-relaxed text-gray-300">
                {comparisonResult}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-20">
                <Compass className="w-12 h-12 mb-3 text-slate-600 stroke-[1.5]" />
                <h4 className="font-semibold text-slate-400">Lab Reports Empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Specify details on Option A/B and parameters on the left. The comparative matrix and PM advice will print here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyMode;
