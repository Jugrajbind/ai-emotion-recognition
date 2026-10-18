"""
SQLAlchemy ORM models for User accounts and Emotion Analysis history.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    """User account entity with hashed password credentials."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    analyses = relationship("EmotionAnalysis", back_populates="user", cascade="all, delete-orphan")


class EmotionAnalysis(Base):
    """
    Record of an individual emotion recognition session.
    Stores metadata, predicted emotion, confidence, top 3 ranking,
    and supportive non-clinical responses.
    """
    __tablename__ = "emotion_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Modality: 'text', 'face', 'voice', or 'multimodal'
    modality = Column(String(20), nullable=False, index=True)
    
    # Input summary (text snippet or filename / camera capture descriptor)
    input_preview = Column(String(255), nullable=True)
    
    # Primary classification results
    primary_emotion = Column(String(50), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    
    # JSON string containing top predictions [{emotion: str, score: float}, ...]
    top_predictions = Column(Text, nullable=False)
    
    # Non-clinical supportive reflection
    non_clinical_response = Column(Text, nullable=True)
    
    # Optional metadata/metrics (e.g. pitch, energy, facial bounding box) in JSON
    extra_metrics = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationship back to User
    user = relationship("User", back_populates="analyses")
