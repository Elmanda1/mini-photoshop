"""
Color Processing Router — Module 6
Grayscale, channel split, hue/saturation.
"""

from fastapi import APIRouter
from pydantic import BaseModel
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import decode_image, encode_image, ensure_3channel, merge_alpha
from services.color_service import to_grayscale, split_channel, adjust_hue_saturation, colorize

router = APIRouter(prefix="/api", tags=["Color"])


class ColorRequest(BaseModel):
    image: str
    operation: str  # grayscale, channel_split, hue_saturation, colorize
    channel: str = "r"  # r, g, b
    hue_shift: int = 0
    saturation_scale: float = 1.0
    hex_color: str = "#ff0000"
    intensity: float = 0.5


@router.post("/color")
async def color_endpoint(req: ColorRequest):
    """Apply color processing operations."""
    img = decode_image(req.image)
    bgr, alpha = ensure_3channel(img)

    if req.operation == "grayscale":
        result = to_grayscale(bgr)
    elif req.operation == "channel_split":
        result = split_channel(bgr, req.channel)
    elif req.operation == "hue_saturation":
        result = adjust_hue_saturation(bgr, req.hue_shift, req.saturation_scale)
    elif req.operation == "colorize":
        result = colorize(bgr, req.hex_color, req.intensity)
    else:
        return {"error": f"Unknown operation: {req.operation}"}

    result = merge_alpha(result, alpha)
    return {"image": encode_image(result)}
