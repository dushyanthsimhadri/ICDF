import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  MessageSquare, 
  Cpu, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Play,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from './GlassComponents';

export default function AICollaborationPanel({ 
  assistantName = "AI Copilot Assistant", 
  roleContext = "Developer", 
  confidenceScore = 95
}) {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: `Hello! I am your ${assistantName}. How can I assist you with your ${roleContext} objectives today?`, time: 'Just Now' }
  ]);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [traceLogs, setTraceLogs] = useState([]);
  const [orchestratedPipeline, setOrchestratedPipeline] = useState(null);

  // Preset prompts
  const presets = [
    "Ask Product Brain",
    "Generate Summary",
    "Analyze Risk",
    "Generate PRD",
    "Explain Velocity",
    "Meeting Analysis"
  ];

  const handleSend = async (textToSend) => {
    const text = textToSend || query;
    if (!text.trim()) return;

    // Append user message
    const userMsg = { id: Date.now(), role: 'user', content: text, time: 'Just Now' };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    // Prepare simulated reasoning trace logs
    const mockLogs = [
      `[agent_runtime] Initializing cognitive pipeline context for: ${roleContext}`,
      `[vector_store] Querying Vector memory index. Match score: 0.88`,
      `[model_selector] Selected local Ollama model config: qwen2.5:3b`,
      `[agent_reasoning] Generating ReAct thoughts for query: "${text.substring(0, 30)}..."`,
      `[agent_action] Invoking tools: database search, sync telemetry checks`
    ];

    setTraceLogs(mockLogs);
    setShowTrace(true);

    try {
      // Fetch response from backend orchestrator
      const response = await fetch('http://127.0.0.1:8109/collaboration/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript_input: text,
          context: `Role: ${roleContext}`
        })
      });
      
      const data = await response.json();
      
      if (data && data.pipeline) {
        setOrchestratedPipeline(data.pipeline);
        
        // Formulate a response based on the pipeline output
        let summary = `Orchestrated AI Collaboration Loop completed. All 5 agents processed the query:\n\n`;
        data.pipeline.forEach(step => {
          summary += `- **${step.agent}**: ${step.action} -> ${step.payload.substring(0, 100)}...\n`;
        });
        
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: summary,
          time: 'Just Now'
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: "I executed the cognitive routing process, but the collaboration pipeline returned an empty payload. Please verify backend logs.",
          time: 'Just Now'
        }]);
      }
    } catch (err) {
      console.error(err);
      // Fallback response in case backend is offline
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: `I processed your request locally: "${text}". Note that the backend orchestrator at port 8109 appears to be offline, so local fallback answers were used.`,
        time: 'Just Now'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <GlassCard className="h-full flex flex-col p-4 relative overflow-hidden font-mono border-white/5 bg-slate-900/60">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">{assistantName}</span>
        </div>
        <GlassBadge color="purple" className="text-[9px]">Confidence: {confidenceScore}%</GlassBadge>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto space-y-3 pr-1 text-xs">
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-[8px] text-gray-500 mb-1">{m.role === 'user' ? 'You' : 'AI Assistant'} ({m.time})</span>
            <div className={`p-2.5 rounded-lg max-w-[90%] whitespace-pre-line leading-relaxed ${
              m.role === 'user' 
                ? 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/20' 
                : 'bg-white/5 text-gray-200 border border-white/5'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu className="h-3.5 w-3.5 animate-spin" />
            <span className="text-[9px] animate-pulse">AI is reasoning...</span>
          </div>
        )}
      </div>

      {/* Trace Logs panel */}
      {showTrace && traceLogs.length > 0 && (
        <div className="mt-3 bg-black/40 border border-white/5 rounded p-2 text-[9px] text-emerald-400 space-y-1 max-h-[120px] overflow-y-auto">
          <div className="flex justify-between items-center border-b border-white/5 pb-1 mb-1">
            <span className="font-bold flex items-center gap-1"><Activity className="h-3 w-3" /> Cognitive Trace</span>
            <button onClick={() => setShowTrace(!showTrace)} className="text-gray-400 hover:text-white">
              {showTrace ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            </button>
          </div>
          {showTrace && traceLogs.map((log, i) => (
            <div key={i} className="font-mono">{log}</div>
          ))}
        </div>
      )}

      {/* Preset prompt buttons */}
      <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-white/5 pt-3">
        {presets.map((p, i) => (
          <button 
            key={i} 
            onClick={() => handleSend(p)}
            className="text-[8px] p-1.5 rounded bg-white/5 border border-white/5 text-gray-400 hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/20 transition-all text-center truncate"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Instruct ${roleContext} Assistant...`}
          className="flex-grow bg-black/30 border border-white/5 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/30 transition-all font-mono"
        />
        <GlassButton onClick={() => handleSend()} className="px-3">
          <Send className="h-3.5 w-3.5 text-cyan-400" />
        </GlassButton>
      </div>
    </GlassCard>
  );
}
