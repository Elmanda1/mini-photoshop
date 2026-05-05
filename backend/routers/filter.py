"""
Filter Router — Module 4 (Noise Reduction)
Gaussian blur, median filter, salt & pepper noise.
"""

from fastapi import APIRouter
from pydantic import BaseModel
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import decode_image, encode_image
from services.filter_service import (
    gaussian_blur, median_filter, add_salt_pepper_noise, remove_noise
)

router = APIRouter(prefix="/api", tags=["Filter"])


class FilterRequest(BaseModel):
    image: str
    operation: str  # gaussian, median, add_noise, remove_noise
    kernel_size: int = 5
    noise_amount: float = 0.05
    method: str = "median"  # for remove_noise


@router.post("/filter")
async def filter_endpoint(req: FilterRequest):
    """Apply noise reduction / filter operations."""
    img = decode_image(req.image)

    if req.operation == "gaussian":
        result = gaussian_blur(img, req.kernel_size)
    elif req.operation == "median":
        result = median_filter(img, req.kernel_size)
    elif req.operation == "add_noise":
        result = add_salt_pepper_noise(img, req.noise_amount)
    elif req.operation == "remove_noise":
        result = remove_noise(img, req.method, req.kernel_size)
    else:
        return {"error": f"Unknown operation: {req.operation}"}

    return {"image": encode_image(result)}
