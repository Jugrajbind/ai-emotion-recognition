import React, { useState, useRef } from 'react';
import {
  Layers,
  MessageSquareQuote,
  Camera,
  Sliders,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { api } from '../services/api';
import { EmotionBadge } from '../components/EmotionBadge';
import { ConfidenceBar } from '../components/ConfidenceBar';
import { SupportiveAdviceCard } from '../components/SupportiveAdviceCard';

export function MultimodalWorkspace() {
  const [text, setText] = useState('I am thrilled about the presentation, but also feeling slightly nervous.');
  const [faceImageBase64, setFaceImageBase64] = useState(null);
  const [textWeight, setTextWeight] = useState(0.5);
  const [streamActive, setStreamActive] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 360, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStreamActive(true);
      setError('');
    } catch (err) {
      setError('Camera access denied. You can upload an image or proceed with text input.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = 480;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 480, 360);
    const b64 = canvas.toDataURL('image/jpeg', 0.85);
    setFaceImageBase64(b64);
    stopCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFaceImageBase64(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFuseAnalysis = async () => {
    if (!text.trim() && !faceImageBase64) {
      setError('Please provide at least a text prompt or a facial image.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const faceWeight = 1.0 - textWeight;
      const data = await api.analyzeMultimodal(text, faceImageBase64, textWeight, faceWeight);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Multimodal fusion failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>Multimodal Emotion Fusion Laboratory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Combines natural language semantic cues with facial vision features using weighted late-decision ensemble fusion.
          </p>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Multi-Sensory Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Channel 1: Text Utterance */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <MessageSquareQuote className="w-4 h-4 text-indigo-400" />
                <span>Sensory Channel 1: Linguistic Text</span>
              </span>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                NLP Pipeline
              </span>
            </div>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter what the person is saying or writing..."
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Channel 2: Facial Snapshot */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Sensory Channel 2: Facial Expression</span>
              </span>
              <div className="flex items-center gap-2">
                {!streamActive && !faceImageBase64 ? (
                  <button
                    onClick={startCamera}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium transition-colors"
                  >
                    Open Camera
                  </button>
                ) : streamActive ? (
                  <button
                    onClick={captureFrame}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium transition-colors"
                  >
                    Take Snapshot
                  </button>
                ) : (
                  <button
                    onClick={() => setFaceImageBase64(null)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                  >
                    Retake
                  </button>
                )}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                >
                  Upload
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Viewport for Face Snapshot */}
            <div className="h-44 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${streamActive ? 'block' : 'hidden'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {!streamActive && faceImageBase64 && (
                <img
                  src={faceImageBase64}
                  alt="Snapshot"
                  className="w-full h-full object-contain"
                />
              )}

              {!streamActive && !faceImageBase64 && (
                <div className="text-center p-4 text-xs text-slate-500">
                  Click "Open Camera" to take a snapshot or "Upload" to supply a face photo
                </div>
              )}
            </div>
          </div>

          {/* Fusion Weights Slider */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>Decision Fusion Reliability Weights</span>
              </span>
              <span className="font-mono text-purple-300">
                Text: {(textWeight * 100).toFixed(0)}% | Face: {((1 - textWeight) * 100).toFixed(0)}%
              </span>
            </div>

            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={textWeight}
              onChange={(e) => setTextWeight(parseFloat(e.target.value))}
              className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>More Weight on Text</span>
              <span>Balanced 50/50</span>
              <span>More Weight on Facial Vision</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Execute Fusion Button */}
          <button
            onClick={handleFuseAnalysis}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Executing Multimodal Decision Fusion...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Compute Multimodal Fused Emotion</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Fused Results & Cross-Modality Analysis (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 animate-slide-up">
              {/* Primary Emotion Result Card */}
              <div className="text-center p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Multimodal Fused Outcome
                </span>
                <div>
                  <EmotionBadge emotion={result.primary_emotion} size="lg" />
                </div>
                <div className="pt-1 flex items-center justify-center gap-2">
                  <span className="text-xs text-slate-400">Fused Confidence:</span>
                  <span className="font-mono text-base font-bold text-emerald-400">
                    {result.confidence_percentage}%
                  </span>
                </div>
              </div>

              {/* Modality Contribution Breakdown */}
              {result.contributing_modalities?.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                    Modality Ensemble Contributions
                  </span>
                  <div className="space-y-2">
                    {result.contributing_modalities.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs"
                      >
                        <span className="capitalize font-medium text-slate-300">
                          {m.modality} Channel
                        </span>
                        <div className="flex items-center gap-2">
                          <EmotionBadge emotion={m.detected_emotion} size="sm" showEmoji={false} />
                          <span className="font-mono text-slate-400">
                            {(m.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top 3 Predictions Breakdown */}
              <div className="glass-card p-4 rounded-xl border border-slate-800">
                <ConfidenceBar
                  predictions={result.top_predictions}
                  title="Ensemble Ranking"
                />
              </div>

              {/* Supportive Reflection */}
              <SupportiveAdviceCard
                advice={result.non_clinical_response}
                emotion={result.primary_emotion}
              />
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center min-h-[360px] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">Awaiting Fusion Inputs</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Provide both a sentence and a facial snapshot. The system will fuse predictions across linguistic semantics and facial vision.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
