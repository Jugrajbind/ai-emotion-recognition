# AI EMOTION RECOGNITION SYSTEM
## Academic Project Report & Presentation Defense Dossier
### Bachelor of Technology (B.Tech) in Computer Science & Information Technology

---

### Candidate / Evaluation Summary
- **Project Title**: Multimodal Human Emotion Recognition System
- **Domain**: Artificial Intelligence, Computer Vision, Natural Language Processing, Affective Computing
- **Core Technologies**: React.js, Tailwind CSS, Recharts, Python 3.11, FastAPI, OpenCV, PyTorch, SQLite

---

## CHAPTER 1: INTRODUCTION & ABSTRACT

### 1.1 Abstract
Affective computing bridges the psychological gap between human emotional expression and automated computational intelligence. In this project, we design, implement, and validate an end-to-end multimodal emotion recognition system capable of identifying human emotional states across text, facial video frames, and speech audio. 

The system classifies inputs into six fundamental emotion categories: **Happiness, Sadness, Anger, Fear, Surprise, and Neutral**. The architecture incorporates:
1. Contextual Natural Language Processing for typed utterances.
2. OpenCV computer vision and deep convolutional feature extraction for facial expressions.
3. Acoustic prosodic analysis for vocal pitch and energy contours.
4. Decision-level weighted late fusion synthesizing cross-modal predictions.

Real-time analytical dashboards visualize class distributions, temporal trends, and confidence scores, providing an enterprise-grade solution suitable for Human-Computer Interaction (HCI) research and student welfare monitoring.

### 1.2 Problem Statement
Traditional human-computer interfaces treat user interaction as purely mechanical transactions. Even when sentiment tools are deployed, they are typically constrained to single-modal, binary polarity (positive vs. negative). Such systems fail to distinguish nuanced affective states (e.g. distinguishing sorrow from anxiety or excitement from anger). Moreover, facial recognition solutions often suffer from poor calibration, severe demographic biases, and invasive storage of biometric media.

### 1.3 Project Objectives
1. Implement real-time text emotion classification with contextual negation and intensity scaling.
2. Develop a computer vision facial expression detector using OpenCV Haar Cascades and deep neural scoring.
3. Construct an acoustic prosody module measuring pitch ($F_0$), loudness, and cadence decoupled from text transcription.
4. Build a late-decision fusion algorithm enabling multi-sensory cross-verification.
5. Provide continuous, temperature-calibrated softmax confidence probabilities summing to 100%.
6. Implement user authentication, session security, and SQLite database persistence.
7. Integrate interactive Recharts visual analytics and automated CSV export capabilities.
8. Enforce ethical non-clinical disclaimers and privacy-by-design principles (zero storage of raw photos/audio).

---

## CHAPTER 2: LITERATURE SURVEY & EXISTING SYSTEMS

| System Type | Approach | Limitations | Our Proposed Multimodal Solution |
|---|---|---|---|
| Traditional Sentiment Analysis | Lexicon lookups (VADER, SentiWordNet) | Binary polarity only; fails on complex emotions | 6 discrete emotion categories with top-3 ranking |
| Vision-Only Facial Recognition | Standard CNN on FER-2013 | Sensitive to lighting; cannot cross-verify against speech | Multimodal decision fusion cross-checking facial HUD with text/speech |
| Commercial Emotion APIs | Cloud black-box web services | Expensive, high latency, requires third-party data transmission | 100% local processing; zero third-party data exposure |
| Biometric Surveillance | Continuous video recording | Severe privacy violations | Ephemeral in-memory frame processing with zero image persistence |

---

## CHAPTER 3: SYSTEM ARCHITECTURE & METHODOLOGY

```
+-------------------------------------------------------------------------------+
|                             CLIENT WORKSPACE (React 18)                       |
|   - Real-time Webcam Canvas HUD          - Text Analysis Interactive Prompt   |
|   - Web Audio API Live Spectrum          - Multimodal Decision Fusion Sliders |
|   - Recharts Visual Analytics            - CSV Report Exporter                |
+---------------------------------------+---------------------------------------+
                                        | (REST / JSON over Port 8000)
+---------------------------------------v---------------------------------------+
|                       BACKEND ENGINE (FastAPI + Python 3.11)                  |
|   - Pydantic Schema Validation           - PyJWT Bearer Authentication        |
|   - Passlib Bcrypt Hashing               - CORS Middleware                    |
+-------------------+-------------------+-------------------+-------------------+
                    |                   |                   |
+-------------------v---+   +-----------v-------+   +-------v-----------+
|    TEXT NLP PIPELINE  |   |   VISION HUD FER  |   |  VOCAL PROSODY    |
| - 6-Class Taxonomy    |   | - Haar Face Det.  |   | - Autocorrelation |
| - Negation Inversion  |   | - Action Units    |   | - F0 Pitch (Hz)   |
| - Intensifier Scaling |   | - PyTorch MiniNet |   | - RMS Energy      |
+-------------------+---+   +-----------+-------+   +-------+-----------+
                    |                   |                   |
                    +-------------------+-------------------+
                                        |
+---------------------------------------v---------------------------------------+
|                    DECISION FUSION & CALIBRATION ENGINE                       |
|          Softmax Temperature Scaling: P(e) = exp(z/T) / sum(exp(z/T))         |
|          Late Fusion: P_fused = w_text * P_text + w_face * P_face             |
+---------------------------------------+---------------------------------------+
                                        |
+---------------------------------------v---------------------------------------+
|                               PERSISTENCE LAYER                               |
|                  SQLite Database (SQLAlchemy ORM Model)                       |
|   - User Accounts Table                  - Emotion Analyses History Table     |
+-------------------------------------------------------------------------------+
```

---

## CHAPTER 4: MACHINE LEARNING & MATHEMATICAL FORMULATION

### 4.1 Continuous Softmax Probability Calibration
To prevent uncalibrated, arbitrary confidence scores, logit values $z_i$ across classes $i \in \{1, \dots, K\}$ are normalized using temperature-scaled Softmax:

$$P(Y = i \mid \mathbf{x}) = \frac{\exp(z_i / \tau)}{\sum_{j=1}^{K} \exp(z_j / \tau)}$$

Where:
- $K = 6$ (Happiness, Sadness, Anger, Fear, Surprise, Neutral)
- $\tau = 1.25$ denotes the temperature parameter smoothing out extreme overconfidence.
- Mathematically guarantees $\sum_{i=1}^K P(Y = i) = 1.0$ (100%).

### 4.2 Facial Action Unit (AU) Feature Formulation
OpenCV facial detection extracts the region bounding box $(x, y, w, h)$. Within this region:
1. **Zygomaticus Major (Smile AU 12)**: Detected via `haarcascade_smile.xml` and mouth corner gradient curvature.
2. **Corrugator Supercilii (Brow Furrow AU 4)**: Quantified through the variance of the pixel intensity gradient across the glabella region:

$$\sigma_{brow}^2 = \frac{1}{N} \sum_{i=1}^N (I_i - \mu)^2$$

High variance ($\sigma_{brow}^2 > 1100$) indicates brow tension characteristic of anger or distress.

### 4.3 Acoustic Prosody Extraction
Vocal emotion relies on fundamental frequency ($F_0$) calculated through harmonic autocorrelation of audio window $s[n]$:

$$R_{ss}[k] = \sum_{n=0}^{N-k-1} s[n] s[n+k]$$

$$F_0 = \frac{f_s}{k^*}, \quad k^* = \arg\max_{k \in [k_{min}, k_{max}]} R_{ss}[k]$$

Where $f_s$ is the audio sampling rate and $[k_{min}, k_{max}]$ corresponds to human vocal bounds (75 Hz to 450 Hz).

---

## CHAPTER 5: ETHICAL CONSIDERATIONS & NON-CLINICAL SAFEGUARDS

1. **Non-Diagnostic Nature**: Emotion recognition models estimate surface affective cues. They do not constitute psychological, psychiatric, or neurological evaluations.
2. **Cultural & Demographic Variability**: Emotional expression is non-universal; cultural background, individual personality, and neurodiversity alter vocal cadence and facial gestures.
3. **Biometric Privacy by Design**: The system enforces ephemeral processing. Raw webcam frames and audio buffers are discarded immediately after feature extraction.

---

## CHAPTER 6: ORAL DEFENSE / VIVA VOCE QUESTIONS & ANSWERS

**Q1: How does your system differentiate between sentiment analysis and emotion recognition?**  
*Answer:* Sentiment analysis measures 1D polarity (Positive, Negative, Neutral). Emotion recognition classifies discrete emotional categories based on psychological affective taxonomy (Ekman's 6 basic emotions), providing nuanced psychological insight.

**Q2: What is the benefit of multimodal late decision fusion over early feature fusion?**  
*Answer:* Early feature fusion concatenates raw heterogeneous features (text embeddings and image pixels), which often leads to the "curse of dimensionality" and requires synchronized inputs. Late decision fusion allows each specialized model (NLP, CNN, Prosody) to independently compute probabilistic predictions, which are then combined using reliability weights. This makes the system resilient if one modality (e.g. webcam) is temporarily absent.

**Q3: How did you ensure user passwords are secure in the database?**  
*Answer:* Passwords are never stored in plaintext. They are salted and hashed using the Bcrypt adaptive hashing algorithm via Passlib, which incorporates work factor expansion to prevent rainbow table attacks.

**Q4: How does the system handle "No Face Detected" scenarios?**  
*Answer:* When the OpenCV Haar Cascade detects zero candidate face bounding boxes in the input frame, the service immediately flags `face_detected: false`, does not pollute the database with false classifications, and returns an actionable guidance message advising the user to adjust room lighting and face the camera directly.
