import React, { useState } from 'react';
import { ListChecks, Sparkles, RefreshCw, Plus, Trash2 } from 'lucide-react';
import SkeletonLoader from '../components/Common/SkeletonLoader';

const PrioritizationEngine = ({ model = 'qwen', addToast = () => {} }) => {
  const [framework, setFramework] = useState('rice'); // rice, moscow, impact_effort
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState([
    { name: 'AI Rescheduling Agent', description: 'Enable conversational texting to reschedule appointments.', reach: 800, impact: 3.0, confidence: 90, effort: 4.0, priority_group: 'Must', impact_value: 5 },
    { name: 'Google Calendar Sync', description: 'Auto-sync booked slots directly to clinical staff calendars.', reach: 600, impact: 2.0, confidence: 80, effort: 2.0, priority_group: 'Should', impact_value: 4 },
    { name: 'Multi-lingual SMS Support', description: 'Translate scheduling texts to Spanish and Mandarin.', reach: 300, impact: 2.0, confidence: 70, effort: 3.0, priority_group: 'Could', impact_value: 3 },
    { name: 'Custom PDF Dashboard Exports', description: 'Download analytics panels as formal clinician printouts.', reach: 150, impact: 1.0, confidence: 80, effort: 3.0, priority_group: 'Could', impact_value: 2 },
    { name: 'Nurse Alert Pager Integration', description: 'Emergency sync with local clinic nurse pager hardware.', reach: 50, impact: 3.0, confidence: 40, effort: 5.0, priority_group: "Won't", impact_value: 3 }
  ]);

  const [rankedFeatures, setRankedFeatures] = useState([]);
  const [rationale, setRationale] = useState('');

  const addFeatureRow = () => {
    setFeatures([
      ...features,
      {
        name: 'New Custom Feature',
        description: 'Describe the feature value...',
        reach: 100,
        impact: 2.0,
        confidence: 80,
        effort: 2.0,
        priority_group: 'Should',
        impact_value: 3
      }
    ]);
    addToast('New feature row added to edit.', 'success');
  };

  const removeFeatureRow = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const updateFeatureField = (index, field, value) => {
    const updated = [...features];
    updated[index][field] = value;
    setFeatures(updated);
  };

  const handlePrioritize = async () => {
    if (features.length === 0) {
      addToast('Please add at least one feature to prioritize.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8109/api/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features, framework, model })
      });

      if (response.ok) {
        const data = await response.json();
        setRankedFeatures(data.prioritized_features || []);
        setRationale(data.rationale || '');
        addToast('Features prioritised and rationalised!', 'success');
      } else {
        const err = await response.json();
        addToast(`Error: ${err.detail || 'Prioritization failed'}`, 'error');
      }
    } catch (e) {
      // Fallback programmatically
      const response = await fetch('http://127.0.0.1:8109/api/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features, framework, model: 'mock' }) // force fallback mock
      });
      const data = await response.json();
      setRankedFeatures(data.prioritized_features || []);
      setRationale(data.rationale || '');
      addToast('Prioritized using Fallback Matrix Simulator!', 'info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-mono text-xs text-white">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-wider uppercase flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-indigo-400" /> AI Prioritization Matrix
          </h2>
          <p className="text-[10px] text-gray-500 mt-1">
            Apply product frameworks (RICE, MoSCoW, 2x2 Quadrant) mathematically and generate strategic roadmap rationale.
          </p>
        </div>
        {/* Framework Selector Toggle */}
        <div className="flex bg-slate-900 border border-white/5 rounded-2xl p-1 shrink-0">
          {['rice', 'moscow', 'impact_effort'].map((f) => (
            <button
              key={f}
              onClick={() => {
                setFramework(f);
                setRankedFeatures([]);
                setRationale('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                framework === f
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f === 'rice' ? 'RICE Score' : f === 'moscow' ? 'MoSCoW' : '2x2 Matrix'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-[500px]">
        {/* Left Side: Score Inputs */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Feature Parameter Scores
              </span>
              <button
                onClick={addFeatureRow}
                className="px-3 py-1.5 bg-slate-800 border border-white/10 text-xs font-semibold text-indigo-400 hover:text-white rounded-lg flex items-center transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Row
              </button>
            </div>

            {/* Score Grid/Inputs based on Framework */}
            <div className="space-y-3 overflow-y-auto max-h-[380px] pr-2">
              {features.map((feat, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3 relative group">
                  <button
                    onClick={() => removeFeatureRow(idx)}
                    className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Remove Feature"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={feat.name}
                        onChange={(e) => updateFeatureField(idx, 'name', e.target.value)}
                        className="bg-transparent border-b border-white/5 hover:border-white/20 focus:border-indigo-500 text-sm font-bold text-white focus:outline-none w-full"
                        placeholder="Feature name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={feat.description}
                        onChange={(e) => updateFeatureField(idx, 'description', e.target.value)}
                        className="bg-transparent border-b border-white/5 hover:border-white/20 focus:border-indigo-500 text-xs text-slate-400 focus:outline-none w-full"
                        placeholder="Short strategic feature benefit statement"
                      />
                    </div>

                    {/* Numeric parameters depending on framework selection */}
                    {framework === 'rice' && (
                      <div className="grid grid-cols-4 gap-1.5">
                        <div className="text-center">
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Reach</label>
                          <input
                            type="number"
                            value={feat.reach}
                            onChange={(e) => updateFeatureField(idx, 'reach', parseFloat(e.target.value) || 0)}
                            className="bg-black border border-white/10 rounded p-1 text-center font-mono text-xs text-white w-full"
                          />
                        </div>
                        <div className="text-center">
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Imp</label>
                          <select
                            value={feat.impact}
                            onChange={(e) => updateFeatureField(idx, 'impact', parseFloat(e.target.value) || 0)}
                            className="bg-black border border-white/10 rounded p-1 text-center text-xs text-white w-full"
                          >
                            <option value="3.0">3 (Massive)</option>
                            <option value="2.0">2 (High)</option>
                            <option value="1.0">1 (Med)</option>
                            <option value="0.5">0.5 (Low)</option>
                          </select>
                        </div>
                        <div className="text-center">
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Conf%</label>
                          <input
                            type="number"
                            value={feat.confidence}
                            onChange={(e) => updateFeatureField(idx, 'confidence', parseInt(e.target.value) || 0)}
                            className="bg-black border border-white/10 rounded p-1 text-center font-mono text-xs text-white w-full"
                          />
                        </div>
                        <div className="text-center">
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Effort</label>
                          <input
                            type="number"
                            value={feat.effort}
                            onChange={(e) => updateFeatureField(idx, 'effort', parseFloat(e.target.value) || 0)}
                            className="bg-black border border-white/10 rounded p-1 text-center font-mono text-xs text-white w-full"
                          />
                        </div>
                      </div>
                    )}

                    {framework === 'moscow' && (
                      <div className="flex items-center">
                        <select
                          value={feat.priority_group}
                          onChange={(e) => updateFeatureField(idx, 'priority_group', e.target.value)}
                          className="bg-black border border-white/10 rounded p-1 text-xs text-white w-full"
                        >
                          <option value="Must">Must Have</option>
                          <option value="Should">Should Have</option>
                          <option value="Could">Could Have</option>
                          <option value="Won't">Won't Have</option>
                        </select>
                      </div>
                    )}

                    {framework === 'impact_effort' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Impact (1-5)</label>
                          <select
                            value={feat.impact_value}
                            onChange={(e) => updateFeatureField(idx, 'impact_value', parseInt(e.target.value) || 3)}
                            className="bg-black border border-white/10 rounded p-1 text-xs text-white w-full"
                          >
                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Effort (1-5)</label>
                          <select
                            value={feat.effort}
                            onChange={(e) => updateFeatureField(idx, 'effort', parseInt(e.target.value) || 3)}
                            className="bg-black border border-white/10 rounded p-1 text-xs text-white w-full"
                          >
                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5">
            <button
              onClick={handlePrioritize}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                  Calculating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1.5 text-cyan-200" />
                  Prioritize features
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Priority Ranking & Rationale Preview */}
        <div className="p-6 rounded-2xl border border-white/5 flex flex-col justify-between bg-slate-900/30">
          <div className="border-b border-white/5 pb-4 mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <ListChecks className="w-4 h-4 mr-1.5 text-indigo-400" />
              Prioritized Roadmap & Analysis
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[420px] pr-2 space-y-5">
            {loading ? (
              <SkeletonLoader />
            ) : rankedFeatures.length > 0 ? (
              <div className="space-y-6 animate-fade-in">
                {/* Mathematical Rankings display list */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Programmatic Sort Results</h4>
                  <div className="space-y-2">
                    {rankedFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                        <div className="flex items-center space-x-3">
                          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-850 text-[10px] text-slate-300 font-bold border border-white/10">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-white">{feat.name}</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{feat.description}</p>
                          </div>
                        </div>
                        <div>
                          {framework === 'rice' && (
                            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
                              Score: {feat.score}
                            </span>
                          )}
                          {framework === 'moscow' && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              feat.priority_group === 'Must' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' :
                              feat.priority_group === 'Should' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {feat.priority_group}
                            </span>
                          )}
                          {framework === 'impact_effort' && (
                            <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/20">
                              {feat.quadrant.split(' ')[0]} Win
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Rationale Markdown */}
                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">AI PM Strategic Rationale</h4>
                  <div className="markdown-body text-xs whitespace-pre-wrap select-text leading-relaxed text-gray-300">
                    {rationale}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-20">
                <ListChecks className="w-12 h-12 mb-3 text-slate-600 stroke-[1.5]" />
                <h4 className="font-semibold text-slate-400">Roadmap Uncalculated</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Adjust parameter values in the left workspace and run prioritization. The ranked sorted items and qualitative roadmap reports will compile here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrioritizationEngine;
