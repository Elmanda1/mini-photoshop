"""
ML Object Recognition Router — Module 11
CNN-based human/face detection using OpenCV DNN (ResNet SSD).
"""

from fastapi import APIRouter
from pydantic import BaseModel
import sys, os, urllib.request
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import decode_image
import cv2
import numpy as np

router = APIRouter(prefix="/api/ml", tags=["ML Recognition"])

_net = None

def load_model():
    """Load OpenCV DNN Face/Person Detector model."""
    global _net
    
    # URLs for OpenCV's ResNet SSD Face Detector
    prototxt_url = "https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt"
    caffemodel_url = "https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel"
    
    model_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(model_dir, exist_ok=True)
    
    prototxt_path = os.path.join(model_dir, "deploy.prototxt")
    caffemodel_path = os.path.join(model_dir, "res10_300x300_ssd.caffemodel")
    
    try:
        if not os.path.exists(prototxt_path):
            print("[INFO] Downloading prototxt...")
            urllib.request.urlretrieve(prototxt_url, prototxt_path)
        if not os.path.exists(caffemodel_path):
            print("[INFO] Downloading caffemodel (~10MB)...")
            urllib.request.urlretrieve(caffemodel_url, caffemodel_path)
            
        _net = cv2.dnn.readNetFromCaffe(prototxt_path, caffemodel_path)
        print("[OK] ResNet SSD Human/Face model loaded successfully")
    except Exception as e:
        print(f"[WARN] Failed to load DNN model: {e}")
        _net = None


class RecognizeRequest(BaseModel):
    image: str  # Base64


@router.post("/recognize")
async def recognize_endpoint(req: RecognizeRequest):
    """Run CNN inference to detect humans (faces)."""
    if _net is None:
        return {
            "error": "ML model not available or failed to download.",
            "label": "N/A",
            "confidence": 0.0,
            "predictions": []
        }

    img = decode_image(req.image)
    (h, w) = img.shape[:2]
    
    # Preprocess image for ResNet SSD
    blob = cv2.dnn.blobFromImage(cv2.resize(img, (300, 300)), 1.0, (300, 300), (104.0, 177.0, 123.0))
    _net.setInput(blob)
    detections = _net.forward()
    
    # Extract confidences for all detected faces/persons
    persons = []
    for i in range(0, detections.shape[2]):
        confidence = float(detections[0, 0, i, 2])
        if confidence > 0.1:  # Filter weak detections
            persons.append(confidence)
            
    persons.sort(reverse=True)
    
    # Format top 5 predictions (each represents a detected human)
    results = []
    for i, conf in enumerate(persons[:5]):
        results.append({
            "label": "Person",
            "description": f"Human Face #{i+1}",
            "confidence": round(conf, 4)
        })

    if not results:
        return {
            "label": "No Person Detected",
            "confidence": 0.0,
            "predictions": []
        }

    return {
        "label": "Person (Manusia)",
        "confidence": results[0]["confidence"],
        "predictions": results
    }
