"""
ML Object Recognition Router — Module 11
Custom CNN-based face recognition using Keras.
"""

from fastapi import APIRouter
from pydantic import BaseModel
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import decode_image
from tensorflow.keras.models import load_model as tf_load_model
import cv2
import numpy as np

router = APIRouter(prefix="/api/ml", tags=["ML Recognition"])

_model = None

IMG_SIZE = (92, 112) # Width, Height (ORL Standard)

def load_model():
    """Load Binary Human vs Not Human CNN model."""
    global _model
    
    model_path = os.path.join(os.path.dirname(__file__), "models", "human_classifier_binary.h5")
    
    if not os.path.exists(model_path):
        print(f"[WARN] Binary model not found at {model_path}. Please run train_binary.py first.")
        _model = None
        return

    try:
        _model = tf_load_model(model_path)
        print("[OK] Binary Human Classifier model loaded successfully")
    except Exception as e:
        print(f"[WARN] Failed to load binary model: {e}")
        _model = None


class RecognizeRequest(BaseModel):
    image: str  # Base64


# Load Haar Cascades for Face Detection (Preprocessing)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')

@router.post("/recognize")
async def recognize_endpoint(req: RecognizeRequest):
    """Run Binary CNN inference with Multi-Cascade Face Detection."""
    if _model is None:
        return {
            "error": "Binary ML model not available. Run training script first.",
            "label": "N/A",
            "confidence": 0.0,
            "predictions": []
        }

    # 1. Decode Image
    img = decode_image(req.image)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 2. Try to detect face (Frontal then Profile)
    # Tightened parameters (scaleFactor=1.1, minNeighbors=5) for better precision
    faces = face_cascade.detectMultiScale(gray, 1.1, 5)
    if len(faces) == 0:
        faces = profile_cascade.detectMultiScale(gray, 1.1, 5)
        if len(faces) > 0:
            print("[INFO] Profile face detected")
    
    if len(faces) > 0:
        # Take the largest face
        (x, y, w, h) = sorted(faces, key=lambda f: f[2]*f[3], reverse=True)[0]
        # Crop with some padding
        padding = 20
        y1, y2 = max(0, y-padding), min(gray.shape[0], y+h+padding)
        x1, x2 = max(0, x-padding), min(gray.shape[1], x+w+padding)
        roi_gray = gray[y1:y2, x1:x2]
        print("[INFO] Face cropped for inference")
    else:
        # Fallback to whole image if no face detected
        roi_gray = gray
        print("[WARN] No face detected, using whole image (contextual inference)")

    # 3. Preprocess for CNN
    resized = cv2.resize(roi_gray, IMG_SIZE)
    normalized = resized.astype('float32') / 255.0
    input_tensor = normalized.reshape(1, IMG_SIZE[1], IMG_SIZE[0], 1)

    # 4. Inference
    prediction = float(_model.predict(input_tensor)[0][0])
    
    # Label mapping: 0 = Not Human, 1 = Human
    # Precision Tuning: Using 0.7 threshold to reduce false positives
    is_human = prediction > 0.7
    label = "Human (Manusia)" if is_human else "Not Human (Bukan Manusia)"
    confidence = prediction if is_human else (1.0 - prediction)

    return {
        "label": label,
        "confidence": round(confidence, 4),
        "predictions": [
            {
                "label": "Human",
                "confidence": round(prediction, 4),
                "description": "Detection of human features"
            },
            {
                "label": "Not Human",
                "confidence": round(1.0 - prediction, 4),
                "description": "Detection of inanimate objects or background"
            }
        ]
    }
