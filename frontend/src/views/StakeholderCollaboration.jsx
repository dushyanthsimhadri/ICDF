import React, { useState, useEffect } from 'react';
import { Users, Sparkles, RefreshCw, AlertTriangle, Download, Copy, Play, ClipboardCheck } from 'lucide-react';
import SkeletonLoader from '../components/Common/SkeletonLoader';

const StakeholderCollaboration = ({ 
  model = 'qwen', 
  generatedPrd, 
  addToast = () => {} 
}) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // States
  const [rawDiscussion, setRawDiscussion] = useState([]);
  const [visibleDiscussion, setVisibleDiscussion] = useState([]);
  const [conflicts, setConflicts] = useState('');
  const [mvpScope, setMvpScope] = useState('');
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(-1);

  // Speech Reveal Animator
  useEffect(() => {
    if (rawDiscussion.length > 0 && currentSpeakerIndex >= 0 && currentSpeakerIndex < rawDiscussion.length) {
      const timer = setTimeout(() => {
        setVisibleDiscussion(prev => [...prev, rawDiscussion[currentSpeakerIndex]]);
        setCurrentSpeakerIndex(idx => idx + 1);
      }, 900); // 900ms reveal step
      return () => clearTimeout(timer);
    }
  }, [rawDiscussion, currentSpeakerIndex]);

  const handleStartSync = async () => {
    if (!generatedPrd) {
      addToast('Please generate a PRD first to run stakeholder sync.', 'warning');
      return;
    }

    setLoading(true);
    setVisibleDiscussion([]);
    setRawDiscussion([]);
    setConflicts('');
    setMvpScope('');
    setCurrentSpeakerIndex(-1);

    try {
      const response = await fetch('http://127.0.0.1:8109/api/collaboration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prd: generatedPrd, model })
      });

      if (response.ok) {
        const data = await response.json();
        setRawDiscussion(data.discussion || []);
        setConflicts(data.conflicts || '');
        setMvpScope(data.aligned_mvp_scope || '');
        setCurrentSpeakerIndex(0);
        addToast('Stakeholder synchronization active!', 'success');
      } else {
        const err = await response.json();
        addToast(`Error: ${err.detail || 'Alignment failed'}`, 'error');
      }
    } catch (e) {
      // Fallback loader
      const response = await fetch('http://127.0.0.1:8109/api/collaboration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prd: generatedPrd || 'Mock PRD Content', model: 'mock' })
      });
      const data = await response.json();
      setRawDiscussion(data.discussion || []);
      setConflicts(data.conflicts || '');
      setMvpScope(data.aligned_mvp_scope || '');
      setCurrentSpeakerIndex(0);
      addToast('Synced using Fallback Sync Simulator!', 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(mvpScope);
    setCopied(true);
    addToast('MVP scope copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([mvpScope], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aligned_mvp_scope_plan.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('MVP scope downloaded!', 'success');
  };

  const getAvatarBadge = (role) => {
    if (role === 'Business User') return 'bg-orange-600/20 text-orange-400 border-orange-500/30';
    if (role === 'Real User') return 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30';
    
    // Core team avatars
    const roles = {
      PO: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
      BA: 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30',
      DEV: 'bg-rose-600/20 text-rose-400 border-rose-500/30',
      UX: 'bg-purple-600/20 text-purple-400 border-purple-500/30',
      DATA: 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30',
      QA: 'bg-amber-600/20 text-amber-400 border-amber-500/30'
    };
    return roles[role] || 'bg-slate-700/20 text-slate-400 border-slate-500/30';
  };

  const getAvatarLetter = (avatar, role) => {
    if (avatar) return avatar;
    return role[0];
  };

  return (
    <div className="space-y-6 animate-fade-in font-mono text-xs text-white">
      {/* Title */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-xl font-bold tracking-wider uppercase flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-400" /> Stakeholder Sync & MVP Builder
        </h2>
        <p className="text-[10px] text-gray-500 mt-1">
          Simulate team debates between marketing, real users, and core product engineers to lock down the aligned MVP scope.
        </p>
      </div>

      {!generatedPrd ? (
        <div className="p-8 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center min-h-[300px] bg-slate-900/60">
          <Users className="w-14 h-14 mb-4 text-slate-600 stroke-[1.5]" />
          <h4 className="text-sm font-bold text-slate-355 font-mono">Active PRD Context Required</h4>
          <p className="text-xs text-slate-500 max-w-md mt-1 mb-6 leading-relaxed font-mono">
            The stakeholder engine reviews the PRD content to simulate customized team interactions. Draft a PRD first or click below to launch a simulated EHR booking project sync.
          </p>
          <button
            onClick={handleStartSync}
            className="bg-slate-800 border border-white/10 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center cursor-pointer font-mono"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400 animate-pulse" />
            Simulate EHR Booking Sync Workshop
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-[500px]">
          {/* Left panel: Control Board & Timeline */}
          <div className="p-6 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4 max-h-[580px] bg-slate-900/60">
            <div className="space-y-4">
              <div className="border-b border-white/5 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Workshop Coordinator</span>
              </div>
              
              <div className="space-y-3.5 text-xs">
                <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-2">
                  <span className="font-bold text-white block">Active Input Document:</span>
                  <span className="text-indigo-200 font-mono block truncate">Active requirements active context</span>
                </div>
                
                <div className="space-y-2">
                  <span className="font-bold text-slate-400 block">Workshop Participants (8 Roles):</span>
                  <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-bold text-slate-400 font-mono">
                    <div className="p-1.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">Marketing</div>
                    <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">End User</div>
                    <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Product</div>
                    <div className="p-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">Dev Lead</div>
                    <div className="p-1.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">UX Lead</div>
                    <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">QA Lead</div>
                    <div className="p-1.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Data</div>
                    <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Analyst</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <button
                onClick={handleStartSync}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                    Gathering stakeholders...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1.5 text-cyan-200 fill-current" />
                    Simulate Alignment Workshop
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right chat logs + MVP Builder section */}
          <div className="xl:col-span-2 p-6 rounded-2xl border border-white/5 flex flex-col justify-between bg-slate-900/30 max-h-[580px] overflow-hidden">
            <div className="border-b border-white/5 pb-4 mb-4 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <Users className="w-4 h-4 mr-1.5 text-indigo-400" />
                Stakeholder Sync Thread
              </span>
              {currentSpeakerIndex >= 0 && currentSpeakerIndex < rawDiscussion.length && (
                <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-bold uppercase animate-pulse">
                  Session Active
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 scroll-smooth">
              {loading && visibleDiscussion.length === 0 && (
                <SkeletonLoader type="chat" />
              )}

              {visibleDiscussion.length === 0 && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-24 font-mono">
                  <Users className="w-14 h-14 mb-3 text-slate-600 stroke-[1.5]" />
                  <h4 className="font-semibold text-slate-400">Workshop Screen Idle</h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Start the stakeholder workshop to see business goals and patient feedback reconcile with developers.
                  </p>
                </div>
              )}

              {/* Debate Speech Bubbles */}
              {visibleDiscussion.map((message, i) => (
                <div key={i} className="flex items-start gap-4 transition-all duration-300 animate-slide-in">
                  <div className={`w-10 h-10 rounded-xl font-extrabold text-xs flex items-center justify-center border shrink-0 ${getAvatarBadge(message.avatar || message.role)}`}>
                    {getAvatarLetter(message.avatar, message.role)}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xs font-bold text-white">{message.name}</span>
                      <span className="text-[10px] text-slate-500">({message.role})</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-2.5 text-xs text-slate-200">
                      <p className="leading-relaxed font-medium bg-slate-900/45 p-3 rounded-xl text-slate-100 border border-white/5 font-sans">
                        "{message.opinion}"
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-[9px] text-slate-400 leading-relaxed font-sans">
                        <div>
                          <span className="font-bold text-orange-400 block mb-0.5 font-mono">❓ Key Question</span>
                          {message.questions}
                        </div>
                        <div>
                          <span className="font-bold text-rose-400 block mb-0.5 font-mono">⚠️ Concerns / Risks</span>
                          {message.concerns || message.risks}
                        </div>
                        <div>
                          <span className="font-bold text-indigo-400 block mb-0.5 font-mono">💡 Recommendation (Priority)</span>
                          {message.recommendation} (<strong className="text-slate-200">{message.priority}</strong>)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Conflicts and final MVP Scope printout */}
              {visibleDiscussion.length === rawDiscussion.length && rawDiscussion.length > 0 && (
                <div className="space-y-5 pt-6 border-t border-white/5 animate-fade-in font-sans">
                  {/* Conflict indicators callout */}
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs">
                    <div className="flex items-center space-x-2 text-amber-400 font-bold mb-2 font-mono">
                      <AlertTriangle className="w-4 h-4" />
                      <span>⚡ Alignment Clash & Conflict Resolution</span>
                    </div>
                    <div className="markdown-body text-slate-300 font-mono text-[10px] whitespace-pre-wrap leading-relaxed">
                      {conflicts}
                    </div>
                  </div>

                  {/* MVP Builder Decision Card */}
                  <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3 font-mono">
                      <div className="flex items-center space-x-2 text-indigo-400 font-bold">
                        <ClipboardCheck className="w-5 h-5" />
                        <span>🏆 Aligned MVP Scope Builder Plan</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleCopy}
                          className="p-1.5 rounded bg-slate-800 border border-white/5 text-slate-400 hover:text-white cursor-pointer"
                          title="Copy MVP Plan"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleDownload}
                          className="p-1.5 rounded bg-slate-800 border border-white/5 text-slate-400 hover:text-white cursor-pointer"
                          title="Download MVP Plan"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="markdown-body text-slate-200 font-mono text-[10px] whitespace-pre-wrap leading-relaxed">
                      {mvpScope}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StakeholderCollaboration;
