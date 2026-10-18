import React from 'react';
import {
  LayoutDashboard,
  MessageSquareQuote,
  Camera,
  Mic,
  Layers,
  History,
  GraduationCap,
  Settings,
  BrainCircuit,
  LogOut,
  User as UserIcon,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export function Sidebar({ currentTab, setCurrentTab, user, onOpenAuth, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Analytics', icon: LayoutDashboard, badge: null },
    { id: 'text', label: 'Text Emotion Analysis', icon: MessageSquareQuote, badge: 'NLP' },
    { id: 'face', label: 'Facial Emotion (Webcam)', icon: Camera, badge: 'OpenCV' },
    { id: 'voice', label: 'Voice Emotion Prosody', icon: Mic, badge: 'Audio' },
    { id: 'multimodal', label: 'Multimodal Fusion Lab', icon: Layers, badge: 'Fused' },
    { id: 'history', label: 'History & Reports', icon: History, badge: null },
    { id: 'presentation', label: 'College Viva & Report Kit', icon: GraduationCap, badge: 'Docs' },
    { id: 'settings', label: 'System & Model Status', icon: Settings, badge: null },
  ];

  return (
    <aside className="w-72 bg-[#0c1222]/95 border-r border-slate-800/80 flex flex-col h-screen sticky top-0 shrink-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center text-white">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>EMOTION</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono font-semibold border border-indigo-500/30">
                .AI
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Multimodal Emotion Recognition</p>
          </div>
        </div>

        {/* Project Tag */}
        <div className="mt-3 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> B.Tech CSE Project
          </span>
          <span className="font-mono text-[10px] text-indigo-400">v1.0 Ready</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Workspaces
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/90 to-indigo-700/80 text-white shadow-md shadow-indigo-600/20 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Backend Health Status Badge */}
      <div className="px-4 py-2 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-xs px-2.5 py-2 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-emerald-400">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-[11px]">Engine Online</span>
          </span>
          <span className="font-mono text-[10px] text-emerald-300">FastAPI :8000</span>
        </div>
      </div>

      {/* User Session Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        {user ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase border border-indigo-500/30 shrink-0">
                {user.username.slice(0, 2)}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">{user.full_name || user.username}</p>
                <p className="text-[10px] text-slate-400 truncate">@{user.username}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition-all hover:scale-[1.01]"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In / Student Account</span>
          </button>
        )}
      </div>
    </aside>
  );
}
