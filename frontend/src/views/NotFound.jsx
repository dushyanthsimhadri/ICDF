import React from 'react';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { GlassCard, GlassButton } from '../components/GlassComponents';
import { getDashboardForRole } from '../App';

export default function NotFound({ setCurrentView }) {
  const savedUser = localStorage.getItem('icdf_user');
  const user = savedUser ? JSON.parse(savedUser) : null;
  const userRole = user?.role || 'Developer';

  const handleGoHome = () => {
    const home = getDashboardForRole(userRole);
    if (setCurrentView) {
      setCurrentView(home);
    } else {
      window.history.pushState(null, '', `/${home}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 font-mono text-xs">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-full bg-rose-950/30 border border-rose-500/35 flex items-center justify-center text-cyber-rose mx-auto shadow-lg shadow-rose-500/5">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">404 - ROUTE NOT FOUND</h2>
          <p className="text-slate-500 font-sans leading-relaxed">
            The page you are trying to access does not exist or has been restricted by multi-tenant RBAC policies.
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <GlassButton onClick={handleGoHome} variant="primary">
            <Home className="w-4 h-4" />
            <span>Go to Default Dashboard</span>
          </GlassButton>
        </div>
      </motion.div>
    </div>
  );
}

// Simple framer motion mock if not imported globally in layout, but since motion is imported elsewhere:
import { motion } from 'framer-motion';
