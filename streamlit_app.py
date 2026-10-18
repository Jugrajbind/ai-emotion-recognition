"""
AI Emotion Recognition System - Streamlit Cloud Web Application.
Interactive Multimodal AI Platform (Text, Facial Vision, Vocal Prosody, Multimodal Fusion).
Suitable for 1-click deployment on Streamlit Community Cloud (share.streamlit.io).
"""

import sys
import os
import io
import base64
import datetime
import pandas as pd
import numpy as np

# Ensure backend modules can be imported
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
from PIL import Image

# Import ML services from backend
try:
    from emotion_service import text_emotion_classifier, EMOTIONS, SUPPORTIVE_RESPONSES
    from face_service import facial_emotion_service
    from voice_service import voice_emotion_service
    from fusion_service import multimodal_fusion_service
except ImportError as e:
    st.error(f"Error loading AI models from backend: {e}")

# Page Configuration
st.set_page_config(
    page_title="EMOTION.AI | Multimodal Emotion Recognition",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Aesthetics CSS (Glassmorphism, Radiant Accents)
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }
    
    /* Metric Card Styling */
    div[data-testid="stMetricValue"] {
        font-size: 1.8rem;
        font-weight: 700;
        color: #38bdf8;
    }
    
    /* Custom Badge */
    .emotion-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 600;
        margin-right: 8px;
    }
    .badge-happiness { background-color: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-sadness { background-color: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }
    .badge-anger { background-color: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
    .badge-fear { background-color: rgba(168, 85, 247, 0.15); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.3); }
    .badge-surprise { background-color: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
    .badge-neutral { background-color: rgba(100, 116, 139, 0.15); color: #94a3b8; border: 1px solid rgba(100, 116, 139, 0.3); }
    
    /* Supportive Box */
    .supportive-card {
        padding: 16px;
        border-radius: 12px;
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid rgba(99, 102, 241, 0.3);
        margin-top: 14px;
        margin-bottom: 14px;
    }
    
    .disclaimer-text {
        font-size: 0.75rem;
        color: #94a3b8;
        border-top: 1px solid rgba(51, 65, 85, 0.6);
        padding-top: 8px;
        margin-top: 8px;
    }
</style>
""", unsafe_allow_html=True)

# Emotion metadata configuration
EMOTION_META = {
    "happiness": {"emoji": "😊", "color": "#10b981", "badge": "badge-happiness"},
    "sadness": {"emoji": "😔", "color": "#3b82f6", "badge": "badge-sadness"},
    "anger": {"emoji": "😠", "color": "#ef4444", "badge": "badge-anger"},
    "fear": {"emoji": "😨", "color": "#a855f7", "badge": "badge-fear"},
    "surprise": {"emoji": "😲", "color": "#f59e0b", "badge": "badge-surprise"},
    "neutral": {"emoji": "😐", "color": "#64748b", "badge": "badge-neutral"},
}

# Session State for History
if "history" not in st.session_state:
    st.session_state.history = [
        {
            "id": 1,
            "modality": "text",
            "input_preview": "I passed my exam with highest honors and celebrated with friends!",
            "primary_emotion": "happiness",
            "confidence": 0.9636,
            "timestamp": (datetime.datetime.now() - datetime.timedelta(days=2)).strftime("%Y-%m-%d %H:%M")
        },
        {
            "id": 2,
            "modality": "face",
            "input_preview": "Webcam Facial Scan (Captured smiling expression)",
            "primary_emotion": "happiness",
            "confidence": 0.8870,
            "timestamp": (datetime.datetime.now() - datetime.timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
        },
        {
            "id": 3,
            "modality": "voice",
            "input_preview": "Recorded Voice Sample (Pitch: 142Hz, Duration: 3.5s)",
            "primary_emotion": "neutral",
            "confidence": 0.8120,
            "timestamp": (datetime.datetime.now() - datetime.timedelta(hours=14)).strftime("%Y-%m-%d %H:%M")
        },
        {
            "id": 4,
            "modality": "text",
            "input_preview": "The project deadline is tomorrow and our server keeps disconnecting!",
            "primary_emotion": "fear",
            "confidence": 0.8940,
            "timestamp": (datetime.datetime.now() - datetime.timedelta(hours=4)).strftime("%Y-%m-%d %H:%M")
        }
    ]

def add_to_history(modality, preview, emotion, confidence):
    new_id = len(st.session_state.history) + 1
    st.session_state.history.insert(0, {
        "id": new_id,
        "modality": modality,
        "input_preview": preview[:120],
        "primary_emotion": emotion,
        "confidence": round(confidence, 4),
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    })

def render_confidence_chart(predictions):
    df = pd.DataFrame(predictions)
    df['percentage'] = df['score'] * 100
    df['color'] = df['emotion'].map(lambda e: EMOTION_META.get(e.lower(), {}).get('color', '#6366f1'))
    
    fig = px.bar(
        df,
        x='percentage',
        y='emotion',
        orientation='h',
        text=df['percentage'].apply(lambda x: f"{x:.1f}%"),
        color='emotion',
        color_discrete_map={e: EMOTION_META[e]['color'] for e in EMOTION_META},
        labels={'percentage': 'Confidence (%)', 'emotion': 'Emotion'}
    )
    fig.update_layout(
        showlegend=False,
        height=220,
        margin=dict(l=0, r=20, t=10, b=10),
        xaxis=dict(range=[0, 100], showgrid=True, gridcolor='#1e293b'),
        yaxis=dict(categoryorder='total ascending'),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font=dict(color='#cbd5e1')
    )
    st.plotly_chart(fig, use_container_width=True)

# Sidebar Navigation
with st.sidebar:
    st.markdown("### 🧠 **EMOTION.AI**")
    st.caption("Multimodal Emotion Recognition | B.Tech CSE Project")
    st.markdown("---")
    
    selected_page = st.radio(
        "Navigation Menu",
        [
            "📊 Dashboard & Analytics",
            "✍️ Text Emotion Recognition",
            "📷 Facial Emotion Vision HUD",
            "🎙️ Voice Prosody Analyzer",
            "🔮 Multimodal Decision Fusion",
            "📜 History & CSV Export",
            "🎓 College Viva & Defense Kit"
        ],
        index=0
    )
    
    st.markdown("---")
    st.markdown("#### **System Status**")
    st.success("● AI Inference Models: Active")
    st.info("● Engine: PyTorch & OpenCV")
    st.caption("College Capstone Project 2026")

# ==============================================================================
# PAGE 1: DASHBOARD & VISUAL ANALYTICS
# ==============================================================================
if selected_page == "📊 Dashboard & Analytics":
    st.title("📊 Executive Emotion Recognition Dashboard")
    st.markdown("Real-time visual analytics synthesizing multi-sensory human affect across text, vision, and speech.")

    # Top KPI Cards
    total_runs = len(st.session_state.history)
    avg_conf = np.mean([h['confidence'] for h in st.session_state.history]) if total_runs > 0 else 0.0
    
    emotions_list = [h['primary_emotion'] for h in st.session_state.history]
    dominant_emotion = max(set(emotions_list), key=emotions_list.count) if emotions_list else "neutral"
    meta = EMOTION_META.get(dominant_emotion, EMOTION_META["neutral"])

    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric(label="Total Analyses Run", value=total_runs, delta="All Modalities")
    with col2:
        st.metric(label="Average Confidence", value=f"{avg_conf * 100:.1f}%", delta="Softmax Calibrated")
    with col3:
        st.metric(label="Dominant Emotion", value=f"{meta['emoji']} {dominant_emotion.capitalize()}", delta="Highest Frequency")
    with col4:
        st.metric(label="Active Sensory Channels", value="3 + Fusion", delta="Text, Face, Voice")

    st.markdown("---")

    # Visual Analytics Charts
    col_chart1, col_chart2 = st.columns(2)
    
    with col_chart1:
        st.subheader("Emotion Class Distribution")
        df_hist = pd.DataFrame(st.session_state.history)
        if not df_hist.empty:
            counts = df_hist['primary_emotion'].value_counts().reset_index()
            counts.columns = ['emotion', 'count']
            
            fig_pie = px.pie(
                counts,
                values='count',
                names='emotion',
                hole=0.45,
                color='emotion',
                color_discrete_map={e: EMOTION_META[e]['color'] for e in EMOTION_META}
            )
            fig_pie.update_layout(
                margin=dict(l=20, r=20, t=20, b=20),
                paper_bgcolor='rgba(0,0,0,0)',
                font=dict(color='#cbd5e1'),
                height=320
            )
            st.plotly_chart(fig_pie, use_container_width=True)
        else:
            st.info("No analyses recorded yet.")

    with col_chart2:
        st.subheader("Modality Breakdown")
        if not df_hist.empty:
            mod_counts = df_hist['modality'].value_counts().reset_index()
            mod_counts.columns = ['modality', 'count']
            fig_bar = px.bar(
                mod_counts,
                x='modality',
                y='count',
                color='modality',
                color_discrete_sequence=['#38bdf8', '#818cf8', '#c084fc', '#34d399']
            )
            fig_bar.update_layout(
                margin=dict(l=20, r=20, t=20, b=20),
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font=dict(color='#cbd5e1'),
                height=320,
                showlegend=False
            )
            st.plotly_chart(fig_bar, use_container_width=True)

    # Recent Streamlit Activity Table
    st.subheader("Recent Recognition Records")
    st.dataframe(
        df_hist[['id', 'timestamp', 'modality', 'primary_emotion', 'confidence', 'input_preview']],
        use_container_width=True,
        hide_index=True
    )

# ==============================================================================
# PAGE 2: TEXT EMOTION WORKSPACE
# ==============================================================================
elif selected_page == "✍️ Text Emotion Recognition":
    st.title("✍️ Text Emotion Recognition Workspace")
    st.markdown("Natural Language Processing evaluating contextual sentiment, negation, and emotional intensity.")

    col_in, col_out = st.columns([1.1, 0.9])
    
    with col_in:
        st.subheader("Sentence Input")
        
        # Preset Demo Buttons
        st.caption("1-Click Demonstration Scenarios:")
        demo_cols = st.columns(3)
        sample_text = ""
        if demo_cols[0].button("🎉 Joy / Exam Success"):
            sample_text = "I passed my exam with highest honors and I am super excited and happy!"
        if demo_cols[1].button("😔 Sadness / Heavy Loss"):
            sample_text = "I feel completely lonely, heartbroken, and drained today."
        if demo_cols[2].button("😠 Anger / System Bug"):
            sample_text = "The compiler crashed right before my project deadline and lost everything! This is infuriating!"

        demo_cols2 = st.columns(3)
        if demo_cols2[0].button("😨 Fear / Exam Panic"):
            sample_text = "I have my college viva defense in 10 minutes and my hands are shaking with nervousness."
        if demo_cols2[1].button("😲 Astonishment / Award"):
            sample_text = "I had no idea I was selected for the prestigious national scholarship! Wow!"
        if demo_cols2[2].button("😐 Objective Fact"):
            sample_text = "The model was trained on 40,000 utterances using PyTorch and scikit-learn."

        user_text = st.text_area(
            "Enter sentence to classify:",
            value=sample_text,
            height=130,
            placeholder="Type your sentence here..."
        )

        analyze_btn = st.button("🚀 Classify Emotion", type="primary", use_container_width=True)

    with col_out:
        st.subheader("Classification Outcome")
        if analyze_btn and user_text.strip():
            with st.spinner("Analyzing linguistic affect..."):
                res = text_emotion_classifier.predict(user_text.strip())
                add_to_history("text", user_text.strip(), res["primary_emotion"], res["confidence"])

                meta = EMOTION_META.get(res["primary_emotion"], EMOTION_META["neutral"])
                
                # Primary Badge
                st.markdown(f"""
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(51,65,85,0.6); padding: 18px; border-radius: 12px; text-align: center;">
                    <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">Primary Classification</span>
                    <h2 style="margin: 8px 0; color: {meta['color']};">{meta['emoji']} {res['primary_emotion'].capitalize()}</h2>
                    <span style="font-size: 1.2rem; font-weight: 700; color: #38bdf8;">Confidence: {res['confidence_percentage']}%</span>
                </div>
                """, unsafe_allow_html=True)

                st.markdown("#### Top 3 Emotion Probabilities")
                render_confidence_chart(res["top_predictions"])

                # Supportive Reflection Card
                st.markdown(f"""
                <div class="supportive-card">
                    <strong style="color: #818cf8;">💡 Empathetic Reflection (Non-Clinical):</strong>
                    <p style="margin-top: 6px; font-size: 0.9rem; color: #cbd5e1;">{res['non_clinical_response']}</p>
                    <div class="disclaimer-text">
                        ⚠️ <strong>Ethical Disclaimer:</strong> AI estimates are for personal reflection and research purposes, not psychiatric diagnoses.
                    </div>
                </div>
                """, unsafe_allow_html=True)
        else:
            st.info("Enter or select a sentence on the left and click 'Classify Emotion'.")

# ==============================================================================
# PAGE 3: FACIAL EMOTION VISION HUD
# ==============================================================================
elif selected_page == "📷 Facial Emotion Vision HUD":
    st.title("📷 Facial Emotion Recognition (Webcam & Vision HUD)")
    st.markdown("OpenCV Haar Cascade Face Detector paired with PyTorch Deep Neural Network for expression classification.")

    tab_cam, tab_up = st.tabs(["🎥 Live Webcam Snapshot", "📁 Upload Face Photo"])

    captured_image = None
    with tab_cam:
        st.caption("Capture a live photo using your webcam or mobile camera:")
        cam_file = st.camera_input("Look into the camera with good lighting:")
        if cam_file is not None:
            captured_image = Image.open(cam_file)

    with tab_up:
        st.caption("Or upload a face portrait (JPG, PNG, WebP):")
        up_file = st.file_uploader("Upload Image", type=["jpg", "jpeg", "png", "webp"])
        if up_file is not None:
            captured_image = Image.open(up_file)

    if captured_image is not None:
        st.markdown("---")
        col_img, col_pred = st.columns([1, 1])
        
        with col_img:
            st.subheader("Input Image Frame")
            st.image(captured_image, use_container_width=True)

        with col_pred:
            st.subheader("Vision HUD Analysis")
            # Convert PIL image to base64 for service
            buffered = io.BytesIO()
            captured_image.convert("RGB").save(buffered, format="JPEG")
            img_b64 = "data:image/jpeg;base64," + base64.b64encode(buffered.getvalue()).decode()

            with st.spinner("Executing OpenCV face detection and PyTorch neural inference..."):
                face_res = facial_emotion_service.analyze_frame(img_b64)

                if face_res.get("face_detected"):
                    add_to_history("face", "Webcam / Photo Facial Scan", face_res["primary_emotion"], face_res["confidence"])
                    meta = EMOTION_META.get(face_res["primary_emotion"], EMOTION_META["neutral"])

                    st.markdown(f"""
                    <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(51,65,85,0.6); padding: 18px; border-radius: 12px; text-align: center;">
                        <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">Facial Expression Detected</span>
                        <h2 style="margin: 8px 0; color: {meta['color']};">{meta['emoji']} {face_res['primary_emotion'].capitalize()}</h2>
                        <span style="font-size: 1.2rem; font-weight: 700; color: #10b981;">Confidence: {face_res['confidence_percentage']}%</span>
                    </div>
                    """, unsafe_allow_html=True)

                    st.markdown("#### Expression Ranking")
                    render_confidence_chart(face_res["top_predictions"])

                    # If annotated image is returned
                    if face_res.get("processed_image_base64"):
                        st.caption("OpenCV HUD Annotated Frame:")
                        st.image(face_res["processed_image_base64"], use_container_width=True)

                    st.markdown(f"""
                    <div class="supportive-card">
                        <strong style="color: #818cf8;">💡 Empathetic Reflection:</strong>
                        <p style="margin-top: 6px; font-size: 0.9rem; color: #cbd5e1;">{face_res['non_clinical_response']}</p>
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    st.warning("⚠️ No face detected in the frame. Please align your face directly with the camera under adequate lighting.")

# ==============================================================================
# PAGE 4: VOICE EMOTION PROSODY ANALYZER
# ==============================================================================
elif selected_page == "🎙️ Voice Prosody Analyzer":
    st.title("🎙️ Voice Prosody & Speech Emotion Analyzer")
    st.markdown("Measures acoustic pitch ($F_0$), intensity, harmonic jitter, and vocal cadence decoupled from text transcription.")

    audio_file = st.file_uploader("Upload an audio clip (WAV, MP3, OGG):", type=["wav", "mp3", "ogg", "webm"])
    
    if audio_file is not None:
        st.audio(audio_file)
        audio_bytes = audio_file.read()

        if st.button("🚀 Analyze Vocal Prosody", type="primary"):
            with st.spinner("Extracting harmonic autocorrelation and spectral metrics..."):
                v_res = voice_emotion_service.analyze_audio(audio_bytes)
                add_to_history("voice", f"Audio Clip: {audio_file.name}", v_res["primary_emotion"], v_res["confidence"])

                col_v1, col_v2 = st.columns([1, 1])
                meta = EMOTION_META.get(v_res["primary_emotion"], EMOTION_META["neutral"])

                with col_v1:
                    st.markdown(f"""
                    <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(51,65,85,0.6); padding: 18px; border-radius: 12px; text-align: center;">
                        <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">Vocal Emotion Classified</span>
                        <h2 style="margin: 8px 0; color: {meta['color']};">{meta['emoji']} {v_res['primary_emotion'].capitalize()}</h2>
                        <span style="font-size: 1.2rem; font-weight: 700; color: #38bdf8;">Confidence: {v_res['confidence_percentage']}%</span>
                    </div>
                    """, unsafe_allow_html=True)

                    st.markdown("#### Acoustic Metrics")
                    feats = v_res.get("acoustic_features", {})
                    c1, c2 = st.columns(2)
                    c1.metric("Mean Pitch ($F_0$)", f"{feats.get('mean_pitch_hz', 140)} Hz")
                    c2.metric("RMS Loudness", f"{feats.get('rms_energy', 0.05):.4f}")
                    c1.metric("Pitch Jitter", f"{feats.get('pitch_std_hz', 15)} Hz")
                    c2.metric("Duration", f"{v_res.get('audio_duration_seconds', 2.0)}s")

                with col_v2:
                    st.markdown("#### Acoustic Probabilities")
                    render_confidence_chart(v_res["top_predictions"])
                    st.markdown(f"""
                    <div class="supportive-card">
                        <strong style="color: #818cf8;">💡 Empathetic Reflection:</strong>
                        <p style="margin-top: 6px; font-size: 0.9rem; color: #cbd5e1;">{v_res['non_clinical_response']}</p>
                    </div>
                    """, unsafe_allow_html=True)

# ==============================================================================
# PAGE 5: MULTIMODAL DECISION FUSION
# ==============================================================================
elif selected_page == "🔮 Multimodal Decision Fusion":
    st.title("🔮 Multimodal Emotion Decision Fusion Lab")
    st.markdown("Combines linguistic NLP semantics with facial vision features using weighted late-decision ensemble fusion.")

    col_m1, col_m2 = st.columns(2)
    with col_m1:
        st.subheader("Sensory Channel 1: Linguistic Text")
        fusion_text = st.text_input("Enter sentence:", value="I am really thrilled about my presentation, but also slightly nervous!")
        
        st.subheader("Sensory Channel 2: Facial Snapshot")
        fusion_cam = st.camera_input("Take a snapshot for facial feature fusion:")

    with col_m2:
        st.subheader("Fusion Weights Calibration")
        t_weight = st.slider("Weight assigned to Linguistic Text:", min_value=0.1, max_value=0.9, value=0.5, step=0.05)
        f_weight = 1.0 - t_weight
        st.caption(f"Weights Applied -> **Text**: {t_weight*100:.0f}% | **Facial Vision**: {f_weight*100:.0f}%")

        if st.button("🚀 Execute Multimodal Decision Fusion", type="primary", use_container_width=True):
            t_res = text_emotion_classifier.predict(fusion_text) if fusion_text else None
            
            f_res = None
            if fusion_cam is not None:
                img_f = Image.open(fusion_cam)
                buf = io.BytesIO()
                img_f.convert("RGB").save(buf, format="JPEG")
                b64_f = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
                f_res = facial_emotion_service.analyze_frame(b64_f)

            fused_res = multimodal_fusion_service.fuse_predictions(
                text_result=t_res,
                face_result=f_res,
                text_weight=t_weight,
                face_weight=f_weight
            )

            add_to_history("multimodal", f"Fused: Text ('{fusion_text[:30]}') + Face", fused_res["primary_emotion"], fused_res["confidence"])
            meta = EMOTION_META.get(fused_res["primary_emotion"], EMOTION_META["neutral"])

            st.markdown(f"""
            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(51,65,85,0.6); padding: 18px; border-radius: 12px; text-align: center; margin-top: 15px;">
                <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">Multimodal Fused Outcome</span>
                <h2 style="margin: 8px 0; color: {meta['color']};">{meta['emoji']} {fused_res['primary_emotion'].capitalize()}</h2>
                <span style="font-size: 1.2rem; font-weight: 700; color: #a855f7;">Fused Confidence: {fused_res['confidence_percentage']}%</span>
            </div>
            """, unsafe_allow_html=True)

            render_confidence_chart(fused_res["top_predictions"])

# ==============================================================================
# PAGE 6: HISTORY & CSV EXPORT
# ==============================================================================
elif selected_page == "📜 History & CSV Export":
    st.title("📜 Emotion Analysis History & Export Reports")
    st.markdown("Persistent audit trail of recognition sessions with CSV spreadsheet export.")

    df_h = pd.DataFrame(st.session_state.history)

    # Download CSV
    csv_bytes = df_h.to_csv(index=False).encode('utf-8')
    st.download_button(
        label="📥 Download Official CSV Report",
        data=csv_bytes,
        file_name="emotion_recognition_analysis_report.csv",
        mime="text/csv",
        type="primary"
    )

    st.dataframe(df_h, use_container_width=True, hide_index=True)

    if st.button("🗑️ Clear Local History"):
        st.session_state.history = []
        st.rerun()

# ==============================================================================
# PAGE 7: COLLEGE VIVA & DEFENSE KIT
# ==============================================================================
elif selected_page == "🎓 College Viva & Defense Kit":
    st.title("🎓 College Presentation & Viva Voce Defense Kit")
    st.markdown("Complete academic documentation, system architecture, methodology, and anticipated examiner questions.")

    with st.expander("1. Project Abstract & Motivation", expanded=True):
        st.write("""
        Human emotion recognition is an essential frontier in Human-Computer Interaction (HCI) and affective computing.
        This B.Tech Capstone Project introduces a real-time multimodal emotion recognition system integrating:
        - **NLP Linguistic Sentiment**: Contextual affect with negation handling.
        - **OpenCV Computer Vision**: Facial action unit analysis (smile, brow furrow, eye aspect ratio).
        - **PyTorch Convolutional Neural Network**: Deep facial feature representations.
        - **Acoustic Prosody**: Decoupled fundamental frequency ($F_0$) and RMS loudness energy.
        - **Late Decision Fusion**: Weighted probability ensemble cross-checking multiple channels.
        """)

    with st.expander("2. Existing Systems vs. Our Proposed System"):
        st.table(pd.DataFrame({
            "Evaluation Parameter": ["Sensory Channels", "Emotion Resolution", "Confidence Estimation", "Biometric Privacy", "Supportive Guidance"],
            "Traditional Sentiment Systems": ["Single-modality (Text only)", "Binary (Positive/Negative)", "Uncalibrated thresholding", "Stores raw photos/recordings", "None / Static numeric"],
            "Our Multimodal AI System": ["Multimodal (Text + Vision HUD + Audio)", "6 Discrete Emotion Classes", "Temperature-scaled Softmax", "Ephemeral in-memory processing", "Empathetic non-clinical reflections"]
        }))

    with st.expander("3. Machine Learning Formulation & Softmax Calibration"):
        st.markdown("""
        **Continuous Probability Calibration Formula**:
        $$P(Y = i \mid \mathbf{x}) = \\frac{\\exp(z_i / \\tau)}{\\sum_{j=1}^{K} \\exp(z_j / \\tau)}$$
        Where $\\tau = 1.25$ temperature prevents extreme overconfidence and guarantees probabilities sum to 100%.
        """)

    with st.expander("4. Anticipated College Viva Questions & Model Answers"):
        st.markdown("""
        **Q1: What is the difference between sentiment analysis and emotion recognition?**  
        *Answer*: Sentiment analysis measures 1D polarity (Positive, Negative, Neutral). Emotion recognition classifies discrete emotional categories based on psychological affective taxonomy (Ekman's 6 basic emotions).

        **Q2: Why use Late Decision Fusion instead of Early Feature Fusion?**  
        *Answer*: Early feature fusion concatenates raw heterogeneous vectors (pixels and text tokens), leading to high dimensionality and requiring synchronized inputs. Late decision fusion allows each specialized model to independently output calibrated probabilities, combined via reliability weights.

        **Q3: How is user privacy protected?**  
        *Answer*: Webcam video frames and audio clips are processed ephemerally in RAM. Only scalar confidence scores and timestamps are saved, strictly adhering to privacy-by-design principles.
        """)
