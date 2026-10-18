"""
Pydantic schemas for request validation and API responses.
Enforces strict input validation and clean typed contracts.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field


# ==================== User & Auth Schemas ====================

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, description="Password (at least 6 characters)")
    full_name: Optional[str] = Field(default="", max_length=100)


class UserLogin(BaseModel):
    username: str = Field(..., description="Username or email")
    password: str = Field(..., description="Account password")


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = ""
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    username: Optional[str] = None


# ==================== Emotion Analysis Common Schemas ====================

class EmotionScore(BaseModel):
    emotion: str
    score: float
    percentage: float


class EmotionBaseResult(BaseModel):
    primary_emotion: str
    confidence: float
    confidence_percentage: float
    top_predictions: List[EmotionScore]
    non_clinical_response: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ==================== Text Emotion Schemas ====================

class TextEmotionRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, description="User input text to analyze")


class TextEmotionResponse(EmotionBaseResult):
    modality: str = "text"
    text_snippet: str
    word_count: int


# ==================== Face Emotion Schemas ====================

class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int


class FaceEmotionRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded JPEG/PNG image from webcam or upload")


class FaceEmotionResponse(BaseModel):
    modality: str = "face"
    face_detected: bool
    primary_emotion: Optional[str] = None
    confidence: Optional[float] = None
    confidence_percentage: Optional[float] = None
    top_predictions: Optional[List[EmotionScore]] = None
    bounding_box: Optional[BoundingBox] = None
    processed_image_base64: Optional[str] = None
    non_clinical_response: Optional[str] = None
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ==================== Voice Emotion Schemas ====================

class VoiceEmotionResponse(EmotionBaseResult):
    modality: str = "voice"
    audio_duration_seconds: float
    acoustic_features: Dict[str, Any]
    transcription: Optional[str] = None


# ==================== Multimodal Emotion Schemas ====================

class MultimodalEmotionRequest(BaseModel):
    text: Optional[str] = None
    image_base64: Optional[str] = None
    # Weights for fusion if customized
    text_weight: Optional[float] = 0.4
    face_weight: Optional[float] = 0.4
    voice_weight: Optional[float] = 0.2


class ModalitySummary(BaseModel):
    modality: str
    detected_emotion: str
    confidence: float


class MultimodalEmotionResponse(EmotionBaseResult):
    modality: str = "multimodal"
    contributing_modalities: List[ModalitySummary]
    fusion_weights_used: Dict[str, float]


# ==================== History & Analytics Schemas ====================

class HistoryItemResponse(BaseModel):
    id: int
    modality: str
    input_preview: Optional[str] = None
    primary_emotion: str
    confidence: float
    top_predictions: List[EmotionScore]
    non_clinical_response: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class HistoryListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[HistoryItemResponse]


class EmotionDistributionItem(BaseModel):
    emotion: str
    count: int
    percentage: float


class ModalityDistributionItem(BaseModel):
    modality: str
    count: int
    percentage: float


class DailyTrendItem(BaseModel):
    date: str
    total: int
    emotions: Dict[str, int]


class AnalyticsSummaryResponse(BaseModel):
    total_analyses: int
    average_confidence: float
    top_emotion: Optional[str] = None
    emotion_distribution: List[EmotionDistributionItem]
    modality_distribution: List[ModalityDistributionItem]
    daily_trends: List[DailyTrendItem]


# ==================== Health & System Schemas ====================

class HealthResponse(BaseModel):
    status: str
    system: str
    version: str
    database_connected: bool
    models_loaded: Dict[str, bool]
    timestamp: datetime
