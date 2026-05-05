"""
Color Processing Router — Module 6
Grayscale, channel split, hue/saturation.
"""

from fastapi import APIRouter
from pydantic import BaseModel
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import decode_image, encode_image
from services.color_service import to_grayscale, split_channel, adjust_hue_saturation

router = APIRouter(prefix="/api", tags=["Color"])


class ColorRequest(BaseModel):
    image: str
    operation: str  # grayscale, channel_split, hue_saturation
    channel: str = "r"  # r, g, b
    hue_shift: int = 0
    saturation_scale: float = 1.0


@router.post("/color")
async def color_endpoint(req: ColorRequest):
    """Apply color processing operations."""
    img = decode_image(req.image)

    if req.operation == "grayscale":
        result = to_grayscale(img)
    elif req.operation == "channel_split":
        result = split_channel(img, req.channel)
    elif req.operation == "hue_saturation":
        result = adjust_hue_saturation(img, req.hue_shift, req.saturation_scale)
    else:
        return {"error": f"Unknown operation: {req.operation}"}

    return {"image": encode_image(result)}
