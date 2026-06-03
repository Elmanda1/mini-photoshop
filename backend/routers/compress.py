"""
Compression Router — Module 8
JPEG quality simulation.
"""

from fastapi import APIRouter
from pydantic import BaseModel
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import decode_image, encode_image, ensure_3channel, merge_alpha
from services.compress_service import compress_jpeg

router = APIRouter(prefix="/api", tags=["Compression"])


class CompressRequest(BaseModel):
    image: str
    quality: int = 80  # 1-100


@router.post("/compress")
async def compress_endpoint(req: CompressRequest):
    """Compress image with JPEG quality simulation."""
    img = decode_image(req.image)
    bgr, alpha = ensure_3channel(img)
    compressed_img, original_size, compressed_size = compress_jpeg(bgr, req.quality)

    result = merge_alpha(compressed_img, alpha)
    return {
        "image": encode_image(result),
        "original_size": original_size,
        "compressed_size": compressed_size,
        "compression_ratio": round(original_size / max(compressed_size, 1), 2),
        "quality": req.quality
    }
