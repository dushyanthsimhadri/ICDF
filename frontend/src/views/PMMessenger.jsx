import React, { useState } from 'react';
import { Send, Hash, Sparkles } from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '../components/GlassComponents';

export default function PMMessenger() {
  const [messages, setMessages] = useState([
    { user: "dev_sprint@icdf.io", text: "WebSocket server schema validation completed on port 8109." },
    { user: "qa_readiness@icdf.io", text: "Deployment testing gates passed." }
  ]);
  const [newMsg, setNewMsg] = useState("");

  const handleSend = () => {
    if (!newMsg.trim()) return;
    setMessages(prev => [...prev, { user: "you@icdf.io", text: newMsg }]);
    setNewMsg("");
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono">COLLABORATIVE ENTERPRISE MESSENGER</h1>
        <p className="text-[10px] text-gray-500 font-mono">Send organization-wide chat sync updates across telemetry release channels</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-4 bg-slate-900/60 border-white/5 h-[300px] flex flex-col justify-between">
            <div className="flex-grow overflow-y-auto space-y-3">
              {messages.map((m, idx) => (
                <div key={idx} className="p-2 bg-black/20 border border-white/5 rounded">
                  <div className="font-bold text-cyan-400 mb-0.5">{m.user}:</div>
                  <div className="text-gray-300">{m.text}</div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 mt-4 pt-2 border-t border-white/5">
              <input 
                type="text" 
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type collaboration updates..."
                className="flex-grow bg-black/30 border border-white/5 rounded px-3 py-2 text-xs text-white focus:outline-none"
              />
              <GlassButton onClick={handleSend}><Send className="h-4 w-4" /></GlassButton>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-3">
            <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-400" /> Channel AI summary
            </h2>
            <p className="text-[10px] text-gray-400">Generate a summary of today's channel activities and action items.</p>
            <GlassButton>Generate Daily Digest</GlassButton>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
