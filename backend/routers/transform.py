"""
Geometric Transformation Router — Module 3
Rotate, flip, crop, resize, translate.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import decode_image, encode_image
from services.transform_service import (
    rotate_image, flip_image, crop_image, resize_image, translate_image
)

router = APIRouter(prefix="/api", tags=["Transform"])


class TransformRequest(BaseModel):
    image: str
    operation: str  # rotate, flip, crop, resize, translate
    angle: float = 0        # for rotate
    flip_code: int = 1      # 0=vertical, 1=horizontal, -1=both
    x1: int = 0             # for crop
    y1: int = 0
    x2: int = 0
    y2: int = 0
    scale: float = 1.0      # for resize
    width: Optional[int] = None
    height: Optional[int] = None
    interpolation: str = "linear"
    tx: int = 0             # for translate
    ty: int = 0
    target_w: Optional[int] = None # for crop-then-resize
    target_h: Optional[int] = None


@router.post("/transform")
async def transform_endpoint(req: TransformRequest):
    """Apply geometric transformation."""
    img = decode_image(req.image)

    if req.operation == "rotate":
        result = rotate_image(img, req.angle)
    elif req.operation == "flip":
        result = flip_image(img, req.flip_code)
    elif req.operation == "crop":
        result = crop_image(img, req.x1, req.y1, req.x2, req.y2, req.target_w, req.target_h)
    elif req.operation == "resize":
        result = resize_image(img, req.scale, req.width, req.height, req.interpolation)
    elif req.operation == "translate":
        result = translate_image(img, req.tx, req.ty)
    else:
        return {"error": f"Unknown operation: {req.operation}"}

    return {"image": encode_image(result)}
