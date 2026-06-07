import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, FileText, ArrowRight, Activity, Calendar, Users2, ShieldAlert, Cpu, Layers, Clock } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, setCurrentView }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const commands = [
    { type: "Navigation", title: "Go to Portfolio Workspace", details: "View strategic initiatives and KPIs", view: "portfolio", icon: Layers },
    { type: "Navigation", title: "Go to Release Command Center", details: "Inspect environments and release trains", view: "releases", icon: Calendar },
    { type: "Navigation", title: "Go to Resource Planning", details: "Workloads and team utilization matrices", view: "resources", icon: Users2 },
    { type: "Navigation", title: "Go to Timeline Center", details: "Roadmap timelines and milestones", view: "timeline", icon: Clock },
    { type: "Navigation", title: "Go to Advanced Analytics", details: "Velocity charts and productivity indexes", view: "analytics", icon: Activity },
    { type: "Navigation", title: "Go to Scenario Planning", details: "Run AI simulations on delivery risks", view: "scenario-planning", icon: Cpu },
    { type: "Navigation", title: "Go to Executive Command Center", details: "Aggregated business KPIs and program health", view: "executive-dashboard", icon: Zap },
    { type: "Navigation", title: "Go to Dev Lead Console", details: "PR checks and code metrics", view: "devlead-dashboard", icon: ShieldAlert },
    { type: "Navigation", title: "Go to spec workspace", details: "Create and edit product requirements", view: "pm/prds", icon: FileText }
  ];

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  // Handle outside click or Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Filter commands
  const filtered = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.details.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        setCurrentView(filtered[selectedIndex].view);
        onClose();
      }
    }
  };

  const handleSelect = (view) => {
    setCurrentView(view);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4">
          {/* Overlay background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Dialog content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="w-full max-w-xl premium-glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 font-mono text-xs text-white"
          >
            {/* Input search box */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 bg-black/40">
              <Search className="w-4.5 h-4.5 text-gray-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or search workspace views..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-none text-white focus:outline-none text-xs font-mono"
              />
            </div>

            {/* List results */}
            <div className="max-h-[320px] overflow-y-auto p-2 space-y-0.5">
              {filtered.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No commands match your query.</div>
              ) : (
                filtered.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.view}
                      onClick={() => handleSelect(item.view)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex justify-between items-center px-4 py-3 rounded-xl cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' 
                          : 'border border-transparent text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-1.5 rounded-md ${isSelected ? 'bg-slate-900 text-cyan-455' : 'bg-slate-950/60 text-gray-500'}`}>
                          <Icon className="w-4 h-4 shrink-0" />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-white leading-none text-[11px]">{item.title}</h4>
                          <p className="text-[9px] text-gray-500 truncate mt-1 font-sans">{item.details}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold bg-slate-950/40 px-1.5 py-0.5 rounded border border-slate-800">
                          {item.type}
                        </span>
                        {isSelected && <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 px-4 py-2 flex justify-between items-center text-[8px] text-gray-500 font-bold bg-slate-950/20">
              <div className="flex gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Enter to select</span>
              </div>
              <span>Ctrl+K Console</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
