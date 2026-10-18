"""
History and Reports API Router.
Provides retrieval, filtering by modality and emotion, single & bulk deletion,
and automated CSV export for project documentation and presentation.
"""

import csv
import io
import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_optional_user

router = APIRouter(prefix="/api/history", tags=["History"])


@router.get("", response_model=schemas.HistoryListResponse)
def get_analysis_history(
    modality: Optional[str] = Query(None, description="Filter by modality: text, face, voice, multimodal"),
    emotion: Optional[str] = Query(None, description="Filter by primary emotion"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: Optional[models.User] = Depends(get_optional_user)
):
    """Retrieves paginated history with optional filters."""
    query = db.query(models.EmotionAnalysis)

    # If logged in, filter to user's records; otherwise return recent records
    if user:
        query = query.filter((models.EmotionAnalysis.user_id == user.id) | (models.EmotionAnalysis.user_id == None))

    if modality:
        query = query.filter(models.EmotionAnalysis.modality == modality.lower())
    if emotion:
        query = query.filter(models.EmotionAnalysis.primary_emotion == emotion.lower())

    total = query.count()
    offset = (page - 1) * limit
    records = query.order_by(models.EmotionAnalysis.created_at.desc()).offset(offset).limit(limit).all()

    items = []
    for r in records:
        try:
            preds = json.loads(r.top_predictions) if r.top_predictions else []
        except Exception:
            preds = []
        items.append({
            "id": r.id,
            "modality": r.modality,
            "input_preview": r.input_preview,
            "primary_emotion": r.primary_emotion,
            "confidence": r.confidence,
            "top_predictions": preds,
            "non_clinical_response": r.non_clinical_response,
            "created_at": r.created_at
        })

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": items
    }


@router.delete("/{record_id}", status_code=status.HTTP_200_OK)
def delete_history_item(
    record_id: int,
    db: Session = Depends(get_db),
    user: Optional[models.User] = Depends(get_optional_user)
):
    """Deletes a specific analysis record."""
    record = db.query(models.EmotionAnalysis).filter(models.EmotionAnalysis.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    # Check permission if user is authenticated
    if user and record.user_id and record.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this record.")

    db.delete(record)
    db.commit()
    return {"message": "Record deleted successfully.", "deleted_id": record_id}


@router.delete("", status_code=status.HTTP_200_OK)
def clear_all_history(
    db: Session = Depends(get_db),
    user: Optional[models.User] = Depends(get_optional_user)
):
    """Clears history records."""
    if user:
        db.query(models.EmotionAnalysis).filter(models.EmotionAnalysis.user_id == user.id).delete()
    else:
        # Clear guest records
        db.query(models.EmotionAnalysis).filter(models.EmotionAnalysis.user_id == None).delete()
    db.commit()
    return {"message": "History cleared successfully."}


@router.get("/export/csv")
def export_history_csv(
    db: Session = Depends(get_db),
    user: Optional[models.User] = Depends(get_optional_user)
):
    """Exports history to a downloadable CSV spreadsheet."""
    query = db.query(models.EmotionAnalysis)
    if user:
        query = query.filter((models.EmotionAnalysis.user_id == user.id) | (models.EmotionAnalysis.user_id == None))
    records = query.order_by(models.EmotionAnalysis.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Record ID",
        "Timestamp (UTC)",
        "Modality",
        "Primary Emotion",
        "Confidence Score",
        "Confidence Percentage",
        "Input Preview",
        "Top Predictions",
        "Supportive Reflection"
    ])

    for r in records:
        writer.writerow([
            r.id,
            r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else "",
            r.modality,
            r.primary_emotion,
            r.confidence,
            f"{round(r.confidence * 100, 2)}%",
            r.input_preview or "",
            r.top_predictions or "",
            r.non_clinical_response or ""
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=emotion_recognition_analysis_report.csv"
        }
    )
