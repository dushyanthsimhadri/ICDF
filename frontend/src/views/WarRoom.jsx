import React, { useState, useEffect } from 'react';
import { Users2, Sparkles, RefreshCw, MessageSquare, ShieldAlert, Award, Play, AlertTriangle } from 'lucide-react';
import SkeletonLoader from '../components/Common/SkeletonLoader';

const WarRoom = ({ model = 'qwen', addToast = () => {} }) => {
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState([
    'Automated AI scheduling chatbot via SMS',
    'Custom manual clinic appointment portal website'
  ]);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [objective, setObjective] = useState('Reduce reception call volume by 50% & prevent queues');
  const [constraints, setConstraints] = useState('1 developer, launch deadline in 12 days');
  
  // Debate results
  const [rawDiscussion, setRawDiscussion] = useState([]);
  const [visibleDiscussion, setVisibleDiscussion] = useState([]);
  const [conflictAnalysis, setConflictAnalysis] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(-1);

  // Sequenced speech animator
  useEffect(() => {
    if (rawDiscussion.length > 0 && currentSpeakerIndex >= 0 && currentSpeakerIndex < rawDiscussion.length) {
      const timer = setTimeout(() => {
        setVisibleDiscussion(prev => [...prev, rawDiscussion[currentSpeakerIndex]]);
        setCurrentSpeakerIndex(idx => idx + 1);
      }, 1000); // 1 second delay between agent speakers
      return () => clearTimeout(timer);
    }
  }, [rawDiscussion, currentSpeakerIndex]);

  const addFeatureOption = () => {
    if (!newFeatureText.trim()) return;
    setFeatures([...features, newFeatureText.trim()]);
    setNewFeatureText('');
    addToast('Feature option added to war room agenda.', 'success');
  };

  const removeFeatureOption = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleStartDebate = async () => {
    if (features.length < 2) {
      addToast('Please list at least 2 features to run a debate.', 'warning');
      return;
    }

    setLoading(true);
    setVisibleDiscussion([]);
    setRawDiscussion([]);
    setConflictAnalysis('');
    setRecommendation('');
    setCurrentSpeakerIndex(-1);

    try {
      const response = await fetch('http://127.0.0.1:8109/api/warroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features, objective, constraints, model })
      });

      if (response.ok) {
        const data = await response.json();
        setRawDiscussion(data.discussion || []);
        setConflictAnalysis(data.conflict_analysis || '');
        setRecommendation(data.recommendation || '');
        setCurrentSpeakerIndex(0); // Trigger sequenced animation
        addToast('War room session active!', 'success');
      } else {
        const err = await response.json();
        addToast(`Error: ${err.detail || 'Debate initiation failed'}`, 'error');
      }
    } catch (e) {
      // Fallback loader
      const response = await fetch('http://127.0.0.1:8109/api/warroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features, objective, constraints, model: 'mock' }) // force fallback mock
      });
      const data = await response.json();
      setRawDiscussion(data.discussion || []);
      setConflictAnalysis(data.conflict_analysis || '');
      setRecommendation(data.recommendation || '');
      setCurrentSpeakerIndex(0); // Trigger sequenced animation
      addToast('Debated using Fallback War Room Simulator!', 'info');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarStyle = (avatar) => {
    const roles = {
      PO: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
      BA: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30',
      DEV: 'bg-rose-600/20 text-rose-400 border-rose-500/30',
      UX: 'bg-purple-600/20 text-purple-400 border-purple-500/30',
      DATA: 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30',
      QA: 'bg-amber-600/20 text-amber-400 border-amber-500/30'
    };
    return roles[avatar] || 'bg-slate-700/20 text-slate-400';
  };

  return (
    <div className="space-y-6 animate-fade-in font-mono text-xs">
      {/* Title */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-xl font-bold text-white tracking-wider uppercase flex items-center gap-2">
          <Users2 className="h-5 w-5 text-indigo-400" /> AI PM War Room
        </h2>
        <p className="text-[10px] text-gray-500 mt-1">
          Simulate a cross-functional prioritisation alignment discussion between Product, Dev, UX, QA, Business, and Data.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-[500px]">
        {/* Left Panel: Inputs */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Deliberation Scope</span>
            </div>

            {/* List of features */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Feature Options to Compare</label>
              <div className="space-y-2">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-black/20 border border-white/5 rounded-xl px-3 py-2 text-xs">
                    <span className="text-white font-medium truncate pr-2">{feat}</span>
                    <button 
                      onClick={() => removeFeatureOption(idx)}
                      className="text-slate-500 hover:text-rose-400 font-bold shrink-0 text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  placeholder="Add alternative feature option..."
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 flex-1 placeholder-slate-600"
                />
                <button
                  onClick={addFeatureOption}
                  className="px-3 bg-slate-800 border border-white/10 text-xs font-bold text-indigo-400 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Strategic Variables */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Business Objective</label>
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Timeline / Scope Constraints</label>
                <input
                  type="text"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button
              onClick={handleStartDebate}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                  Orchestrating agents...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1.5 text-cyan-200 fill-current" />
                  Start Alignment Debate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: Chat Thread & Resolution */}
        <div className="xl:col-span-2 p-6 rounded-2xl border border-white/5 flex flex-col justify-between bg-slate-900/30 max-h-[600px] overflow-hidden">
          <div className="border-b border-white/5 pb-4 mb-4 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <Users2 className="w-4 h-4 mr-1.5 text-indigo-400" />
              AI War Room Debate Board
            </span>
            {currentSpeakerIndex >= 0 && currentSpeakerIndex < rawDiscussion.length && (
              <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-bold uppercase animate-pulse">
                Debating...
              </span>
            )}
          </div>

          {/* Chat log body */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 scroll-smooth">
            {loading && visibleDiscussion.length === 0 && (
              <SkeletonLoader type="chat" />
            )}

            {visibleDiscussion.length === 0 && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-20">
                <Users2 className="w-14 h-14 mb-3 text-slate-600 stroke-[1.5]" />
                <h4 className="font-semibold text-slate-400 font-sans">War Room Inactive</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Input features and goals on the left and click 'Start alignment debate'. A live debate log between product leads will print here.
                </p>
              </div>
            )}

            {/* Chat Messages */}
            {visibleDiscussion.map((message, i) => (
              <div key={i} className="flex items-start gap-4 transition-all duration-300 animate-slide-in">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl font-extrabold text-xs flex items-center justify-center border shrink-0 ${getAvatarStyle(message.avatar)}`}>
                  {message.avatar}
                </div>
                
                {/* Message speech bubble */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xs font-bold text-white">{message.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">({message.role})</span>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-2.5 text-xs text-slate-200">
                    <p className="leading-relaxed font-medium bg-slate-900/45 p-3 rounded-xl text-slate-100 border border-white/5">
                      "{message.opinion}"
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[10px] text-slate-400">
                      <div>
                        <span className="font-bold text-rose-400 uppercase tracking-wide block mb-0.5">⚠️ Risks & Concerns</span>
                        {message.concerns || message.risks}
                      </div>
                      <div>
                        <span className="font-bold text-cyan-400 uppercase tracking-wide block mb-0.5">📊 KPI Impact / Effort</span>
                        {message.kpi_impact} | {message.effort}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Display conflict and PM recommendation AFTER discussion ends */}
            {visibleDiscussion.length === rawDiscussion.length && rawDiscussion.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-white/5 animate-fade-in">
                {/* Conflict analysis card */}
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>⚡ Strategic Disagreement Highlights</span>
                  </div>
                  <div className="markdown-body text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {conflictAnalysis}
                  </div>
                </div>

                {/* Final recommendation card */}
                <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
                  <div className="flex items-center space-x-2 text-indigo-400 font-bold mb-3">
                    <Award className="w-4.5 h-4.5" />
                    <span>🏆 AI PM Consensus Resolution & Roadmap</span>
                  </div>
                  <div className="markdown-body text-slate-200 font-medium whitespace-pre-wrap leading-relaxed">
                    {recommendation}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarRoom;
