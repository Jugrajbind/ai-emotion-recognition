import React, { useState } from 'react';
import {
  MessageSquareQuote,
  Send,
  Sparkles,
  RotateCcw,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { EmotionBadge } from '../components/EmotionBadge';
import { ConfidenceBar } from '../components/ConfidenceBar';
import { SupportiveAdviceCard } from '../components/SupportiveAdviceCard';

export function TextEmotionWorkspace() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const samplePrompts = [
    {
      label: 'Academic Success (Joy)',
      text: 'I passed my exam with top honors and I am very happy!',
    },
    {
      label: 'Deep Sorrow (Sadness)',
      text: 'I feel completely lonely, heartbroken, and drained today.',
    },
    {
      label: 'Frustration (Anger)',
      text: 'The server crashed right before deadline and I lost all my code! This is infuriating!',
    },
    {
      label: 'Exam Anxiety (Fear)',
      text: 'I have my major project viva tomorrow morning and my hands are trembling with panic.',
    },
    {
      label: 'Astonishment (Surprise)',
      text: 'I had no idea I was nominated for the national research award! Wow!',
    },
    {
      label: 'Factual State (Neutral)',
      text: 'The experiment was executed using Python 3.11 with standard hyperparameters.',
    },
  ];

  const handleAnalyze = async (textToAnalyze = null) => {
    const text = textToAnalyze !== null ? textToAnalyze : inputText;
    if (!text || !text.trim()) {
      setError('Please type a sentence or click one of the preset sample prompts below.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await api.analyzeText(text.trim());
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze text emotion.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sampleText) => {
    setInputText(sampleText);
    handleAnalyze(sampleText);
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setError('');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-indigo-400" />
            <span>Text Emotion Detection Workspace</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Natural Language Processing module analyzing linguistic sentiment, valence, and contextual affect.
          </p>
        </div>

        {result && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Input</span>
          </button>
        )}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Text Input & Sample Prompts (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Enter Sentence or Paragraph
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {inputText.length} chars | {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words
              </span>
            </div>

            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. I passed my exam and I am very happy! Or describe how your day went..."
              className="w-full p-4 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
            />

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500 italic">
                Evaluates negation, semantic intensity, and contextual affect
              </span>
              <button
                onClick={() => handleAnalyze()}
                disabled={loading || !inputText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Classify Emotion</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preset College Demo Prompts */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>1-Click Demonstration Prompts</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePrompts.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(sample.text)}
                  className="text-left p-3 rounded-xl bg-slate-900/70 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 transition-all group"
                >
                  <p className="text-[11px] font-semibold text-indigo-400 group-hover:text-indigo-300 mb-0.5">
                    {sample.label}
                  </p>
                  <p className="text-xs text-slate-300 line-clamp-2">"{sample.text}"</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Prediction Results & Supportive Reflection (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 animate-slide-up">
              {/* Primary Emotion Result Card */}
              <div className="text-center p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Primary Classification
                </span>
                <div>
                  <EmotionBadge emotion={result.primary_emotion} size="lg" />
                </div>
                <div className="pt-1 flex items-center justify-center gap-2">
                  <span className="text-xs text-slate-400">Model Confidence:</span>
                  <span className="font-mono text-base font-bold text-emerald-400">
                    {result.confidence_percentage}%
                  </span>
                </div>
              </div>

              {/* Top 3 Predictions Breakdown */}
              <div className="glass-card p-4 rounded-xl border border-slate-800">
                <ConfidenceBar
                  predictions={result.top_predictions}
                  title="Top 3 Ranked Emotions"
                />
              </div>

              {/* Supportive Non-Clinical Reflection */}
              <SupportiveAdviceCard
                advice={result.non_clinical_response}
                emotion={result.primary_emotion}
              />
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center min-h-[360px] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">Awaiting User Input</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Type an utterance or click any test scenario on the left. The NLP model will return continuous probability distributions and top 3 predictions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
