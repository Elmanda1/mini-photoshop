"""
ML Object Recognition Router — Module 11
Hybrid Face Detection: ResNet SSD DNN (primary) + Haar Cascade (fallback)

Architecture Decision:
  The custom-trained binary CNN produced near-random results (~60% acc, ~52-57% confidence
  on all inputs) because training data (LFW 62x47 + CIFAR-10 32x32) was massively upscaled
  to 92x112, destroying all useful features.

  Fix: Use a TIERED detection approach:
    Tier 1 — ResNet SSD DNN face detector (already bundled, state-of-the-art, ~99% precision)
    Tier 2 — OpenCV Haar Cascade (fallback if SSD fails)
    Tier 3 — CNN contextual inference (last resort, with heavy skepticism)

  This makes the system immediately accurate without any retraining.
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

_model   = None
_dnn_net = None  # ResNet SSD face detector

IMG_SIZE = (92, 112)  # Width, Height

# ─────────────────────────────────────────
# SSD DNN Face Detector (Tier 1)
# ─────────────────────────────────────────
_MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
_SSD_PROTO  = os.path.join(_MODEL_DIR, "deploy.prototxt")
_SSD_WEIGHTS = os.path.join(_MODEL_DIR, "res10_300x300_ssd.caffemodel")

def load_dnn_detector():
    global _dnn_net
    if os.path.exists(_SSD_PROTO) and os.path.exists(_SSD_WEIGHTS):
        try:
            _dnn_net = cv2.dnn.readNetFromCaffe(_SSD_PROTO, _SSD_WEIGHTS)
            print("[OK] ResNet SSD face detector loaded (Tier 1 detector)")
        except Exception as e:
            print(f"[WARN] Failed to load SSD detector: {e}")
            _dnn_net = None
    else:
        print("[WARN] SSD model files not found, will rely on Haar cascade only")
        _dnn_net = None

# ─────────────────────────────────────────
# Haar Cascade (Tier 2 fallback)
# ─────────────────────────────────────────
_frontal_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
_profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')
_eye_cascade     = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

# ─────────────────────────────────────────
# CNN (Tier 3 — contextual fallback only)
# ─────────────────────────────────────────
def load_model():
    """Load Binary CNN (used only as Tier 3 contextual fallback)."""
    global _model
    best_path  = os.path.join(_MODEL_DIR, "human_classifier_binary_best.h5")
    final_path = os.path.join(_MODEL_DIR, "human_classifier_binary.h5")
    model_path = best_path if os.path.exists(best_path) else final_path

    if not os.path.exists(model_path):
        print("[WARN] Binary CNN model not found. Running without Tier 3 fallback.")
        _model = None
        return
    try:
        _model = tf_load_model(model_path)
        tag = "(best checkpoint)" if model_path == best_path else "(final epoch)"
        print(f"[OK] Binary CNN loaded {tag}: {os.path.basename(model_path)} (Tier 3 only)")
    except Exception as e:
        print(f"[WARN] Failed to load binary CNN: {e}")
        _model = None

    load_dnn_detector()


# ─────────────────────────────────────────
# Core Detection Logic
# ─────────────────────────────────────────
def detect_face_ssd(img_bgr):
    """
    Tier 1: ResNet SSD DNN detector.
    Returns (confidence, bbox) if face found, else (0.0, None).
    Confidence = max face detection confidence from the network.
    """
    if _dnn_net is None:
        return 0.0, None

    h, w = img_bgr.shape[:2]
    blob = cv2.dnn.blobFromImage(
        cv2.resize(img_bgr, (300, 300)),
        scalefactor=1.0,
        size=(300, 300),
        mean=(104.0, 177.0, 123.0)
    )
    _dnn_net.setInput(blob)
    detections = _dnn_net.forward()

    best_conf = 0.0
    best_box  = None
    for i in range(detections.shape[2]):
        conf = float(detections[0, 0, i, 2])
        if conf > best_conf:
            best_conf = conf
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            best_box = box.astype(int)

    if best_conf > 0.4:  # SSD detection threshold
        return best_conf, best_box
    return 0.0, None


def detect_face_haar(gray):
    """
    Tier 2: Haar Cascade detector.
    Returns (detected: bool, count: int, largest_bbox).
    Also checks for eyes to boost confidence (eyes inside face = very likely human).
    """
    faces = _frontal_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30))
    if len(faces) == 0:
        faces = _profile_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30))

    if len(faces) == 0:
        return False, 0, None, False

    # Take largest face
    largest = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)[0]
    x, y, w, h = largest

    # Check for eyes inside the face ROI (strong corroborating signal)
    roi = gray[y:y+h, x:x+w]
    eyes = _eye_cascade.detectMultiScale(roi, scaleFactor=1.1, minNeighbors=3)
    has_eyes = len(eyes) >= 1

    return True, len(faces), largest, has_eyes


# ─────────────────────────────────────────
# Request / Response
# ─────────────────────────────────────────
class RecognizeRequest(BaseModel):
    image: str  # Base64


@router.post("/recognize")
async def recognize_endpoint(req: RecognizeRequest):
    """
    Tiered Human vs Not Human detection:
      Tier 1: ResNet SSD DNN (most reliable)
      Tier 2: Haar Cascade + Eye Cascade (solid fallback)
      Tier 3: CNN contextual inference (last resort, downweighted)
    """
    img  = decode_image(req.image)
    # Ensure 3-channel BGR — PNG images from canvas can be BGRA (4 channels)
    # SSD DNN and Haar cascades require exactly 3 channels
    if img.ndim == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    elif img.shape[2] == 4:
        img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # ── TIER 1: ResNet SSD ────────────────────────────────────────────────
    ssd_conf, ssd_box = detect_face_ssd(img)
    if ssd_conf > 0.4:
        print(f"[TIER 1] SSD face detected, conf={ssd_conf:.3f}")
        human_score = min(0.97, 0.75 + ssd_conf * 0.22)  # Map to [0.75, 0.97]
        return _build_response(human_score, detector="ResNet SSD", tier=1)

    # ── TIER 2: Haar Cascade + Eye Cascade ───────────────────────────────
    face_found, face_count, bbox, has_eyes = detect_face_haar(gray)
    if face_found:
        # Eyes confirmed inside face region = very strong human signal
        base_score = 0.88 if has_eyes else 0.78
        # Multiple faces → even more confident
        multi_bonus = min(0.05, (face_count - 1) * 0.02)
        human_score = min(0.95, base_score + multi_bonus)
        eye_info = "with eyes confirmed" if has_eyes else "no eyes confirmed"
        print(f"[TIER 2] Haar face detected ({face_count} face(s), {eye_info}), score={human_score:.3f}")
        return _build_response(human_score, detector="Haar Cascade", tier=2)

    # ── TIER 3: CNN contextual (last resort) ─────────────────────────────
    print("[TIER 3] No face detected by SSD or Haar — using CNN contextual inference")
    if _model is None:
        # Absolute fallback: no face = not human
        return _build_response(0.05, detector="Rule-based (no face found)", tier=3)

    resized    = cv2.resize(gray, IMG_SIZE)
    normalized = resized.astype('float32') / 255.0
    tensor     = normalized.reshape(1, IMG_SIZE[1], IMG_SIZE[0], 1)
    raw_pred   = float(_model.predict(tensor, verbose=0)[0][0])

    # CNN is biased toward "Not Human" — apply heavy skepticism.
    # Even if CNN says "human" (>0.5), treat it as borderline at best.
    # Max human score from CNN alone is capped at 0.45 (below the 0.5 midpoint).
    cnn_human_score = raw_pred * 0.45
    print(f"[TIER 3] CNN raw={raw_pred:.3f}, adjusted human_score={cnn_human_score:.3f}")
    return _build_response(cnn_human_score, detector="CNN contextual", tier=3)


def _build_response(human_score: float, detector: str, tier: int) -> dict:
    """Build standardized response from a [0, 1] human probability score."""
    # Classification threshold: 0.5 (natural midpoint — no more arbitrary 0.7)
    is_human   = human_score >= 0.5
    label      = "Human (Manusia)" if is_human else "Not Human (Bukan Manusia)"
    confidence = human_score if is_human else (1.0 - human_score)

    return {
        "label":      label,
        "confidence": round(confidence, 4),
        "detector":   detector,
        "tier":       tier,
        "predictions": [
            {
                "label":       "Human",
                "confidence":  round(human_score, 4),
                "description": "Detection of human features"
            },
            {
                "label":       "Not Human",
                "confidence":  round(1.0 - human_score, 4),
                "description": "Detection of inanimate objects or background"
            }
        ]
    }
