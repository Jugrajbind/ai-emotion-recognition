import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  CameraOff,
  Upload,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Eye,
  CheckCircle2,
  Sliders,
  Play,
  Square,
} from 'lucide-react';
import { api } from '../services/api';
import { EmotionBadge } from '../components/EmotionBadge';
import { ConfidenceBar } from '../components/ConfidenceBar';
import { SupportiveAdviceCard } from '../components/SupportiveAdviceCard';

export function FacialEmotionWorkspace() {
  const [streamActive, setStreamActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const [continuousScan, setContinuousScan] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Continuous auto-scan effect
  useEffect(() => {
    if (continuousScan && streamActive) {
      scanIntervalRef.current = setInterval(() => {
        captureAndAnalyze(true);
      }, 1600);
    } else {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    }
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [continuousScan, streamActive]);

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStreamActive(true);
      setCameraPermission('granted');
      setSelectedImagePreview(null);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraPermission('denied');
      setError('Camera access denied or no webcam device detected. You can also upload a photo below.');
      setStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    setContinuousScan(false);
  };

  const captureFrameBase64 = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.88);
  };

  const captureAndAnalyze = async (isAuto = false) => {
    if (!streamActive && !selectedImagePreview) {
      setError('Please start the camera or upload an image first.');
      return;
    }

    const b64 = streamActive ? captureFrameBase64() : selectedImagePreview;
    if (!b64) return;

    if (!isAuto) setLoading(true);
    setError('');

    try {
      const data = await api.analyzeFace(b64);
      setResult(data);
      if (!data.face_detected) {
        setError(data.message || 'No face detected in the frame. Please look directly into the camera.');
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze facial expression.');
    } finally {
      if (!isAuto) setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file must be under 10MB.');
      return;
    }

    stopCamera();
    setError('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const b64 = event.target?.result;
      setSelectedImagePreview(b64);
      setLoading(true);
      try {
        const data = await api.analyzeFace(b64);
        setResult(data);
        if (!data.face_detected) {
          setError(data.message || 'No face detected in uploaded photo.');
        }
      } catch (err) {
        setError(err.message || 'Facial analysis failed for uploaded image.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <span>Facial Emotion Recognition (Webcam & Vision HUD)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            OpenCV Haar Cascade Face Detector paired with PyTorch Deep Neural Network for expression classification.
          </p>
        </div>

        {/* Camera Controls */}
        <div className="flex items-center gap-2">
          {!streamActive ? (
            <button
              onClick={startCamera}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/25 transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Start Camera</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/25 transition-all"
            >
              <CameraOff className="w-3.5 h-3.5" />
              <span>Stop Camera</span>
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
          />
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Camera Viewfinder & Capture Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4">
            <div className="relative aspect-video rounded-xl bg-black/80 overflow-hidden border border-slate-800 flex items-center justify-center">
              {/* Live Video Feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${streamActive ? 'block' : 'hidden'}`}
              />

              {/* Uploaded Photo Preview if camera stopped */}
              {!streamActive && selectedImagePreview && (
                <img
                  src={result?.processed_image_base64 || selectedImagePreview}
                  alt="Face analysis"
                  className="w-full h-full object-contain"
                />
              )}

              {/* Viewfinder Idle State */}
              {!streamActive && !selectedImagePreview && (
                <div className="text-center p-6 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                    <Camera className="w-7 h-7" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium">Camera is currently inactive</p>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    Click "Start Camera" above to activate your webcam or upload a photo to evaluate facial expression.
                  </p>
                </div>
              )}

              {/* Continuous Auto-Scan Status Banner */}
              {streamActive && continuousScan && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-semibold flex items-center gap-1.5 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Real-Time Scanning (1.6s)</span>
                </div>
              )}

              {/* Hidden Canvas for Frame Capture */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Error or No Face Banner */}
            {error && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {/* Continuous Scan Toggle */}
              {streamActive && (
                <button
                  onClick={() => setContinuousScan(!continuousScan)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    continuousScan
                      ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Continuous Detection: {continuousScan ? 'ON' : 'OFF'}</span>
                </button>
              )}

              {/* Capture Button */}
              {(streamActive || selectedImagePreview) && (
                <button
                  onClick={() => captureAndAnalyze(false)}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-40 ml-auto"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Classifying Face...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Analyze Facial Expression</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Privacy & Camera Guidance */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-300">Privacy Notice:</strong> Webcam frames are analyzed directly in memory for facial feature geometry and are never saved to disk without your explicit instruction.
            </p>
          </div>
        </div>

        {/* Right Column: Facial Recognition Results (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {result && result.face_detected ? (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 animate-slide-up">
              {/* Primary Emotion Result Card */}
              <div className="text-center p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Facial Emotion Detected
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

              {/* Annotated Processed Image Preview if available */}
              {result.processed_image_base64 && (
                <div className="space-y-1.5">
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                    Vision HUD Annotation
                  </span>
                  <div className="rounded-xl overflow-hidden border border-slate-800 max-h-48 flex items-center justify-center bg-black">
                    <img
                      src={result.processed_image_base64}
                      alt="OpenCV HUD Output"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Top 3 Predictions Breakdown */}
              <div className="glass-card p-4 rounded-xl border border-slate-800">
                <ConfidenceBar
                  predictions={result.top_predictions}
                  title="Facial Expression Ranking"
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
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">Awaiting Facial Scan</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Start the camera or upload a face picture to trigger OpenCV face detection and deep expression neural scoring.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
