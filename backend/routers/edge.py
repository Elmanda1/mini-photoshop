"""
Edge Detection & Binary Router — Module 5
Six edge methods + thresholding + morphology.
"""

from fastapi import APIRouter
from pydantic import BaseModel
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import decode_image, encode_image
from services.edge_service import (
    canny_edge, sobel_edge, prewitt_edge, robert_edge,
    laplacian_edge, log_edge, threshold_binary, erosion, dilation
)

router = APIRouter(prefix="/api", tags=["Edge Detection"])


class EdgeRequest(BaseModel):
    image: str
    operation: str  # canny, sobel, prewitt, robert, laplacian, log, threshold, erosion, dilation
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

    if req.operation == "canny":
        result = canny_edge(img, req.threshold1, req.threshold2)
    elif req.operation == "sobel":
        result = sobel_edge(img, req.kernel_size)
    elif req.operation == "prewitt":
        result = prewitt_edge(img)
    elif req.operation == "robert":
        result = robert_edge(img)
    elif req.operation == "laplacian":
        result = laplacian_edge(img)
    elif req.operation == "log":
        result = log_edge(img, req.sigma)
    elif req.operation == "threshold":
        result = threshold_binary(img, req.thresh_value)
    elif req.operation == "erosion":
        result = erosion(img, req.kernel_size, req.iterations)
    elif req.operation == "dilation":
        result = dilation(img, req.kernel_size, req.iterations)
    else:
        return {"error": f"Unknown operation: {req.operation}"}

    return {"image": encode_image(result)}
