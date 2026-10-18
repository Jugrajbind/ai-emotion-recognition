import React from 'react';
import { HeartHandshake, AlertCircle, Info, Sparkles } from 'lucide-react';

export function SupportiveAdviceCard({ advice, emotion }) {
  if (!advice) return null;

  return (
    <div className="glass-card rounded-xl p-4 border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 to-slate-900/60 space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
          <HeartHandshake className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Supportive Reflection
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
              <Sparkles className="w-2.5 h-2.5" /> Non-Clinical
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{advice}</p>
        </div>
      </div>

      {/* Non-clinical and bias ethical disclaimer banner */}
      <div className="flex items-start gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-300">Project Disclaimer:</strong> Emotion predictions are algorithmic estimates based on training patterns, not psychiatric assessments or definitive judgments of a person's emotional state.
        </p>
      </div>
    </div>
  );
}
