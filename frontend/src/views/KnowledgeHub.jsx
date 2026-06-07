import React, { useState } from 'react';
import { FileText, Search } from 'lucide-react';
import { GlassCard, GlassButton } from '../components/GlassComponents';

export default function KnowledgeHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [articles] = useState([
    { title: "Securing Multi-Tenant Decryption Gates", category: "Compliance", id: "KNB-101" },
    { title: "FastAPI REST API Routing rules with uvicorn", category: "Engineering", id: "KNB-102" }
  ]);

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono">SYSTEM KNOWLEDGE WIKI</h1>
        <p className="text-[10px] text-gray-500 font-mono">Browse and edit system specification sheets, guidelines and architecture papers</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Search knowledge repository wiki..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow bg-black/30 border border-white/5 rounded px-3 py-2 text-xs text-white focus:outline-none font-mono"
          />
          <GlassButton className="flex items-center gap-1.5"><Search className="h-4 w-4 text-cyan-400" /> Search</GlassButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map(a => (
            <GlassCard key={a.id} className="p-4 bg-slate-900/60 border-white/5 space-y-2">
              <span className="text-[9px] text-cyan-400 font-bold uppercase">{a.category}</span>
              <h3 className="font-bold text-white">{a.title}</h3>
              <p className="text-[10px] text-gray-400">Reference code ID: {a.id}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
