"""
Image Management Router — Module 1
Upload, save, and reset image operations.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import decode_image, encode_image
from services.image_service import save_image

router = APIRouter(prefix="/api/image", tags=["Image Management"])


class LoadRequest(BaseModel):
    image: str  # Base64 encoded image


class SaveRequest(BaseModel):
    image: str  # Base64 encoded image
    format: str = "png"  # png, jpg, bmp
    quality: int = 95


@router.post("/load")
async def load_image_endpoint(req: LoadRequest):
    """Upload and decode an image. Returns the image as Base64."""
    img = decode_image(req.image)
    h, w = img.shape[:2]
    return {
        "image": encode_image(img),
        "width": w,
        "height": h,
        "channels": img.shape[2] if len(img.shape) == 3 else 1
    }


@router.post("/save")
async def save_image_endpoint(req: SaveRequest):
    """Encode image to specified format and return as Base64."""
    img = decode_image(req.image)
    _, mime = save_image(img, req.format, req.quality)
    encoded = encode_image(img, f".{req.format}")
    return {
        "image": encoded,
        "format": req.format,
        "mime_type": mime
    }
