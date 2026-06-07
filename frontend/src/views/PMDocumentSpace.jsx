import React, { useState } from 'react';
import { FileText, Save, History, Share2 } from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '../components/GlassComponents';

export default function PMDocumentSpace() {
  const [docContent, setDocContent] = useState("Wiki Root Page Content for Starfleet Security Guidelines.");

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wider font-mono">SHARED DOCUMENT MATRIX</h1>
        <p className="text-[10px] text-gray-500 font-mono">Collaborative workspace documents page hierarchy and versioning rollbacks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-4">
            <textarea 
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              rows="10"
              className="w-full bg-black/30 border border-white/5 rounded p-3 text-xs text-gray-300 font-mono focus:outline-none"
            />
            <div className="flex gap-2">
              <GlassButton className="flex items-center gap-1.5"><Save className="h-3.5 w-3.5" /> Save Changes</GlassButton>
              <GlassButton className="flex items-center gap-1.5"><Share2 className="h-3.5 w-3.5" /> Share Document</GlassButton>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <GlassCard className="p-4 bg-slate-900/60 border-white/5 space-y-3">
            <h2 className="font-bold text-white border-b border-white/5 pb-2 flex items-center gap-1.5">
              <History className="h-4 w-4 text-purple-400" /> Version History Log
            </h2>
            <div className="space-y-2 text-[9px] text-gray-400">
              <div className="flex justify-between"><span>V2 (Latest):</span><span className="text-cyan-400">Active</span></div>
              <div className="flex justify-between"><span>V1 (Created):</span><span>Rollback</span></div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
