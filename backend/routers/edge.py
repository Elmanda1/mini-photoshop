"""
Edge Detection & Binary Router — Module 5
Six edge methods + thresholding + morphology.
"""

from fastapi import APIRouter
from pydantic import BaseModel
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import decode_image, encode_image, ensure_3channel, merge_alpha
from services.edge_service import (
    canny_edge, sobel_edge, prewitt_edge, robert_edge,
    laplacian_edge, log_edge, erosion, dilation
)

router = APIRouter(prefix="/api", tags=["Edge Detection"])


class EdgeRequest(BaseModel):
    image: str
    operation: str  # canny, sobel, prewitt, robert, laplacian, log, erosion, dilation
    threshold1: int = 100
    threshold2: int = 200
    kernel_size: int = 5
    sigma: float = 1.0
    thresh_value: int = 127
    iterations: int = 1


@router.post("/edge")
async def edge_endpoint(req: EdgeRequest):
    """Apply edge detection or morphological operations."""
    img = decode_image(req.image)
    bgr, alpha = ensure_3channel(img)

    if req.operation == "canny":
        result = canny_edge(bgr, req.threshold1, req.threshold2)
    elif req.operation == "sobel":
        result = sobel_edge(bgr, req.kernel_size)
    elif req.operation == "prewitt":
        result = prewitt_edge(bgr)
    elif req.operation == "robert":
        result = robert_edge(bgr)
    elif req.operation == "laplacian":
        result = laplacian_edge(bgr)
    elif req.operation == "log":
        result = log_edge(bgr, req.sigma)
    elif req.operation == "erosion":
        result = erosion(bgr, req.kernel_size, req.iterations)
    elif req.operation == "dilation":
        result = dilation(bgr, req.kernel_size, req.iterations)
    else:
        return {"error": f"Unknown operation: {req.operation}"}

    result = merge_alpha(result, alpha)
    return {"image": encode_image(result)}
