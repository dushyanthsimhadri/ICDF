import React, { useState } from 'react';
import { FileText, Copy, Download, Sparkles, Check, RefreshCw } from 'lucide-react';
import SkeletonLoader from '../components/Common/SkeletonLoader';

const PRDGenerator = ({ 
  model = 'qwen', 
  generatedPrd, 
  setGeneratedPrd, 
  projectNotes, 
  setProjectNotes, 
  setActiveProjectName = () => {},
  addToast = () => {} 
}) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const demoNotes = `Project: MedSchedule AI
Product Idea: An AI-powered scheduling system for medical clinics. It lets patients schedule appointments by sending a simple text message.

Meeting Notes:
- Dr. Smith says the reception is overwhelmed by phone calls. 
- Patients complain about waiting on hold for 10+ minutes.
- Needs integration with existing Electronic Health Record (EHR) database.
- Must comply with HIPAA data privacy standards.
- Alert nurses for urgent appointments automatically.
- Let patients reschedule or cancel via text too.`;

  const loadDemo = () => {
    setProjectNotes(demoNotes);
    addToast('Loaded demo notes context!', 'success');
  };

  const handleGenerate = async () => {
    if (!projectNotes.trim()) {
      addToast('Please enter some notes or load the demo first.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8109/api/prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: projectNotes, model })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedPrd(data.content || '');
        // Extract project name from notes if possible
        const lines = projectNotes.split('\n');
        const projLine = lines.find(l => l.toLowerCase().includes('project:'));
        if (projLine) {
          setActiveProjectName(projLine.replace(/project:/i, '').trim());
        } else {
          setActiveProjectName('New Product MVP');
        }
        addToast('Product Requirement Document (PRD) generated!', 'success');
      } else {
        const err = await response.json();
        addToast(`Error: ${err.detail || 'PRD generation failed'}`, 'error');
      }
    } catch (e) {
      // Fallback
      const response = await fetch('http://127.0.0.1:8109/api/prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: projectNotes, model: 'mock' })
      });
      const data = await response.json();
      setGeneratedPrd(data.content || '');
      setActiveProjectName('MedSchedule AI (Simulated)');
      addToast('PRD generated using Fallback PM Simulator!', 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrd);
    setCopied(true);
    addToast('PRD copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedPrd], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'PRD_document.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('PRD markdown downloaded!', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in font-mono text-xs text-white">
      {/* Title */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-xl font-bold tracking-wider uppercase flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-400" /> AI PRD Generator
        </h2>
        <p className="text-[10px] text-gray-500 mt-1 font-mono">
          Convert raw product ideation, user feedback, or meeting notes into a fully structured Product Requirement Document.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
        {/* Left Panel: Inputs */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col justify-between space-y-4">
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Raw Ideation Notes</span>
              <button
                onClick={loadDemo}
                className="text-[10px] text-indigo-400 hover:text-white font-bold transition-colors cursor-pointer"
              >
                Load Demo Context
              </button>
            </div>
            <textarea
              value={projectNotes}
              onChange={(e) => setProjectNotes(e.target.value)}
              placeholder="Paste raw clinic feedback, user requests or outline details here..."
              className="w-full flex-1 min-h-[300px] bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none font-sans leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-white/5">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                  Generating requirements...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1.5 text-cyan-200" />
                  Generate PRD Document
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: Output Document */}
        <div className="p-6 rounded-2xl border border-white/5 flex flex-col justify-between bg-slate-900/30 max-h-[600px] overflow-hidden">
          <div className="border-b border-white/5 pb-4 mb-4 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <FileText className="w-4 h-4 mr-1.5 text-indigo-400" />
              Document Workspace
            </span>
            {generatedPrd && !loading && (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-slate-800 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Copy to Clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-lg bg-slate-800 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Download Markdown"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[420px] pr-2 font-sans text-slate-350 leading-relaxed whitespace-pre-wrap select-text">
            {loading ? (
              <SkeletonLoader />
            ) : generatedPrd ? (
              <div className="markdown-body text-xs text-slate-200">
                {generatedPrd}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-20 font-mono">
                <FileText className="w-12 h-12 mb-3 text-slate-600 stroke-[1.5]" />
                <h4 className="font-semibold text-slate-400">PRD Workspace Idle</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Draft requirements using the left panel. The formal markdown document will render here.
                </p>
              </div>
            )}
          </div>

          {generatedPrd && !loading && (
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
              <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                💡 PRD loaded in context. You can now visit KPI & Analytics or User Stories tabs.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PRDGenerator;
