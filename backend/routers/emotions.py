"""
Emotion Analysis API Router.
Handles Text, Face, Voice, and Multimodal recognition requests.
Saves sanitized metadata (no raw image or audio) to the analysis history.
"""

import json
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_optional_user
from emotion_service import text_emotion_classifier
from face_service import facial_emotion_service
from voice_service import voice_emotion_service
from fusion_service import multimodal_fusion_service

router = APIRouter(prefix="/api/emotions", tags=["Emotions"])


def _save_analysis_record(
    db: Session,
    user: Optional[models.User],
    modality: str,
    input_preview: str,
    primary_emotion: str,
    confidence: float,
    top_predictions: list,
    non_clinical_response: str,
    extra_metrics: Optional[dict] = None
) -> models.EmotionAnalysis:
    """Helper to persist analysis results without raw multimedia payloads."""
    record = models.EmotionAnalysis(
        user_id=user.id if user else None,
        modality=modality,
        input_preview=input_preview[:200] if input_preview else "",
        primary_emotion=primary_emotion,
        confidence=confidence,
        top_predictions=json.dumps(top_predictions),
        non_clinical_response=non_clinical_response,
        extra_metrics=json.dumps(extra_metrics) if extra_metrics else None
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/text", response_model=schemas.TextEmotionResponse)
def analyze_text_emotion(
    payload: schemas.TextEmotionRequest,
    db: Session = Depends(get_db),
    user: Optional[models.User] = Depends(get_optional_user)
):
    """
    Analyzes emotional sentiment from user-provided text.
    Returns primary emotion, top 3 ranking, confidence scores, and supportive guidance.
    """
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    result = text_emotion_classifier.predict(payload.text.strip())

    # Save to history
    _save_analysis_record(
        db=db,
        user=user,
        modality="text",
        input_preview=payload.text.strip(),
        primary_emotion=result["primary_emotion"],
        confidence=result["confidence"],
        top_predictions=result["top_predictions"],
        non_clinical_response=result["non_clinical_response"]
    )

    return result


@router.post("/face", response_model=schemas.FaceEmotionResponse)
def analyze_face_emotion(
    payload: schemas.FaceEmotionRequest,
    db: Session = Depends(get_db),
    user: Optional[models.User] = Depends(get_optional_user)
):
    """
    Analyzes human facial expressions from webcam frames or uploaded photos.
    Uses OpenCV face detection and deep action unit neural scoring.
    """
    if not payload.image_base64:
        raise HTTPException(status_code=400, detail="Image base64 data is required.")

    result = facial_emotion_service.analyze_frame(payload.image_base64)

    # If face was detected, save to history (sanitized, no raw photo stored)
    if result.get("face_detected"):
        _save_analysis_record(
            db=db,
            user=user,
            modality="face",
            input_preview="Webcam / Image Capture (Facial Expression)",
            primary_emotion=result["primary_emotion"],
            confidence=result["confidence"],
            top_predictions=result["top_predictions"],
            non_clinical_response=result["non_clinical_response"],
            extra_metrics={"bounding_box": result.get("bounding_box")}
        )

    return result


@router.post("/voice", response_model=schemas.VoiceEmotionResponse)
async def analyze_voice_emotion(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: Optional[models.User] = Depends(get_optional_user)
):
    """
    Analyzes vocal prosody (pitch, energy, speaking rate) from an audio recording.
    Audio can be in WAV, MP3, WebM, or OGG format.
    """
    # Restrict file size to 15MB
    audio_bytes = await file.read()
    if len(audio_bytes) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Audio file exceeds 15MB limit.")
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded audio file is empty.")

    result = voice_emotion_service.analyze_audio(audio_bytes)

    # Save to history
    _save_analysis_record(
        db=db,
        user=user,
        modality="voice",
        input_preview=f"Audio Clip: {file.filename or 'recorded_voice.wav'} ({result['audio_duration_seconds']}s)",
        primary_emotion=result["primary_emotion"],
        confidence=result["confidence"],
        top_predictions=result["top_predictions"],
        non_clinical_response=result["non_clinical_response"],
        extra_metrics=result["acoustic_features"]
    )

    return result


@router.post("/multimodal", response_model=schemas.MultimodalEmotionResponse)
def analyze_multimodal_emotion(
    payload: schemas.MultimodalEmotionRequest,
    db: Session = Depends(get_db),
    user: Optional[models.User] = Depends(get_optional_user)
):
    """
    Multimodal Decision Fusion.
    Fuses predictions across text and facial expression channels with configurable weights.
    """
    text_res = None
    if payload.text and payload.text.strip():
        text_res = text_emotion_classifier.predict(payload.text.strip())

    face_res = None
    if payload.image_base64:
        face_res = facial_emotion_service.analyze_frame(payload.image_base64)

    fused = multimodal_fusion_service.fuse_predictions(
        text_result=text_res,
        face_result=face_res,
        voice_result=None,
        text_weight=payload.text_weight or 0.5,
        face_weight=payload.face_weight or 0.5
    )

    # Save to history
    _save_analysis_record(
        db=db,
        user=user,
        modality="multimodal",
        input_preview=f"Multimodal Fusion: Text ('{payload.text[:40] if payload.text else 'None'}') + Facial HUD",
        primary_emotion=fused["primary_emotion"],
        confidence=fused["confidence"],
        top_predictions=fused["top_predictions"],
        non_clinical_response=fused["non_clinical_response"],
        extra_metrics={"weights": fused["fusion_weights_used"]}
    )

    return fused
