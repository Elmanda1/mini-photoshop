"""
Image Management Service — Module 1
Handles load, save, and format conversion of images.
"""

import cv2
import numpy as np


def load_image(img: np.ndarray) -> np.ndarray:
    """
    Process a loaded image. Returns the image as-is after validation.
    The actual decoding from Base64 is handled by utils.decode_image.
    """
    if img is None or img.size == 0:
        raise ValueError("Invalid image data")
    return img


def save_image(img: np.ndarray, fmt: str = "png", quality: int = 95) -> tuple:
    """
    Encode image to the specified format with quality settings.
    
    Args:
        img: OpenCV image (BGR)
        fmt: Output format — 'png', 'jpg', 'bmp'
        quality: JPEG quality (1-100), only used for jpg format
        
    Returns:
        Tuple of (encoded_bytes, mime_type)
    """
    fmt = fmt.lower().strip(".")
    
    encode_params = []
    if fmt in ("jpg", "jpeg"):
        encode_params = [cv2.IMWRITE_JPEG_QUALITY, quality]
        ext = ".jpg"
        mime = "image/jpeg"
    elif fmt == "png":
        encode_params = [cv2.IMWRITE_PNG_COMPRESSION, 6]
        ext = ".png"
        mime = "image/png"
    elif fmt == "bmp":
        ext = ".bmp"
        mime = "image/bmp"
    else:
        raise ValueError(f"Unsupported format: {fmt}")
    
    success, buffer = cv2.imencode(ext, img, encode_params if encode_params else None)
    if not success:
        raise ValueError(f"Failed to encode image as {fmt}")
    
    return buffer.tobytes(), mime
