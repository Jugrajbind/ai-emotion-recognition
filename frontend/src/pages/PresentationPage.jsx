import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Cpu,
  ShieldAlert,
  HelpCircle,
  Layers,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Award,
  Terminal,
} from 'lucide-react';

export function PresentationPage() {
  const [openFaq, setOpenFaq] = useState(0);

  const vivaQuestions = [
    {
      q: '1. What is the fundamental difference between Sentiment Analysis and Emotion Recognition?',
      a: 'Sentiment analysis typically classifies input along a 1-dimensional polarity axis (Positive, Negative, Neutral). Emotion Recognition is fine-grained and categorizes discrete psychological states (Happiness, Sadness, Anger, Fear, Surprise, Neutral) based on Ekman’s discrete emotion theory or Plutchik’s emotion wheel.',
    },
    {
      q: '2. Why did you choose a Multimodal approach rather than single-channel text or vision?',
      a: 'Human communication is inherently multi-sensory. Facial expressions can mask feelings (e.g. forced smiles), while text can lack tone (e.g. sarcasm). By fusing linguistic NLP with facial vision and vocal prosody, the system cross-verifies modalities, mitigating single-source errors and increasing classification robustness.',
    },
    {
      q: '3. How does the Facial Emotion Recognition pipeline detect faces and classify expressions?',
      a: 'First, OpenCV utilizes a Haar Feature-based Cascade Classifier to extract the Region of Interest (ROI) bounding box around the human face. The normalized 48x48 grayscale ROI is fed into a PyTorch Convolutional Neural Network (MiniFERNet) combined with facial Action Unit (AU) geometry (mouth curvature/smile detector, eye aspect ratio, and brow furrow texture variance) to output calibrated softmax probabilities across 6 emotion classes.',
    },
    {
      q: '4. How are continuous confidence scores derived instead of binary outputs?',
      a: 'The output logits from the classification layers are normalized using a temperature-scaled Softmax function: P(e_i) = exp(z_i / T) / sum(exp(z_j / T)). This produces a continuous probability distribution where all classes sum strictly to 1.0 (100%), allowing us to extract the top-3 ranked predictions.',
    },
    {
      q: '5. What are the key ethical and demographic limitations of automated emotion recognition?',
      a: '1) Facial expressions are culturally and contextually diverse; a smile does not always indicate happiness. 2) Vision models trained predominantly on specific demographic datasets can exhibit bias across age, ethnicity, or lighting. 3) Crucially, these predictions are statistical estimates of surface signals, NOT psychiatric or medical mental-health diagnoses.',
    },
    {
      q: '6. How is user privacy handled for webcam video frames and microphone audio?',
      a: 'In accordance with privacy-by-design principles, raw webcam frames and audio recordings are processed purely in-memory (RAM) as ephemeral byte buffers. The database (SQLite) strictly stores extracted scalar analytics, timestamps, and confidence percentages—never saving raw photos or biometric audio files to persistent storage.',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Hero Presentation Header */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/30 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
          <GraduationCap className="w-3.5 h-3.5" /> B.Tech Computer Science & Engineering Capstone Project
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          AI Emotion Recognition System: College Presentation & Viva Kit
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          Complete project documentation, academic problem formulation, system architecture diagrams, model specifications, ethical safeguards, and viva oral defense guide.
        </p>
      </div>

      {/* Section 1: Abstract & Problem Statement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>1. Project Abstract</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed text-justify">
            Human emotion recognition plays a pivotal role in Human-Computer Interaction (HCI), assistive wellness technologies, and customer experience systems. This capstone project introduces an end-to-end, full-stack AI Emotion Recognition System integrating three sensory modalities: Natural Language Processing (NLP) for textual utterances, OpenCV computer vision with deep convolutional neural networks for facial expressions, and prosodic acoustic analysis for vocal recordings. The application calculates calibrated continuous probability distributions, highlights top-3 ranked emotions, provides supportive non-clinical reflections, and presents interactive visual analytics via an enterprise-grade React and FastAPI architecture.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <ShieldAlert className="w-4 h-4" />
            <span>2. Problem Statement & Motivation</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed text-justify">
            Conventional human-computer interfaces remain emotionally blind, treating user inputs purely as sterile data commands. While existing single-modal sentiment tools classify text along binary positive/negative scales, they fail to distinguish nuanced emotional states like fear from sadness, or surprise from joy. Furthermore, facial recognition systems often suffer from high latency, privacy vulnerabilities, and lack of calibrated confidence estimation. There is a strong need for an accessible, multi-sensory, privacy-preserving AI architecture capable of real-time emotion recognition with ethical guardrails.
          </p>
        </div>
      </div>

      {/* Section 2: Objectives & Existing vs. Proposed System Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
          <Layers className="w-4 h-4" />
          <span>3. Existing System vs. Proposed Multimodal System</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Evaluation Dimension</th>
                <th className="py-3 px-4 text-slate-400">Traditional / Existing Systems</th>
                <th className="py-3 px-4 text-indigo-400 font-semibold">Our Proposed Multimodal AI System</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Sensory Channels</td>
                <td className="py-3 px-4 text-slate-400">Single modality (Text-only or Vision-only)</td>
                <td className="py-3 px-4 text-indigo-300 font-medium">Multimodal (Text + OpenCV Facial HUD + Vocal Prosody)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Classification Resolution</td>
                <td className="py-3 px-4 text-slate-400">Binary sentiment (Positive / Negative)</td>
                <td className="py-3 px-4 text-indigo-300 font-medium">6 Discrete Emotion Classes (Joy, Sad, Anger, Fear, Surprise, Neutral)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Confidence Calibration</td>
                <td className="py-3 px-4 text-slate-400">Uncalibrated or hardcoded threshold scores</td>
                <td className="py-3 px-4 text-indigo-300 font-medium">Temperature-scaled continuous Softmax (summing to 1.0)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Biometric Privacy</td>
                <td className="py-3 px-4 text-slate-400">Stores raw webcam photos & audio files</td>
                <td className="py-3 px-4 text-indigo-300 font-medium">Zero-storage ephemeral in-memory processing</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Supportive Experience</td>
                <td className="py-3 px-4 text-slate-400">Static numeric output with no human context</td>
                <td className="py-3 px-4 text-indigo-300 font-medium">Empathetic non-clinical reflections & ethical disclaimers</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: System Architecture Visual Diagram */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <Cpu className="w-4 h-4" />
          <span>4. System Architecture & Information Flow</span>
        </div>

        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center">
            {/* Box 1 */}
            <div className="p-3 rounded-lg bg-indigo-950/60 border border-indigo-800/60 w-full md:w-1/4">
              <span className="text-indigo-400 font-bold block text-[11px]">FRONTEND CLIENT</span>
              <span className="text-[10px] text-slate-400 block mt-1">React 18 + Tailwind CSS</span>
              <span className="text-[10px] text-slate-400 block">Webcam Canvas & Audio Visualizer</span>
            </div>

            <span className="text-slate-500 font-bold">➔ REST / JSON ➔</span>

            {/* Box 2 */}
            <div className="p-3 rounded-lg bg-sky-950/60 border border-sky-800/60 w-full md:w-1/3">
              <span className="text-sky-400 font-bold block text-[11px]">FASTAPI REST ENGINE</span>
              <span className="text-[10px] text-slate-400 block mt-1">Pydantic Schemas + CORS Middleware</span>
              <span className="text-[10px] text-slate-400 block">JWT Authentication & Session Control</span>
            </div>

            <span className="text-slate-500 font-bold">➔ INFERENCE ➔</span>

            {/* Box 3 */}
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/60 w-full md:w-1/3">
              <span className="text-emerald-400 font-bold block text-[11px]">AI / ML MODEL SUITE</span>
              <span className="text-[10px] text-slate-400 block mt-1">1. Text NLP Sentiment Pipeline</span>
              <span className="text-[10px] text-slate-400 block">2. OpenCV + PyTorch FER MiniNet</span>
              <span className="text-[10px] text-slate-400 block">3. Vocal Prosody Harmonic Pitch Engine</span>
            </div>
          </div>

          <div className="pt-2 text-center text-slate-400 text-[11px] border-t border-slate-800">
            <span>Persistence Layer: SQLite ORM Database (Users, Analysis Records, Exportable CSV)</span>
          </div>
        </div>
      </div>

      {/* Section 4: Machine Learning Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
            Text NLP Model
          </span>
          <h4 className="text-sm font-bold text-white">Contextual Semantic Engine</h4>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li>N-gram lexicon scoring with negations</li>
            <li>Intensifier weighting (1.4x - 1.9x)</li>
            <li>HuggingFace Transformers support</li>
            <li>Zero-latency offline fallback engine</li>
          </ul>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
            Facial Vision Model
          </span>
          <h4 className="text-sm font-bold text-white">OpenCV + PyTorch MiniFER</h4>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li>Haar Cascade Frontal Face localization</li>
            <li>Action Unit smile & brow furrow analysis</li>
            <li>PyTorch 4-layer CNN feature extractor</li>
            <li>Styled HUD bounding box banner preview</li>
          </ul>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
            Speech Prosody Model
          </span>
          <h4 className="text-sm font-bold text-white">Acoustic Prosody Analyzer</h4>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li>Fundamental Frequency (F0) autocorrelation</li>
            <li>Root Mean Square (RMS) loudness energy</li>
            <li>Zero Crossing Rate (ZCR) articulation</li>
            <li>Decoupled from speech transcription</li>
          </ul>
        </div>
      </div>

      {/* Section 5: Frequently Asked College Viva Questions */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <HelpCircle className="w-4 h-4" />
          <span>5. College Viva Defense Questions & Model Answers</span>
        </div>
        <p className="text-xs text-slate-400">
          Click any question below to study key technical justifications commonly asked by internal and external examiners.
        </p>

        <div className="space-y-3 pt-1">
          {vivaQuestions.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/60"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-semibold text-slate-200 hover:text-indigo-400 transition-colors"
                >
                  <span>{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-300 border-t border-slate-800/80 pt-3 leading-relaxed bg-slate-950/40">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
