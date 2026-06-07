import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Brain, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';
import { GlassCard, GlassButton, GlassBadge } from './GlassComponents';

const ROLE_GREETINGS = {
  "Executive": "Strategic advisor loaded. Ask me about portfolio ROI, cloud budget utilization, or compliance threat matrices.",
  "Product Manager": "Product Copilot initialized. Let's map whiteboard sticky ideas, outline PRDs, or prioritize epics.",
  "Business Analyst": "BA system active. Ask me to draft acceptance criteria, process maps, or format stories.",
  "Product Owner": "Backlog engine online. Query me regarding sprint capacity, story point sizes, or WSJF priorities.",
  "Program Manager": "Release train coordinator online. Ask about cross-team dependencies, release status, or delays.",
  "Dev Lead": "Engineering assistant active. Ask me about pipeline failures, database sharding, or technical debt heatmaps.",
  "QA Lead": "QA system loaded. Ask me about bug clusters, regression pass rates, or generating mock Playwright test scripts.",
  "Admin": "Multitenant sharding console online. Let's review shard replicas, database migrations, or sync telemetry."
};

const SUGGESTIONS = {
  "Executive": [
    "Why is Sprint 42 delayed?",
    "Summarize portfolio budget risks",
    "Run strategic compliance check"
  ],
  "Product Manager": [
    "Convert whiteboard notes to Epic",
    "Suggest PRD requirements",
    "Prioritize Q3 feature list"
  ],
  "Business Analyst": [
    "Format story for Ingestion Engine",
    "Generate meeting standup decisions",
    "Map requirements to user flows"
  ],
  "Product Owner": [
    "Calculate Sprint 42 velocity",
    "List top priority backlog items",
    "Estimate story points for connector"
  ],
  "Program Manager": [
    "Show active dependency blockers",
    "Release confidence score breakdown",
    "Analyze release readiness"
  ],
  "Dev Lead": [
    "How to remediate SQLite file lock?",
    "Explain technical debt heatmap",
    "Review Dev API mapping endpoints"
  ],
  "QA Lead": [
    "Generate Jest test case for auth",
    "List defect clusters in QA",
    "Regression testing status summary"
  ],
  "Admin": [
    "Verify connector telemetry sync status",
    "List active tenant databases",
    "Multiregion sharding status"
  ]
};

export default function AIDeliveryCopilot({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentUser?.role || 'Dev Lead');
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Sync role when user switches role in navbar
  useEffect(() => {
    if (currentUser?.role) {
      setSelectedRole(currentUser.role);
    }
  }, [currentUser]);

  // Load greeting message when selected role changes
  useEffect(() => {
    setMessages([
      {
        id: 'greet',
        sender: 'ai',
        text: ROLE_GREETINGS[selectedRole] || `AI Agent for ${selectedRole} loaded. How can I assist you with the delivery operating system today?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [selectedRole]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const queryText = textToSend || userInput;
    if (!queryText.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setUserInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://127.0.0.1:8109/agents/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: selectedRole,
          query: queryText,
          context: `Sprint Status: 45%. System: SQLite active at C:/Users/admin/Documents/ICDF/icdf.db. Delivery Health: 94.2%. Active Blockers: 3. Last Sync Success: 99.8%.`
        })
      });

      const data = await response.json();
      
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.response || `[No response from agent]`,
        mode: data.mode,
        model: data.model,
        status: data.status,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `[ERROR] Failed to query the AI Agent. Ensure backend server is running on port 8109.\n\nFallback simulated response:\n"I've evaluated your query regarding '${queryText}'. Delivery indicators remain stable with health index 94%. Action recommended: Verify database connections."`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-xl shadow-cyan-500/20 hover:scale-105 transition-all cursor-pointer border border-cyan-400/30"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <Brain className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
        </div>
      </motion.button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-sm pointer-events-auto"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="absolute top-0 right-0 h-full w-[440px] bg-slate-950/90 border-l border-white/10 shadow-2xl backdrop-blur-lg flex flex-col font-mono text-xs text-white pointer-events-auto"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/40">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-cyan-400" />
                  <div>
                    <h2 className="font-bold text-white tracking-wider text-xs">AI DELIVERY COPILOT</h2>
                    <p className="text-[9px] text-gray-500 font-mono">Consensus-driven Agent Assistant</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Role Select Toolbar */}
              <div className="px-4 py-2 border-b border-white/5 bg-slate-900/20 flex items-center justify-between gap-2">
                <span className="text-[9px] text-gray-500 uppercase font-semibold">Agent Context:</span>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-cyan-400 font-mono focus:outline-none max-w-[200px]"
                >
                  {Object.keys(ROLE_GREETINGS).map(role => (
                    <option key={role} value={role} className="bg-slate-950 text-white font-mono text-[10px]">
                      {role} Agent
                    </option>
                  ))}
                </select>
              </div>

              {/* Chat Messages */}
              <div className="flex-grow p-4 overflow-y-auto space-y-4 select-text">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] text-gray-500">
                        {msg.sender === 'user' ? 'You' : `${selectedRole} Agent`}
                      </span>
                      <span className="text-[8px] text-gray-600">{msg.time}</span>
                    </div>

                    <div 
                      className={`p-3 rounded-2xl border text-[11px] leading-relaxed max-w-[90%] font-sans whitespace-pre-line ${
                        msg.sender === 'user' 
                          ? 'bg-blue-600/10 border-blue-500/20 text-blue-100 rounded-tr-none'
                          : 'bg-white/5 border-white/5 text-gray-200 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                      
                      {msg.sender === 'ai' && msg.mode && (
                        <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[8px] text-gray-500 font-mono">Model: {msg.model}</span>
                          <span className="text-[8px] text-gray-500 font-mono">|</span>
                          <span className="text-[8px] text-gray-500 font-mono">Mode: {msg.mode}</span>
                          {msg.mode === 'Hybrid' && (
                            <div className="w-full mt-1.5 p-1.5 bg-amber-950/30 border border-amber-500/20 rounded flex items-center gap-1.5 text-[9px] text-amber-400 font-mono animate-pulse">
                              <AlertCircle className="h-3 w-3 shrink-0" />
                              <span>Approval required. Action queued.</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] text-gray-500 mb-1">{selectedRole} Agent is analyzing...</span>
                    <div className="p-3 bg-white/5 border border-white/5 rounded-2xl rounded-tl-none text-[11px] text-cyan-400 font-mono animate-pulse flex items-center gap-2">
                      <RefreshCw className="h-3 w-3 animate-spin" /> Ingesting telemetry pipeline...
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Suggestions Panel */}
              <div className="p-4 border-t border-white/5 bg-slate-900/10 space-y-2">
                <span className="text-[9px] text-gray-500 uppercase font-semibold block">Suggested Queries:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(SUGGESTIONS[selectedRole] || []).map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(sug)}
                      className="text-[9px] px-2 py-1.5 rounded-lg border border-white/5 bg-black/20 hover:bg-cyan-950/20 hover:border-cyan-500/20 text-gray-400 hover:text-cyan-400 font-mono text-left transition-colors cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input Form */}
              <div className="p-4 border-t border-white/10 bg-slate-900/40">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={`Ask the ${selectedRole} Copilot...`}
                    className="flex-grow bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/30 font-sans"
                    disabled={isTyping}
                  />
                  <button
                    type="submit"
                    className="h-9 w-9 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                    disabled={isTyping || !userInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
