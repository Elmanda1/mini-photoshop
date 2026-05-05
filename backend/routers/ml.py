"""
ML Object Recognition Router — Module 11
CNN-based image classification using MobileNetV2.
Note: TensorFlow must be installed separately for this module to work.
"""

from fastapi import APIRouter
from pydantic import BaseModel
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import decode_image

router = APIRouter(prefix="/api/ml", tags=["ML Recognition"])

# Global model reference — loaded once at startup
_model = None
_decode_predictions = None


def load_model():
    """Load MobileNetV2 model (called once at startup)."""
    global _model, _decode_predictions
    try:
        from tensorflow.keras.applications import MobileNetV2
        from tensorflow.keras.applications.mobilenet_v2 import (
            preprocess_input, decode_predictions
        )
        _model = MobileNetV2(weights="imagenet")
        _decode_predictions = decode_predictions
        print("[OK] MobileNetV2 model loaded successfully")
    except ImportError:
        print("[WARN] TensorFlow not installed -- ML module disabled")
        _model = None


class RecognizeRequest(BaseModel):
    image: str  # Base64


@router.post("/recognize")
async def recognize_endpoint(req: RecognizeRequest):
    """Run CNN inference on the image."""
    if _model is None:
        return {
            "error": "ML model not available. Install TensorFlow: pip install tensorflow",
            "label": "N/A",
            "confidence": 0.0,
            "predictions": []
        }

    import numpy as np
    import cv2
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

    img = decode_image(req.image)

    # Preprocess for MobileNetV2 (224x224 RGB)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img_rgb, (224, 224))
    img_array = np.expand_dims(img_resized, axis=0).astype(np.float32)
    img_array = preprocess_input(img_array)

    # Run inference
    predictions = _model.predict(img_array)
    decoded = _decode_predictions(predictions, top=5)[0]

    results = [
        {"label": label, "description": desc, "confidence": round(float(conf), 4)}
        for (label, desc, conf) in decoded
    ]

    return {
        "label": results[0]["description"] if results else "Unknown",
        "confidence": results[0]["confidence"] if results else 0.0,
        "predictions": results
    }
