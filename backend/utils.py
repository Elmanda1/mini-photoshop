"""
Shared utilities for Mini Photoshop backend.
Handles Base64 encoding/decoding and color space conversion.
"""

import base64
import numpy as np
import cv2


def decode_image(base64_str: str) -> np.ndarray:
    """
    Decode a Base64-encoded image string to an OpenCV image (BGR format).
    
    Args:
        base64_str: Base64-encoded image string
        
    Returns:
        OpenCV image as numpy ndarray in BGR format
        
    Raises:
        ValueError: If the image cannot be decoded
    """
    try:
        img_bytes = base64.b64decode(base64_str)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Failed to decode image — invalid image data")
        return img
    except Exception as e:
        raise ValueError(f"Image decode error: {str(e)}")


def encode_image(img: np.ndarray, fmt: str = ".png") -> str:
    """
    Encode an OpenCV image (BGR format) to a Base64 string.
    
    Args:
        img: OpenCV image as numpy ndarray in BGR format
        fmt: Output format extension (e.g., '.png', '.jpg', '.bmp')
        
    Returns:
        Base64-encoded image string
        
    Raises:
        ValueError: If the image cannot be encoded
    """
    try:
        success, buffer = cv2.imencode(fmt, img)
        if not success:
            raise ValueError(f"Failed to encode image to {fmt}")
        return base64.b64encode(buffer).decode("utf-8")
    except Exception as e:
        raise ValueError(f"Image encode error: {str(e)}")


def bgr_to_rgb(img: np.ndarray) -> np.ndarray:
    """Convert OpenCV BGR image to RGB."""
    return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)


def rgb_to_bgr(img: np.ndarray) -> np.ndarray:
    """Convert RGB image to OpenCV BGR."""
    return cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
