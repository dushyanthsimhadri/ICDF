import React from 'react';

const SkeletonLoader = ({ type = 'text', rows = 4 }) => {
  if (type === 'card') {
    return (
      <div className="w-full glass-panel p-6 rounded-2xl border border-white/5 animate-pulse space-y-4">
        <div className="h-6 w-1/3 bg-indigo-500/20 rounded-lg"></div>
        <div className="h-4 w-full bg-slate-700/20 rounded-md"></div>
        <div className="h-4 w-5/6 bg-slate-700/20 rounded-md"></div>
        <div className="h-10 w-24 bg-indigo-500/10 rounded-lg mt-4"></div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full space-y-4 animate-pulse">
        <div className="h-10 w-full bg-slate-800/40 rounded-lg border border-white/5"></div>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="h-12 w-full bg-slate-800/20 rounded-lg border border-white/5 flex items-center px-4 space-x-4">
            <div className="h-4 w-12 bg-indigo-500/10 rounded"></div>
            <div className="h-4 w-1/4 bg-slate-700/20 rounded"></div>
            <div className="h-4 w-2/5 bg-slate-700/20 rounded"></div>
            <div className="h-4 w-16 bg-slate-700/20 rounded ml-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chat') {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`flex items-start gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
            <div className="w-10 h-10 rounded-full bg-slate-700/30"></div>
            <div className={`p-4 rounded-2xl max-w-[70%] space-y-2 bg-slate-800/30 border border-white/5`}>
              <div className="h-3 w-20 bg-indigo-500/20 rounded"></div>
              <div className="h-4 w-60 bg-slate-700/20 rounded"></div>
              <div className="h-3 w-40 bg-slate-700/15 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 animate-pulse">
      <div className="h-8 w-1/4 bg-slate-800/50 rounded-lg border border-white/5"></div>
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-800/30 rounded-md"
          style={{ width: `${100 - i * 8}%` }}
        ></div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
