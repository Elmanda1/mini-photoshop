"""
Compression Router — Module 8
JPEG quality simulation.
"""

from fastapi import APIRouter
from pydantic import BaseModel
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import decode_image, encode_image, ensure_3channel, merge_alpha
from services.compress_service import (
    compress_jpeg, compress_rle, compress_huffman, 
    compress_arithmetic, compress_lzw
)

router = APIRouter(prefix="/api", tags=["Compression"])


class CompressRequest(BaseModel):
    image: str
    method: str = "jpeg" # jpeg, rle, huffman, arithmetic, lzw
    quality: int = 80    # 1-100 (for jpeg)


@router.post("/compress")
async def compress_endpoint(req: CompressRequest):
    """Compress image with various lossy/lossless simulation methods."""
    img = decode_image(req.image)
    bgr, alpha = ensure_3channel(img)
    
    method = req.method.lower()
    quality_val = req.quality
    
    # Default to PNG
    ext = ".png"
    
    if method == "rle":
        compressed_img, original_size, compressed_size = compress_rle(bgr)
        quality_val = 100
    elif method == "huffman":
        compressed_img, original_size, compressed_size = compress_huffman(bgr)
        quality_val = 100
    elif method == "arithmetic":
        compressed_img, original_size, compressed_size = compress_arithmetic(bgr)
        quality_val = 100
    elif method == "lzw":
        compressed_img, original_size, compressed_size = compress_lzw(bgr)
        quality_val = 100
    else:
        # Default to JPEG
        compressed_img, original_size, compressed_size = compress_jpeg(bgr, req.quality)
        method = "jpeg"
        ext = ".jpg"

    result = merge_alpha(compressed_img, alpha)
    
    # Calculate raw binary bits (W * H * C * 8 bits)
    h, w, c = bgr.shape
    raw_bits = h * w * c * 8
    
    return {
        "image": encode_image(result, ext),
        "original_size": original_size,
        "compressed_size": compressed_size,
        "compression_ratio": round(original_size / max(compressed_size, 1), 2),
        "quality": quality_val,
        "method": method,
        "raw_bits": raw_bits
    }
