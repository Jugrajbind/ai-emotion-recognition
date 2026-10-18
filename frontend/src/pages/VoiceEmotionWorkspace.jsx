import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Upload,
  Play,
  Volume2,
  Activity,
  AlertCircle,
  Sparkles,
  RotateCcw,
  AudioWaveform,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { EmotionBadge } from '../components/EmotionBadge';
import { ConfidenceBar } from '../components/ConfidenceBar';
import { SupportiveAdviceCard } from '../components/SupportiveAdviceCard';

export function VoiceEmotionWorkspace() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // Clean up audio URL and recorder on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [audioUrl]);

  const startVisualizer = (stream) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 128;

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
          // Gradient bar
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#38bdf8');
          gradient.addColorStop(1, '#818cf8');
          ctx.fillStyle = gradient;

          ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }
      };

      draw();
    } catch (e) {
      console.warn('Audio visualizer init error:', e);
    }
  };

  const startRecording = async () => {
    setError('');
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startVisualizer(stream);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop media stream tracks
        stream.getTracks().forEach((track) => track.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      setError('Microphone permission denied. You can also upload an audio file below.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleAnalyzeVoice = async (blobToAnalyze = null) => {
    const targetBlob = blobToAnalyze || audioBlob;
    if (!targetBlob) {
      setError('Please record or upload an audio file first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.analyzeVoice(targetBlob, 'voice_sample.wav');
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze vocal prosody.');
    } finally {
      setLoading(false);
    }
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError('Audio file must be under 15MB.');
      return;
    }

    setError('');
    setAudioBlob(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    handleAnalyzeVoice(file);
  };

  const handleReset = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setResult(null);
    setError('');
    setRecordingSeconds(0);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-sky-400" />
            <span>Voice Emotion Analysis (Speech Prosody Module)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Measures acoustic pitch ($F_0$), intensity, harmonic jitter, and vocal cadence decoupled from text transcription.
          </p>
        </div>

        {/* Reset button */}
        {(audioBlob || result) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Audio</span>
          </button>
        )}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Audio Recording & Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Vocal Waveform & Prosody Capture
              </span>
              {isRecording && (
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  Recording: {recordingSeconds}s
                </span>
              )}
            </div>

            {/* Visualizer Canvas */}
            <div className="h-32 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center relative">
              <canvas
                ref={canvasRef}
                width={500}
                height={128}
                className="w-full h-full object-cover"
              />
              {!isRecording && !audioUrl && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/80">
                  <AudioWaveform className="w-8 h-8 text-slate-600" />
                  <span className="text-xs text-slate-500">Live frequency spectrum displays during recording</span>
                </div>
              )}
            </div>

            {/* Recorded Audio Playback Bar */}
            {audioUrl && !isRecording && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-sky-400 shrink-0" />
                <audio src={audioUrl} controls className="w-full h-8" />
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/30 transition-all"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Start Microphone</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/30 transition-all"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Stop Recording</span>
                  </button>
                )}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Audio (WAV/MP3)</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAudioUpload}
                  accept="audio/*"
                  className="hidden"
                />
              </div>

              {audioBlob && !isRecording && (
                <button
                  onClick={() => handleAnalyzeVoice()}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/30 transition-all disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Extracting Prosody...</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-3.5 h-3.5" />
                      <span>Classify Speech Emotion</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Decoupling Architecture Note */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Acoustic Emotion vs. Speech Transcription Separation</span>
            </div>
            <p>
              In accordance with acoustic modeling standards, this module classifies emotional state purely from vocal prosody (fundamental frequency, intensity contour, speaking rate) rather than linguistic lexicon, preventing speech-to-text bias.
            </p>
          </div>
        </div>

        {/* Right Column: Acoustic Prosody & Predictions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 animate-slide-up">
              {/* Primary Emotion Result Card */}
              <div className="text-center p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Vocal Emotion Classified
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

              {/* Acoustic Prosody Metrics Grid */}
              {result.acoustic_features && (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                    Acoustic Prosodic Metrics
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Mean Pitch (F0)</span>
                      <span className="font-mono font-bold text-sky-400">
                        {result.acoustic_features.mean_pitch_hz} Hz
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">RMS Loudness</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {result.acoustic_features.rms_energy}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Pitch Variance</span>
                      <span className="font-mono font-bold text-purple-400">
                        {result.acoustic_features.pitch_std_hz} Hz
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Audio Duration</span>
                      <span className="font-mono font-bold text-amber-400">
                        {result.audio_duration_seconds}s
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Top 3 Predictions Breakdown */}
              <div className="glass-card p-4 rounded-xl border border-slate-800">
                <ConfidenceBar
                  predictions={result.top_predictions}
                  title="Acoustic Expression Ranking"
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
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">Awaiting Vocal Audio</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Click "Start Microphone" to record a speech sample or upload an audio clip to compute acoustic prosodic features and classify speech emotion.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
