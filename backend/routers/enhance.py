"""
Enhancement Router — Module 2
Brightness, contrast, histogram equalization, sharpen, blur.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import decode_image, encode_image, ensure_3channel, merge_alpha
from services.enhance_service import (
    adjust_brightness_contrast, histogram_equalization, sharpen, blur, smart_enhance
)

router = APIRouter(prefix="/api", tags=["Enhancement"])


class EnhanceRequest(BaseModel):
    image: str
    operation: str = "brightness_contrast"  # brightness_contrast, histogram_eq, sharpen, blur
    brightness: float = 1.0
    contrast: float = 1.0
    intensity: float = 1.0  # for sharpen
    kernel_size: int = 5    # for blur


@router.post("/enhance")
async def enhance_endpoint(req: EnhanceRequest):
    """Apply image enhancement operations."""
    img = decode_image(req.image)
    bgr, alpha = ensure_3channel(img)

    if req.operation == "brightness_contrast":
        result = adjust_brightness_contrast(bgr, req.brightness, req.contrast)
    elif req.operation == "histogram_eq":
        result = histogram_equalization(bgr)
    elif req.operation == "sharpen":
        result = sharpen(bgr, req.intensity)
    elif req.operation == "blur":
        result = blur(bgr, req.kernel_size)
    elif req.operation == "smart_enhance":
        result = smart_enhance(bgr)
    else:
        return {"error": f"Unknown operation: {req.operation}"}

    result = merge_alpha(result, alpha)
    return {"image": encode_image(result)}
