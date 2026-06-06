"""
Compression Router — Module 8
JPEG quality simulation.
"""

from fastapi import APIRouter
from pydantic import BaseModel
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import decode_image, encode_image, ensure_3channel, merge_alpha
from services.compress_service import compress_jpeg, compress_rle

router = APIRouter(prefix="/api", tags=["Compression"])


class CompressRequest(BaseModel):
    image: str
    method: str = "jpeg" # "jpeg" or "rle"
    quality: int = 80    # 1-100 (for jpeg)


@router.post("/compress")
async def compress_endpoint(req: CompressRequest):
    """Compress image with JPEG (Lossy) or RLE (Lossless) simulation."""
    img = decode_image(req.image)
    bgr, alpha = ensure_3channel(img)
    
    if req.method == "rle":
        compressed_img, original_size, compressed_size = compress_rle(bgr)
        quality_val = 100 # RLE is always 100% quality
    else:
        compressed_img, original_size, compressed_size = compress_jpeg(bgr, req.quality)
        quality_val = req.quality

    result = merge_alpha(compressed_img, alpha)
    return {
        "image": encode_image(result),
        "original_size": original_size,
        "compressed_size": compressed_size,
        "compression_ratio": round(original_size / max(compressed_size, 1), 2),
        "quality": quality_val,
        "method": req.method
    }
