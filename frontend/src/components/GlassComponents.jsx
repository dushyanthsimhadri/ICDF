import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Reusable Glass Card Component
export function GlassCard({ children, className = '', hoverGlow = true, onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`premium-glass rounded-2xl p-5 ${
        hoverGlow ? 'premium-glass-hover' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// Reusable Glass Button Component
export function GlassButton({ children, className = '', onClick, disabled = false, type = 'button', variant = 'default' }) {
  let colors = 'bg-white/5 border-white/10 hover:bg-white/10 text-white';
  if (variant === 'primary') {
    colors = 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-blue-500/35 hover:from-blue-500/40 hover:to-purple-500/40 text-white shadow-lg shadow-blue-500/10';
  } else if (variant === 'danger') {
    colors = 'bg-rose-950/30 border-rose-500/30 hover:bg-rose-950/60 text-rose-400';
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02, translateY: -1 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`px-4 py-2.5 rounded-xl border text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${colors} ${className}`}
    >
      {children}
    </motion.button>
  );
}

// Reusable Glass Badge Component
export function GlassBadge({ children, className = '', color = 'blue' }) {
  let colors = 'bg-blue-500/10 border-blue-500/20 text-blue-400';
  if (color === 'green') {
    colors = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
  } else if (color === 'red') {
    colors = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
  } else if (color === 'purple') {
    colors = 'bg-purple-500/10 border-purple-500/20 text-purple-400';
  } else if (color === 'yellow') {
    colors = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
  }

  return (
    <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono border uppercase tracking-wider ${colors} ${className}`}>
      {children}
    </span>
  );
}

// Reusable Glass Modal Dialog Component
export function GlassModal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blurred Background Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-2xl premium-glass rounded-2xl border border-white/10 p-6 z-10 shadow-2xl relative"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-3.5 mb-4">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contents */}
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
