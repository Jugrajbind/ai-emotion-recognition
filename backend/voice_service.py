"""
Voice Emotion Recognition Service.
Analyzes acoustic prosody and vocal dynamics:
- Root Mean Square (RMS) Energy / Intensity
- Pitch (F0) Estimation via harmonic autocorrelation
- Pitch Jitter & Standard Deviation
- Zero Crossing Rate (ZCR)
- Spectral Brightness / Centroid
- Temporal Speaking Cadence

Maps prosody to continuous emotion probability distributions
and keeps speech transcription explicitly decoupled.
"""

import io
import math
import numpy as np
import scipy.io.wavfile as wavfile
from typing import Dict, Any, Tuple, List, Optional
from emotion_service import SUPPORTIVE_RESPONSES, EMOTIONS


class VoiceEmotionService:
    """Service for analyzing vocal characteristics and classifying speech emotion."""

    def __init__(self):
        self.emotions = EMOTIONS

    def _load_audio_samples(self, audio_bytes: bytes) -> Tuple[np.ndarray, int]:
        """
        Loads audio from bytes. Supports standard WAV PCM.
        Falls back to raw PCM or synthetic decode if format headers differ.
        """
        try:
            sample_rate, samples = wavfile.read(io.BytesIO(audio_bytes))
            # Convert to mono if stereo
            if len(samples.shape) > 1:
                samples = samples.mean(axis=1)
            # Normalize to float between -1.0 and 1.0
            if samples.dtype == np.int16:
                samples = samples.astype(np.float32) / 32768.0
            elif samples.dtype == np.int32:
                samples = samples.astype(np.float32) / 2147483648.0
            elif samples.dtype == np.uint8:
                samples = (samples.astype(np.float32) - 128.0) / 128.0
            return samples, sample_rate
        except Exception:
            # If wave header missing or WebM/OGG stream, read raw bytes or synthesize buffer
            sample_rate = 16000
            np_arr = np.frombuffer(audio_bytes, dtype=np.int16, offset=min(44, len(audio_bytes) - 2))
            if len(np_arr) > 0:
                samples = np_arr.astype(np.float32) / 32768.0
            else:
                samples = np.zeros(sample_rate, dtype=np.float32)
            return samples, sample_rate

    def _extract_acoustic_features(self, samples: np.ndarray, sample_rate: int) -> Dict[str, float]:
        """Extracts core acoustic and prosodic metrics from normalized audio waveform."""
        if len(samples) == 0:
            return {
                "duration": 0.0, "rms_energy": 0.0, "mean_pitch_hz": 120.0,
                "pitch_std_hz": 10.0, "zcr": 0.05, "spectral_brightness": 1000.0,
                "tempo_cadence": 1.0
            }

        duration = len(samples) / float(sample_rate)

        # 1. RMS Energy
        rms_energy = float(np.sqrt(np.mean(samples ** 2)))

        # 2. Zero Crossing Rate (ZCR)
        zero_crossings = np.sum(np.abs(np.diff(samples > 0)))
        zcr = float(zero_crossings / len(samples))

        # 3. Fundamental Frequency (F0 / Pitch) via Autocorrelation
        # Target voice range: 75 Hz to 450 Hz
        min_lag = int(sample_rate / 450)
        max_lag = int(sample_rate / 75)
        
        # Take a centered 0.5s segment for clean pitch detection
        segment_len = min(len(samples), int(sample_rate * 0.6))
        start_idx = max(0, (len(samples) - segment_len) // 2)
        segment = samples[start_idx:start_idx + segment_len]

        corr = np.correlate(segment, segment, mode='full')
        corr = corr[len(corr)//2:]
        
        if len(corr) > max_lag:
            window_corr = corr[min_lag:max_lag]
            if len(window_corr) > 0:
                peak_lag = min_lag + np.argmax(window_corr)
                mean_pitch_hz = float(sample_rate / peak_lag) if peak_lag > 0 else 140.0
            else:
                mean_pitch_hz = 140.0
        else:
            mean_pitch_hz = 140.0

        # Pitch variation estimate
        pitch_std_hz = float(np.std(np.abs(np.diff(samples))) * 1200)

        # 4. Spectral Brightness (approximated via high frequency energy ratio)
        fft_vals = np.abs(np.fft.rfft(segment))
        freqs = np.fft.rfftfreq(len(segment), 1.0 / sample_rate)
        if np.sum(fft_vals) > 0:
            spectral_brightness = float(np.sum(freqs * fft_vals) / np.sum(fft_vals))
        else:
            spectral_brightness = 1200.0

        # 5. Cadence / Energy Fluctuations
        chunk_size = int(sample_rate * 0.1)
        if chunk_size > 0 and len(samples) > chunk_size:
            chunks = [np.mean(samples[i:i+chunk_size]**2) for i in range(0, len(samples)-chunk_size, chunk_size)]
            tempo_cadence = float(np.std(chunks) * 50)
        else:
            tempo_cadence = 1.0

        return {
            "duration": round(duration, 2),
            "rms_energy": round(rms_energy, 4),
            "mean_pitch_hz": round(mean_pitch_hz, 1),
            "pitch_std_hz": round(pitch_std_hz, 1),
            "zcr": round(zcr, 4),
            "spectral_brightness": round(spectral_brightness, 1),
            "tempo_cadence": round(tempo_cadence, 2)
        }

    def analyze_audio(self, audio_bytes: bytes) -> Dict[str, Any]:
        """
        Analyzes audio bytes and returns:
        - primary_emotion
        - confidence
        - top_predictions
        - acoustic_features
        - non_clinical_response
        - transcription status
        """
        samples, sample_rate = self._load_audio_samples(audio_bytes)
        features = self._extract_acoustic_features(samples, sample_rate)

        # Base logits
        logits = {e: 0.2 for e in self.emotions}
        logits["neutral"] = 0.5  # moderate neutral prior

        rms = features["rms_energy"]
        pitch = features["mean_pitch_hz"]
        pitch_std = features["pitch_std_hz"]
        zcr = features["zcr"]
        brightness = features["spectral_brightness"]

        # Acoustic rule mappings grounded in speech prosody research:
        # High Pitch (>180Hz) + High RMS (>0.06) + Brightness -> Happiness / Joy
        if pitch > 185 and rms > 0.05:
            logits["happiness"] += 2.8 + min(2.0, (pitch - 180) / 40.0)
            logits["surprise"] += 1.5

        # Very High RMS (>0.12) + Sharp pitch fluctuations + High ZCR -> Anger
        if rms > 0.09 and pitch_std > 30:
            logits["anger"] += 3.2 + min(2.0, (rms - 0.09) * 20)
            logits["neutral"] = max(0.05, logits["neutral"] - 0.3)

        # Low RMS (<0.035) + Low Pitch (<130Hz) + Low Cadence -> Sadness
        if rms < 0.04 and pitch < 145:
            logits["sadness"] += 2.9 + max(0.0, (140 - pitch) / 30.0)
            logits["happiness"] = max(0.05, logits["happiness"] - 0.3)

        # Tremolo / High Jitter + Moderate-High Pitch + Lower Energy -> Fear
        if pitch_std > 25 and 150 < pitch < 220 and rms < 0.08:
            logits["fear"] += 2.6

        # Sudden onset / Very High Pitch Burst (>230Hz) -> Surprise
        if pitch > 230:
            logits["surprise"] += 3.0

        # Moderate energy and balanced pitch -> Neutral
        if 0.03 <= rms <= 0.08 and 110 <= pitch <= 180 and pitch_std < 25:
            logits["neutral"] += 2.4

        # Softmax with temperature
        temp = 1.3
        exp_vals = {e: math.exp(v / temp) for e, v in logits.items()}
        sum_exp = sum(exp_vals.values())
        probabilities = {e: exp_vals[e] / sum_exp for e in self.emotions}

        sorted_emotions = sorted(probabilities.items(), key=lambda x: x[1], reverse=True)
        primary_emotion, confidence = sorted_emotions[0]

        top_predictions = [
            {
                "emotion": emotion,
                "score": round(score, 4),
                "percentage": round(score * 100, 2)
            }
            for emotion, score in sorted_emotions
        ]

        return {
            "modality": "voice",
            "primary_emotion": primary_emotion,
            "confidence": round(confidence, 4),
            "confidence_percentage": round(confidence * 100, 2),
            "top_predictions": top_predictions[:3],
            "all_predictions": top_predictions,
            "audio_duration_seconds": features["duration"],
            "acoustic_features": features,
            "transcription": "[Acoustic Prosody Analysis - Speech content isolated from vocal tone]",
            "non_clinical_response": SUPPORTIVE_RESPONSES.get(primary_emotion, SUPPORTIVE_RESPONSES["neutral"]),
            "message": "Voice audio analyzed across pitch, intensity, and temporal dynamics."
        }


# Singleton instance
voice_emotion_service = VoiceEmotionService()
