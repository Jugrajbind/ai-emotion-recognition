"""
Multimodal Emotion Fusion Service.
Combines probabilities from multiple modalities (Text, Facial Expression, Vocal Prosody)
using normalized decision-level fusion with modality reliability weighting.
"""

from typing import Dict, Any, List, Optional
from emotion_service import EMOTIONS, SUPPORTIVE_RESPONSES


class MultimodalFusionService:
    """Service for fusing multiple sensory modality predictions into a single decision."""

    def __init__(self):
        self.emotions = EMOTIONS

    def fuse_predictions(
        self,
        text_result: Optional[Dict[str, Any]] = None,
        face_result: Optional[Dict[str, Any]] = None,
        voice_result: Optional[Dict[str, Any]] = None,
        text_weight: float = 0.40,
        face_weight: float = 0.40,
        voice_weight: float = 0.20
    ) -> Dict[str, Any]:
        """
        Calculates weighted ensemble decision across active modalities.
        Dynamically renormalizes weights if one or more modalities are omitted.
        """
        active_modalities = []
        weights = {}

        if text_result and "all_predictions" in text_result:
            active_modalities.append(("text", text_result, text_weight))
        if face_result and face_result.get("face_detected") and "all_predictions" in face_result:
            active_modalities.append(("face", face_result, face_weight))
        if voice_result and "all_predictions" in voice_result:
            active_modalities.append(("voice", voice_result, voice_weight))

        # If no valid modality provided, return default neutral
        if not active_modalities:
            default_preds = [{"emotion": e, "score": 1.0/len(self.emotions), "percentage": 100.0/len(self.emotions)} for e in self.emotions]
            return {
                "modality": "multimodal",
                "primary_emotion": "neutral",
                "confidence": 0.5,
                "confidence_percentage": 50.0,
                "top_predictions": default_preds[:3],
                "all_predictions": default_preds,
                "contributing_modalities": [],
                "fusion_weights_used": {},
                "non_clinical_response": SUPPORTIVE_RESPONSES["neutral"]
            }

        # Normalize weights
        total_raw_weight = sum(w for _, _, w in active_modalities)
        normalized_weights = {name: (w / total_raw_weight) for name, _, w in active_modalities}

        # Aggregate weighted probability for each emotion
        fused_probs = {e: 0.0 for e in self.emotions}
        contributing_summaries = []

        for name, result, _ in active_modalities:
            weight = normalized_weights[name]
            contributing_summaries.append({
                "modality": name,
                "detected_emotion": result["primary_emotion"],
                "confidence": result["confidence"]
            })
            for pred in result["all_predictions"]:
                emotion = pred["emotion"]
                if emotion in fused_probs:
                    fused_probs[emotion] += pred["score"] * weight

        # Sort combined predictions
        sorted_emotions = sorted(fused_probs.items(), key=lambda x: x[1], reverse=True)
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
            "modality": "multimodal",
            "primary_emotion": primary_emotion,
            "confidence": round(confidence, 4),
            "confidence_percentage": round(confidence * 100, 2),
            "top_predictions": top_predictions[:3],
            "all_predictions": top_predictions,
            "contributing_modalities": contributing_summaries,
            "fusion_weights_used": {k: round(v, 3) for k, v in normalized_weights.items()},
            "non_clinical_response": SUPPORTIVE_RESPONSES.get(primary_emotion, SUPPORTIVE_RESPONSES["neutral"])
        }


# Singleton instance
multimodal_fusion_service = MultimodalFusionService()
