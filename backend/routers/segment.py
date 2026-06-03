"""
Segmentation Router — Module 7
Threshold, edge-based, region-based segmentation.
"""

from fastapi import APIRouter
from pydantic import BaseModel
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import decode_image, encode_image, ensure_3channel, merge_alpha
from services.segment_service import (
    threshold_segmentation, edge_segmentation, region_segmentation
)

router = APIRouter(prefix="/api", tags=["Segmentation"])


class SegmentRequest(BaseModel):
    image: str
    method: str = "threshold"  # threshold, edge, region
    threshold: int = 127
    threshold1: int = 50
    threshold2: int = 150
    num_regions: int = 3


@router.post("/segment")
async def segment_endpoint(req: SegmentRequest):
    """Apply image segmentation."""
    img = decode_image(req.image)
    bgr, alpha = ensure_3channel(img)

    if req.method == "threshold":
        result = threshold_segmentation(bgr, req.threshold)
    elif req.method == "edge":
        result = edge_segmentation(bgr, req.threshold1, req.threshold2)
    elif req.method == "region":
        result = region_segmentation(bgr, req.num_regions)
    else:
        return {"error": f"Unknown method: {req.method}"}

    result = merge_alpha(result, alpha)
    return {"image": encode_image(result)}
