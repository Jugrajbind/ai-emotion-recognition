import React from 'react';
import { Smile, Frown, Flame, ShieldAlert, Sparkles, MinusCircle } from 'lucide-react';

export const EMOTION_CONFIG = {
  happiness: {
    label: 'Happiness',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    barClass: 'bg-emerald-500',
    emoji: '😊',
    icon: Smile,
  },
  sadness: {
    label: 'Sadness',
    color: 'blue',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    barClass: 'bg-blue-500',
    emoji: '😔',
    icon: Frown,
  },
  anger: {
    label: 'Anger',
    color: 'rose',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    barClass: 'bg-rose-500',
    emoji: '😠',
    icon: Flame,
  },
  fear: {
    label: 'Fear',
    color: 'purple',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    barClass: 'bg-purple-500',
    emoji: '😨',
    icon: ShieldAlert,
  },
  surprise: {
    label: 'Surprise',
    color: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    barClass: 'bg-amber-500',
    emoji: '😲',
    icon: Sparkles,
  },
  neutral: {
    label: 'Neutral',
    color: 'slate',
    badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
    barClass: 'bg-slate-400',
    emoji: '😐',
    icon: MinusCircle,
  },
};

export function EmotionBadge({ emotion, confidence = null, size = 'md', showEmoji = true }) {
  const normalizedKey = (emotion || 'neutral').toLowerCase();
  const config = EMOTION_CONFIG[normalizedKey] || EMOTION_CONFIG.neutral;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
    lg: 'text-base px-4 py-1.5 gap-2.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.badgeClass} ${sizeClasses[size]}`}
    >
      {showEmoji && <span className="text-base leading-none">{config.emoji}</span>}
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
      {confidence !== null && (
        <span className="opacity-75 font-mono text-xs ml-0.5">
          {typeof confidence === 'number' && confidence <= 1 ? (confidence * 100).toFixed(1) : confidence}%
        </span>
      )}
    </span>
  );
}

export function ConfidenceBar({ predictions = [], title = 'Prediction Probabilities' }) {
  if (!predictions || predictions.length === 0) return null;

  return (
    <div className="space-y-3">
      {title && (
        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-400 font-semibold">
          <span>{title}</span>
          <span>Confidence</span>
        </div>
      )}
      <div className="space-y-2">
        {predictions.map((p, idx) => {
          const emotionKey = (p.emotion || '').toLowerCase();
          const config = EMOTION_CONFIG[emotionKey] || EMOTION_CONFIG.neutral;
          const percentage = p.percentage !== undefined ? p.percentage : (p.score * 100).toFixed(1);

          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-200">
                  <span>{config.emoji}</span>
                  <span>{config.label}</span>
                </span>
                <span className="font-mono text-slate-400">{percentage}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${config.barClass}`}
                  style={{ width: `${Math.max(4, Math.min(100, percentage))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
