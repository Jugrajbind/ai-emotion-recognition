# AI Emotion Recognition System
### A Multimodal Human Emotion Recognition Platform for B.Tech CSE/IT Capstone Project

![System Status](https://img.shields.io/badge/System-Active%20%26%20Verified-emerald)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20REST-009688?logo=fastapi)
![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Tailwind-61DAFB?logo=react)
![PyTorch](https://img.shields.io/badge/Deep%20Learning-PyTorch%20%2B%20OpenCV-EE4C2C?logo=pytorch)
![License](https://img.shields.io/badge/Academic-B.Tech%20Project-indigo)

---

## 1. Project Abstract
Human emotion recognition is an essential frontier in Human-Computer Interaction (HCI), assistive affective computing, and mental wellness research. This capstone project introduces an end-to-end, presentation-ready **AI Emotion Recognition System** capable of analyzing and classifying human affective states across three sensory channels:
1. **Linguistic Text**: Natural Language Processing (NLP) evaluating semantic valence, contextual affect, negation, and emotional intensity.
2. **Facial Expressions**: Real-time OpenCV computer vision face detection integrated with PyTorch Convolutional Neural Networks (MiniFERNet) and Facial Action Unit (AU) geometry.
3. **Vocal Prosody**: Acoustic analysis of fundamental frequency ($F_0$ pitch), root-mean-square (RMS) energy, and speech cadence decoupled from speech-to-text transcription.
4. **Multimodal Decision Fusion**: Weighted late-decision ensemble synthesizing text and facial expression channels.

The platform classifies states into discrete emotion categories: **Happiness, Sadness, Anger, Fear, Surprise, and Neutral**, accompanied by continuous calibrated softmax probabilities, top-3 rankings, and empathetic non-clinical reflections.

---

## 2. Problem Statement
Traditional human-computer interfaces remain emotionally unaware, treating human interactions as sterile data inputs. Existing single-modal sentiment tools typically reduce emotional complexity to binary positive/negative scales and fail to distinguish critical emotions such as fear from sadness or frustration from surprise. Furthermore, many vision-based recognition systems suffer from high latency, privacy vulnerabilities (persisting raw biometric imagery), and lack continuous confidence calibration. 

This project solves these limitations by implementing a secure, real-time, multimodal emotion analysis architecture with strict ethical disclaimers and zero raw multimedia persistence.

---

## 3. Key Objectives
- **Multimodal Classification**: Support text input, live webcam capture, uploaded photos, and microphone vocal clips.
- **Calibrated Probabilities**: Employ temperature-scaled continuous Softmax distributions where probabilities sum strictly to 100%.
- **Action Unit Analysis**: Detect smile curvature, eye aspect ratio, and brow furrow texture variance via OpenCV and deep neural representations.
- **Privacy by Design**: Process webcam frames and audio ephemerally in RAM; store only sanitized scalar analytics and timestamps in SQLite.
- **Empathetic Feedback**: Provide non-clinical supportive reflections while strictly avoiding diagnostic or psychiatric claims.
- **Interactive Visual Analytics**: Interactive Recharts dashboards featuring emotion distributions, activity timelines, and CSV export.

---

## 4. System Architecture

```
+-----------------------------------------------------------------------+
|                           CLIENT TIER                                 |
|   React 18 + Tailwind CSS + Lucide Icons + Recharts Analytics          |
|   - Real-time Webcam Canvas HUD                                       |
|   - Web Audio API Live Waveform Visualizer                            |
|   - Multimodal Decision Fusion Slider Controls                        |
+-----------------------------------+-----------------------------------+
                                    |
                    REST APIs over HTTP / JSON
                                    |
+-----------------------------------v-----------------------------------+
|                        APPLICATION SERVER                             |
|               FastAPI REST Framework (Port 8000)                      |
|   - Pydantic Schema Validation & Error Interceptors                   |
|   - Passlib Bcrypt Password Hashing & PyJWT Session Tokens            |
|   - CORS Middleware & Rate-limiting Safe Endpoints                    |
+-----------------------------------+-----------------------------------+
                                    |
         +--------------------------+--------------------------+
         |                          |                          |
+--------v--------+       +---------v--------+       +---------v--------+
|    TEXT NLP     |       |   VISION HUD     |       |  VOCAL PROSODY   |
|   EMOTION SVC   |       |   FACIAL SVC     |       |   AUDIO SVC      |
| Contextual      |       | OpenCV Haar      |       | Autocorrelation  |
| Affect Lexicon  |       | Cascade Face ROI |       | F0 Pitch Est.    |
| & Transformers  |       | + PyTorch MiniNet|       | + RMS Loudness   |
+--------+--------+       +---------+--------+       +---------+--------+
         |                          |                          |
         +--------------------------+--------------------------+
                                    |
+-----------------------------------v-----------------------------------+
|                     MULTIMODAL DECISION FUSION                        |
|   P_fused(e) = w_text * P_text(e) + w_face * P_face(e)                |
+-----------------------------------+-----------------------------------+
                                    |
+-----------------------------------v-----------------------------------+
|                         DATA PERSISTENCE                              |
|           SQLite Database (SQLAlchemy Async / Sync ORM)               |
|   - Users Table (Hashed passwords, roles, timestamps)                 |
|   - EmotionAnalyses Table (Scalar metrics, top-3 JSON, CSV export)    |
+-----------------------------------------------------------------------+
```

---

## 5. Technology Stack

### Frontend
- **Framework**: React.js (Vite build engine)
- **Styling**: Tailwind CSS with custom glassmorphism and radiant dark theme
- **Visual Analytics**: Recharts (Donut, Area, and Bar charts)
- **Icons**: Lucide React
- **Audio/Video APIs**: HTML5 `getUserMedia`, `MediaRecorder`, and Web Audio API `AudioContext`

### Backend
- **Language**: Python 3.11
- **Framework**: FastAPI (Asynchronous high-performance REST engine)
- **Validation**: Pydantic v2
- **Authentication**: PyJWT (HMAC-SHA256) and Passlib (Bcrypt)
- **ORM / Database**: SQLAlchemy with SQLite
- **Computer Vision**: OpenCV (`cv2`) Haar Feature-based Cascades
- **Deep Learning**: PyTorch (`torch`, `torchvision`, `nn.Module`)
- **Acoustic Processing**: SciPy (`scipy.io.wavfile`), NumPy FFT

---

## 6. Machine Learning Models & Methodology

### A. Text Emotion NLP Engine
- **Vocabulary & Emotion Taxonomy**: Maps tokens into 6 discrete affective classes: *Happiness, Sadness, Anger, Fear, Surprise, Neutral*.
- **Contextual Processing**: 
  - Detects negation particles (*not, never, barely*) within a 2-word lookback window to invert sentiment polarity.
  - Multiplies emotional weights by intensifier factors (e.g. *extremely* $\times 1.8$, *absolutely* $\times 1.9$).
- **Calibration**: Temperature-scaled Softmax ($\tau = 1.3$) converts raw logits into continuous probabilities summing to 1.0.

### B. Facial Emotion Recognition (FER)
- **Face Localization**: OpenCV `haarcascade_frontalface_default.xml` extracts the face ROI.
- **Action Unit Analysis**:
  - `haarcascade_smile.xml` detects smile curvature and zygomaticus major contraction.
  - Brow furrow texture variance detects corrugator supercilii contraction (indicative of anger/distress).
  - Open mouth dark pixel ratio and eye aspect ratio detect surprise and fear.
- **Deep Neural Representation**: Grayscale $48 \times 48$ normalized face ROI passes through `MiniFERNet` (4 convolutional layers with batch normalization and dropout).
- **HUD Annotation**: OpenCV annotates bounding box corners and confidence banners directly onto the preview frame.

### C. Vocal Prosody Analyzer
- **Decoupled Architecture**: Speech content is explicitly isolated from vocal tone to eliminate linguistic bias.
- **Feature Extraction**:
  - **Fundamental Frequency ($F_0$)**: Harmonic autocorrelation across human vocal ranges (75 Hz to 450 Hz).
  - **Intensity**: Root Mean Square (RMS) energy contour.
  - **Pitch Variance & Jitter**: Standard deviation of vocal frequency over time.
  - **Zero-Crossing Rate (ZCR)**: Frequency of sign transitions indicating unvoiced/frictional consonants.

---

## 7. API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new student user with Bcrypt password hashing | No |
| `POST` | `/api/auth/login` | Authenticate credentials and return JWT bearer token | No |
| `GET` | `/api/auth/me` | Fetch profile information for authenticated user | Yes |
| `POST` | `/api/emotions/text` | Classify sentence; returns primary emotion, top 3, advice | Optional |
| `POST` | `/api/emotions/face` | Classify webcam or photo base64; returns HUD and scores | Optional |
| `POST` | `/api/emotions/voice` | Classify audio file/recording; extracts prosody metrics | Optional |
| `POST` | `/api/emotions/multimodal`| Fuses text and facial predictions via weighted ensemble | Optional |
| `GET` | `/api/history` | Retrieve paginated history with modality/emotion filters | Optional |
| `DELETE`| `/api/history/{id}` | Delete specific analysis record | Optional |
| `DELETE`| `/api/history` | Clear all analysis records | Optional |
| `GET` | `/api/history/export/csv` | Download complete history report as CSV spreadsheet | Optional |
| `GET` | `/api/analytics` | Compute counts, distributions, confidence averages, trends | Optional |
| `GET` | `/api/health` | Service health status and loaded model verification matrix | No |

---

## 8. Installation & Quickstart Guide

### Prerequisites
- **Python**: 3.10 or 3.11
- **Node.js**: v18+ and `npm`

### Step 1: Clone or Navigate to Project
```bash
cd ai-emotion-recognition
```

### Step 2: Start the Backend (FastAPI)
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The backend will automatically:
- Initialize the SQLite database schema (`emotion_system.db`).
- Seed initial demonstration presentation records.
- Load OpenCV face cascades and PyTorch neural weights.
- Serve interactive Swagger API docs at `http://localhost:8000/docs`.

### Step 3: Start the Frontend (React + Vite)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at **`http://localhost:5173/`**.

---

## 9. Demonstration & Evaluator Credentials
For quick evaluation during college presentations, the system includes pre-configured demo credentials:
- **Username**: `demouser`
- **Password**: `demo1234`
- Or click the **"Autofill Demo"** button on the Sign-In modal to log in with 1 click.
- Guest testing without logging in is also fully supported!

---

## 10. Ethical Safeguards & Disclaimers
1. **Non-Clinical Boundary**: Emotion recognition predictions are statistical estimates based on observable surface cues (linguistic words, facial muscle patterns, and vocal pitch). They **must never be presented as psychiatric or clinical mental health diagnoses**.
2. **Demographic & Cultural Bias Awareness**: Facial expression norms and vocal cadence vary widely across cultures, languages, ages, and neurodivergent individuals. Model outputs should always be contextualized.
3. **Biometric Privacy**: The system avoids persisting raw webcam photos or voice recordings to protect student and subject privacy.
