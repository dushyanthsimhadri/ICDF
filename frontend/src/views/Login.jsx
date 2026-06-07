import React, { useState } from 'react';
import { Key, User, Orbit, Sparkles } from 'lucide-react';
import { GlassCard, GlassButton } from '../components/GlassComponents';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('dev_lead@icdf.io');
  const [role, setRole] = useState('Dev Lead');
  const [password, setPassword] = useState('secret123');
  const [status, setStatus] = useState('');

  const roles = [
    "Executive",
    "Product Manager",
    "Business Analyst",
    "Product Owner",
    "Program Manager",
    "Dev Lead",
    "QA Lead",
    "Governance Manager",
    "Admin"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Signing in...");
    
    try {
      const response = await fetch('http://127.0.0.1:8109/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      
      const data = await response.json();
      if (response.ok && data.access_token) {
        onLoginSuccess(data);
      } else {
        setStatus(data.detail || "Authentication credentials sync failed.");
      }
    } catch (err) {
      console.log('Login server offline, loading mock token.');
      // Local fallback for testing purposes
      onLoginSuccess({
        access_token: "mock_jwt_token_42",
        user: {
          email: email,
          role: role,
          tenant_id: "acme_corp"
        }
      });
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-950 flex items-center justify-center p-4 relative font-mono text-xs">
      <div className="absolute inset-0 bg-radial-gradient z-0 opacity-15" />
      
      <GlassCard className="w-full max-w-sm p-6 bg-slate-900/60 border-white/5 space-y-6 z-10">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Orbit className="h-8 w-8 text-cyan-400 animate-spin-slow" />
          <h1 className="text-md font-bold text-white tracking-widest uppercase">Sign In to ICDF</h1>
          <p className="text-[10px] text-gray-500 font-mono">Continuous Delivery Platform</p>
        </div>

        {status && <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-center text-[10px]">{status}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1">
            <label className="text-gray-400">Email Address:</label>
            <div className="flex items-center bg-black/30 border border-white/5 rounded px-3 py-1.5 gap-2">
              <User className="h-4 w-4 text-cyan-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none text-white focus:outline-none w-full"
                required
              />
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-gray-400">Default Simulation Role:</label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                const emailPrefix = e.target.value.toLowerCase().replace(' ', '_');
                setEmail(`${emailPrefix}@icdf.io`);
              }}
              className="bg-black/30 border border-white/5 rounded px-3 py-2 text-white focus:outline-none"
            >
              {roles.map(r => (
                <option key={r} value={r} className="bg-slate-900 text-white">{r}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-gray-400">Password Matrix Key:</label>
            <div className="flex items-center bg-black/30 border border-white/5 rounded px-3 py-1.5 gap-2">
              <Key className="h-4 w-4 text-cyan-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-none text-white focus:outline-none w-full"
                required
              />
            </div>
          </div>

          <GlassButton type="submit" variant="primary" className="w-full justify-center">
            Sign In with Telemetry
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
