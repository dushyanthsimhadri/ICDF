import React from 'react';
import { Sparkles, Shield, User, LogOut, Laptop, Cpu, Orbit } from 'lucide-react';
import { GlassCard, GlassBadge } from './GlassComponents';

export default function Navbar({ 
  activeTheme, 
  setActiveTheme, 
  currentUser, 
  handleLogout, 
  platformMode, 
  setPlatformMode,
  simulatedRole,
  setSimulatedRole,
  activeOrg,
  setActiveOrg,
  activeTeam,
  setActiveTeam,
  activeWorkspace,
  setActiveWorkspace
}) {
  const roles = [
    { label: "Original Role", val: null },
    { label: "Executive", val: "Executive" },
    { label: "Product Manager", val: "Product Manager" },
    { label: "Business Analyst", val: "Business Analyst" },
    { label: "Product Owner", val: "Product Owner" },
    { label: "Program Manager", val: "Program Manager" },
    { label: "Dev Lead", val: "Dev Lead" },
    { label: "Developer", val: "Developer" },
    { label: "QA Lead", val: "QA Lead" },
    { label: "Governance Manager", val: "Governance Manager" },
    { label: "Admin", val: "Admin" }
  ];

  const themes = [
    { name: "Slate Dark", val: "dark" },
    { name: "Neon Blue", val: "neon-blue" },
    { name: "Cyber Purple", val: "cyber-purple" },
    { name: "Emerald Green", val: "emerald" },
    { name: "Slate Classic", val: "slate" }
  ];

  const modes = ["Integration", "Native", "Hybrid"];

  return (
    <nav className="h-16 border-b border-white/5 bg-slate-950/80 backdrop-blur px-6 flex justify-between items-center shrink-0 font-mono text-xs z-20">
      {/* Scope Selector Matrices */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-gray-400">
          <Orbit className="h-3.5 w-3.5 text-cyan-400 animate-spin-slow" />
          <span className="font-bold text-white uppercase tracking-wider">ICDF OS</span>
        </div>
        <div className="h-4 w-px bg-white/10 hidden md:block" />
        <div className="hidden md:flex items-center gap-2 text-gray-500">
          <span>Org:</span>
          <select 
            value={activeOrg} 
            onChange={(e) => setActiveOrg(e.target.value)}
            className="bg-black/30 border border-white/5 rounded px-2 py-1 text-[10px] text-white focus:outline-none"
          >
            <option value="Acme Corp">Acme Corp</option>
            <option value="Starfleet">Starfleet</option>
          </select>
          
          <span>Team:</span>
          <select 
            value={activeTeam} 
            onChange={(e) => setActiveTeam(e.target.value)}
            className="bg-black/30 border border-white/5 rounded px-2 py-1 text-[10px] text-white focus:outline-none"
          >
            <option value="Platform Engineering">Platform Eng</option>
            <option value="AI Ops Group">AI Ops</option>
          </select>
        </div>
      </div>

      {/* Control Actions Panel */}
      <div className="flex items-center gap-3">
        {/* Platform Mode Indicator Switch */}
        <div className="flex bg-black/40 border border-white/5 rounded p-0.5">
          {modes.map(m => (
            <button
              key={m}
              onClick={() => setPlatformMode(m)}
              className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${
                platformMode === m 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Theme Switcher */}
        <select
          value={activeTheme}
          onChange={(e) => setActiveTheme(e.target.value)}
          className="bg-black/40 border border-white/5 rounded px-2.5 py-1.5 text-[10px] text-gray-300 focus:outline-none"
        >
          {themes.map(t => (
            <option key={t.val} value={t.val}>{t.name}</option>
          ))}
        </select>

        {/* Role Simulator Dropdown */}
        <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded px-2 py-1">
          <Laptop className="h-3.5 w-3.5 text-purple-400" />
          <select
            value={simulatedRole || ""}
            onChange={(e) => setSimulatedRole(e.target.value || null)}
            className="bg-transparent border-none text-[10px] text-gray-300 focus:outline-none font-bold cursor-pointer"
          >
            {roles.map(r => (
              <option key={r.val || ""} value={r.val || ""} className="bg-slate-900 text-white">
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Profile User Badge */}
        <div className="flex items-center gap-2 border-l border-white/10 pl-3">
          <div className="h-7 w-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-[10px] font-bold text-white leading-none truncate max-w-[80px]">
              {currentUser?.email?.split('@')[0]}
            </div>
            <div className="text-[8px] text-gray-500 font-bold leading-none mt-0.5 uppercase">
              {simulatedRole ? `Sim: ${simulatedRole}` : currentUser?.role}
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all ml-1"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
