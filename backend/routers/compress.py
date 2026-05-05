"""
Compression Router — Module 8
JPEG quality simulation.
"""

from fastapi import APIRouter
from pydantic import BaseModel
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import decode_image, encode_image
from services.compress_service import compress_jpeg

router = APIRouter(prefix="/api", tags=["Compression"])


class CompressRequest(BaseModel):
    image: str
    quality: int = 80  # 1-100


@router.post("/compress")
async def compress_endpoint(req: CompressRequest):
    """Compress image with JPEG quality simulation."""
    img = decode_image(req.image)
    compressed_img, original_size, compressed_size = compress_jpeg(img, req.quality)

    return {
        "image": encode_image(compressed_img),
        "original_size": original_size,
        "compressed_size": compressed_size,
        "compression_ratio": round(original_size / max(compressed_size, 1), 2),
        "quality": req.quality
    }
