"""
Visual Analytics API Router.
Calculates statistical summaries, emotion distributions, modality breakdowns,
and temporal trends for visualization in Recharts.
"""

from collections import defaultdict
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models
import schemas
from auth import get_optional_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("", response_model=schemas.AnalyticsSummaryResponse)
def get_analytics_summary(
    db: Session = Depends(get_db),
    user: Optional[models.User] = Depends(get_optional_user)
):
    """
    Computes dashboard analytics:
    - Total analyses performed
    - Emotion distribution
    - Modality distribution
    - Average confidence
    - Daily temporal trends
    """
    query = db.query(models.EmotionAnalysis)
    if user:
        query = query.filter((models.EmotionAnalysis.user_id == user.id) | (models.EmotionAnalysis.user_id == None))

    all_records = query.order_by(models.EmotionAnalysis.created_at.asc()).all()
    total_count = len(all_records)

    if total_count == 0:
        return {
            "total_analyses": 0,
            "average_confidence": 0.0,
            "top_emotion": None,
            "emotion_distribution": [],
            "modality_distribution": [],
            "daily_trends": []
        }

    # 1. Average Confidence
    avg_conf = sum(r.confidence for r in all_records) / total_count

    # 2. Emotion Counts
    emotion_counts = defaultdict(int)
    for r in all_records:
        emotion_counts[r.primary_emotion] += 1

    sorted_emotions = sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True)
    top_emotion = sorted_emotions[0][0] if sorted_emotions else None

    emotion_distribution = [
        {
            "emotion": emotion,
            "count": count,
            "percentage": round((count / total_count) * 100, 1)
        }
        for emotion, count in sorted_emotions
    ]

    # 3. Modality Counts
    modality_counts = defaultdict(int)
    for r in all_records:
        modality_counts[r.modality] += 1

    modality_distribution = [
        {
            "modality": mod,
            "count": count,
            "percentage": round((count / total_count) * 100, 1)
        }
        for mod, count in modality_counts.items()
    ]

    # 4. Daily Trends (Group by date YYYY-MM-DD)
    date_groups = defaultdict(lambda: {"total": 0, "emotions": defaultdict(int)})
    for r in all_records:
        date_str = r.created_at.strftime("%Y-%m-%d") if r.created_at else datetime.utcnow().strftime("%Y-%m-%d")
        date_groups[date_str]["total"] += 1
        date_groups[date_str]["emotions"][r.primary_emotion] += 1

    daily_trends = [
        {
            "date": d,
            "total": data["total"],
            "emotions": dict(data["emotions"])
        }
        for d, data in sorted(date_groups.items())
    ]

    return {
        "total_analyses": total_count,
        "average_confidence": round(avg_conf, 3),
        "top_emotion": top_emotion,
        "emotion_distribution": emotion_distribution,
        "modality_distribution": modality_distribution,
        "daily_trends": daily_trends
    }
