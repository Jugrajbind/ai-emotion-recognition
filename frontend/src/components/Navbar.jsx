import React from 'react';
import { Sparkles, Cpu, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';

export function Navbar({ title, subtitle, user, onOpenAuth }) {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0c1222]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* ML Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono text-[11px]">Transformers & PyTorch Ready</span>
        </div>

        {/* User Status / Login Button */}
        {user ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-300">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium">{user.username}</span>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all shadow-indigo-600/30"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Login / Demo User</span>
          </button>
        )}
      </div>
    </header>
  );
}
