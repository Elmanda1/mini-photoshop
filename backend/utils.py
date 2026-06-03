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
        img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
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


def ensure_3channel(img: np.ndarray) -> tuple[np.ndarray, np.ndarray | None]:
    """
    If img has 4 channels (BGRA), returns (BGR, Alpha).
    Otherwise returns (img, None).
    """
    if img.ndim == 3 and img.shape[2] == 4:
        bgr = img[:, :, :3]
        alpha = img[:, :, 3]
        return bgr, alpha
    return img, None


def merge_alpha(bgr: np.ndarray, alpha: np.ndarray | None) -> np.ndarray:
    """
    If alpha is provided, merges it back with BGR to return BGRA.
    Otherwise returns BGR.
    """
    if alpha is not None:
        if bgr.shape[:2] != alpha.shape[:2]:
            alpha = cv2.resize(alpha, (bgr.shape[1], bgr.shape[0]), interpolation=cv2.INTER_NEAREST)
        return cv2.merge([bgr[:, :, 0], bgr[:, :, 1], bgr[:, :, 2], alpha])
    return bgr
