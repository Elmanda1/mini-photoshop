"""
Color Processing Service — Module 6
Grayscale, channel splitting, hue & saturation adjustment.
"""

import cv2
import numpy as np


def to_grayscale(img: np.ndarray) -> np.ndarray:
    """Convert image to grayscale (returns 3-channel for consistency)."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)


def split_channel(img: np.ndarray, channel: str) -> np.ndarray:
    """
    Extract a single color channel.
    
    Args:
        img: Input image (BGR)
        channel: 'r', 'g', or 'b'
        
    Returns:
        Single-channel image displayed as BGR (other channels zeroed)
    """
    result = np.zeros_like(img)
    channel = channel.lower()
    
    if channel == "b":
        result[:, :, 0] = img[:, :, 0]
    elif channel == "g":
        result[:, :, 1] = img[:, :, 1]
    elif channel == "r":
        result[:, :, 2] = img[:, :, 2]
    else:
        raise ValueError(f"Invalid channel: {channel}. Use 'r', 'g', or 'b'.")
    
    return result


def adjust_hue_saturation(img: np.ndarray, hue_shift: int = 0, saturation_scale: float = 1.0) -> np.ndarray:
    """
    Adjust hue and saturation via HSV color space.
    
    Args:
        img: Input image (BGR)
        hue_shift: Hue offset (-180 to 180)
        saturation_scale: Saturation multiplier (0.0 to 3.0)
        
    Returns:
        Color-adjusted image
    """
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
    
    # Adjust hue (wraps around 0-180 in OpenCV)
    hsv[:, :, 0] = (hsv[:, :, 0] + hue_shift) % 180
    
    # Adjust saturation
    hsv[:, :, 1] = np.clip(hsv[:, :, 1] * saturation_scale, 0, 255)
    
    hsv = hsv.astype(np.uint8)
    return cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
