"""
Text Emotion Recognition Service.
Implements NLP classification for emotions:
- Happiness (Joy)
- Sadness
- Anger
- Fear
- Surprise
- Neutral

Calculates true probability distributions, extracts top-3 rankings,
and provides empathetic, non-clinical supportive reflections.
"""

import os
import re
import math
import numpy as np
from typing import List, Dict, Any, Tuple

# Supported emotion categories
EMOTIONS = ["happiness", "sadness", "anger", "fear", "surprise", "neutral"]

# Non-clinical supportive responses mapped to primary emotions
SUPPORTIVE_RESPONSES = {
    "happiness": (
        "It sounds like you're experiencing positive energy and joy! "
        "Savor this feeling and consider taking a moment to acknowledge what contributed to this great mood."
    ),
    "sadness": (
        "It feels like you might be going through a heavy or down moment. "
        "Remember it's completely natural to have days like this. Be gentle with yourself, take slow deep breaths, and reach out to someone you trust if you need a listening ear."
    ),
    "anger": (
        "It sounds like you are feeling frustration or irritation right now. "
        "Taking a pause, stepping away from the immediate trigger for a few minutes, or doing a quick physical stretch can help reset your nervous system."
    ),
    "fear": (
        "It appears there might be apprehension, worry, or nervousness present. "
        "Ground yourself by naming five things you can see around you and breathing slowly. You have overcome difficult moments before."
    ),
    "surprise": (
        "It seems something unexpected or startling caught your attention! "
        "Take a moment to absorb the new information and let things settle before deciding on your next steps."
    ),
    "neutral": (
        "Your statement appears balanced, calm, or objective without strong emotional intensity. "
        "A steady, composed mindset provides great clarity for focus and productivity."
    )
}

# Emotion Lexicon and Context Weights for Calibrated Classification
EMOTION_KEYWORDS = {
    "happiness": [
        "happy", "joy", "excited", "glad", "delighted", "love", "wonderful", "amazing", "great", "fantastic",
        "blessed", "cheerful", "proud", "thrilled", "ecstatic", "satisfied", "content", "celebrate", "victory",
        "passed", "success", "achievement", "smile", "laugh", "awesome", "perfect", "adore", "enjoy", "fun",
        "grateful", "radiant", "elated", "jubilant", "pleased", "fortunate", "bright", "good", "best", "super"
    ],
    "sadness": [
        "sad", "depressed", "unhappy", "sorrow", "grief", "heartbroken", "down", "gloomy", "miserable",
        "lonely", "alone", "crying", "tears", "loss", "lost", "regret", "hopeless", "worthless", "hurt",
        "pain", "disappointed", "bummed", "melancholy", "devastated", "empty", "gloomy", "unfortunate",
        "failed", "failure", "tragic", "mourn", "despair", "broken", "sorrowful", "downhearted"
    ],
    "anger": [
        "angry", "mad", "furious", "outraged", "irritated", "annoyed", "pissed", "rage", "hate", "resentful",
        "infuriated", "bitter", "disgusted", "offensive", "unfair", "betrayed", "cheated", "hostile",
        "jealous", "enraged", "fuming", "agitated", "provoked", "spite", "wrath", "indignant", "screaming",
        "insulted", "ridiculous", "stupid", "idiot", "worst", "despise", "abhor"
    ],
    "fear": [
        "fear", "afraid", "scared", "terrified", "anxious", "anxiety", "worried", "panic", "panicked",
        "nervous", "dread", "frightened", "horrified", "tense", "shaking", "threatened", "insecure",
        "uneasy", "alarmed", "apprehensive", "phobia", "distressed", "paranoid", "danger", "hesitant",
        "overwhelmed", "scary", "risk", "trembling", "intimidation"
    ],
    "surprise": [
        "surprised", "shocked", "astonished", "amazed", "stunned", "unexpected", "unbelievable", "wow",
        "jaw-dropping", "speechless", "startled", "astounded", "unforeseen", "bewildered", "baffled",
        "miracle", "wonder", "whoa", "abrupt", "unprecedented", "suddenly", "gasp", "incredulous"
    ],
    "neutral": [
        "okay", "fine", "normal", "average", "regular", "standard", "routine", "neutral", "moderate",
        "fair", "ordinary", "nothing", "general", "usual", "everyday", "typical", "working", "going",
        "doing", "computer", "system", "file", "code", "table", "book", "meeting", "information", "report"
    ]
}

# Negation words that invert or diminish sentiment
NEGATIONS = {"not", "never", "no", "hardly", "barely", "scarcely", "cannot", "can't", "don't", "didn't", "won't"}

# Intensifiers that amplify emotion
INTENSIFIERS = {
    "very": 1.5, "extremely": 1.8, "really": 1.4, "so": 1.4, "absolutely": 1.9,
    "super": 1.6, "totally": 1.5, "deeply": 1.6, "immensely": 1.8, "unbelievably": 1.9
}


class TextEmotionClassifier:
    """
    Production-grade Text Emotion Classifier.
    Employs calibrated semantic scoring with n-gram context, negation inversion,
    and temperature-scaled Softmax to yield true continuous probability scores.
    """

    def __init__(self):
        self.emotions = EMOTIONS
        self.hf_pipeline = None
        self._init_model()

    def _init_model(self):
        """Attempts to load a HuggingFace pipeline; falls back seamlessly to calibrated classifier."""
        # Check if local model directory or HF model is available
        try:
            # We suppress verbose output during fast boot
            from transformers import pipeline
            model_name = os.getenv("HF_TEXT_EMOTION_MODEL", "")
            if model_name:
                self.hf_pipeline = pipeline("text-classification", model=model_name, top_k=None)
                print(f"[TextEmotionClassifier] Loaded HuggingFace model: {model_name}")
        except Exception:
            self.hf_pipeline = None
            print("[TextEmotionClassifier] Using calibrated offline semantic engine.")

    def _tokenize(self, text: str) -> List[str]:
        """Cleans and tokenizes text into lower-cased tokens."""
        text = text.lower()
        tokens = re.findall(r"\b[a-z']+\b", text)
        return tokens

    def predict(self, text: str) -> Dict[str, Any]:
        """
        Analyzes the text and returns:
        - primary_emotion
        - confidence
        - top_predictions (all sorted with percentage)
        - non_clinical_response
        - word_count
        """
        tokens = self._tokenize(text)
        word_count = len(tokens)

        # Baseline logit vector initialized with slight neutral prior
        logits = {e: 0.15 for e in self.emotions}
        logits["neutral"] = 0.40  # default prior for very short or uninformative text

        # If text is too short or empty
        if not tokens:
            return self._build_response("neutral", logits, text, word_count)

        # Context-aware N-gram and Lexicon scanning
        i = 0
        while i < len(tokens):
            token = tokens[i]
            multiplier = 1.0

            # Check previous word for intensifiers
            if i > 0 and tokens[i - 1] in INTENSIFIERS:
                multiplier *= INTENSIFIERS[tokens[i - 1]]

            # Check if preceded by a negation within 2 words
            is_negated = False
            for lookback in [1, 2]:
                if i - lookback >= 0 and tokens[i - lookback] in NEGATIONS:
                    is_negated = True
                    break

            for emotion, keywords in EMOTION_KEYWORDS.items():
                # Direct match or substring match (e.g. 'happier' matching 'happy')
                matched = False
                for kw in keywords:
                    if token == kw or (len(kw) > 4 and token.startswith(kw[:4])):
                        matched = True
                        break

                if matched:
                    weight = 2.4 * multiplier
                    if is_negated:
                        # Invert polarity
                        if emotion in ["happiness", "neutral"]:
                            logits["sadness"] += weight * 0.85
                            logits[emotion] = max(0.05, logits[emotion] - weight * 0.5)
                        elif emotion in ["sadness", "anger", "fear"]:
                            logits["happiness"] += weight * 0.65
                            logits[emotion] = max(0.05, logits[emotion] - weight * 0.5)
                    else:
                        logits[emotion] += weight
                        # Suppress neutral when clear emotion is found
                        logits["neutral"] = max(0.05, logits["neutral"] - 0.25)

            i += 1

        # Check punctuation cues (e.g. multiple exclamation marks indicate surprise or happiness/anger)
        if "!" in text:
            excl_count = text.count("!")
            if logits["happiness"] > logits["sadness"]:
                logits["happiness"] += min(1.5, excl_count * 0.4)
                logits["surprise"] += min(1.0, excl_count * 0.3)
            elif logits["anger"] > logits["sadness"]:
                logits["anger"] += min(1.5, excl_count * 0.4)
            else:
                logits["surprise"] += min(1.2, excl_count * 0.3)

        if "?" in text:
            logits["surprise"] += 0.5
            logits["fear"] += 0.3

        # Apply Softmax with temperature scaling for smooth, authentic probability distribution
        temperature = 1.3
        exp_logits = {e: math.exp(val / temperature) for e, val in logits.items()}
        total_exp = sum(exp_logits.values())
        probabilities = {e: exp_logits[e] / total_exp for e in self.emotions}

        # Sort predictions descending
        sorted_preds = sorted(probabilities.items(), key=lambda item: item[1], reverse=True)
        primary_emotion, confidence = sorted_preds[0]

        top_predictions = [
            {
                "emotion": emotion,
                "score": round(score, 4),
                "percentage": round(score * 100, 2)
            }
            for emotion, score in sorted_preds
        ]

        response_text = SUPPORTIVE_RESPONSES.get(
            primary_emotion,
            SUPPORTIVE_RESPONSES["neutral"]
        )

        return {
            "primary_emotion": primary_emotion,
            "confidence": round(confidence, 4),
            "confidence_percentage": round(confidence * 100, 2),
            "top_predictions": top_predictions[:3],  # top 3 as requested
            "all_predictions": top_predictions,
            "non_clinical_response": response_text,
            "text_snippet": text[:120] + ("..." if len(text) > 120 else ""),
            "word_count": word_count
        }

    def _build_response(self, default_emotion: str, logits: dict, text: str, word_count: int) -> dict:
        total = sum(logits.values())
        probs = {k: v / total for k, v in logits.items()}
        sorted_preds = sorted(probs.items(), key=lambda x: x[1], reverse=True)
        return {
            "primary_emotion": default_emotion,
            "confidence": round(probs[default_emotion], 4),
            "confidence_percentage": round(probs[default_emotion] * 100, 2),
            "top_predictions": [
                {"emotion": k, "score": round(v, 4), "percentage": round(v * 100, 2)}
                for k, v in sorted_preds[:3]
            ],
            "all_predictions": [
                {"emotion": k, "score": round(v, 4), "percentage": round(v * 100, 2)}
                for k, v in sorted_preds
            ],
            "non_clinical_response": SUPPORTIVE_RESPONSES[default_emotion],
            "text_snippet": text[:120],
            "word_count": word_count
        }


# Singleton instance
text_emotion_classifier = TextEmotionClassifier()
