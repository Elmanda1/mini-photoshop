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


def colorize(img: np.ndarray, hex_color: str, intensity: float = 0.5) -> np.ndarray:
    """
    Colorize/tint an image with a specific color.
    Uses HSV color space to preserve the original luminosity (V channel).
    
    Args:
        img: Input BGR image
        hex_color: Hex color string (e.g. "#ff0000" or "ff0000")
        intensity: Blending intensity (0.0 to 1.0)
        
    Returns:
        Color-tinted image
    """
    if hex_color.startswith("#"):
        hex_color = hex_color[1:]
        
    # Parse hex color
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    
    # Create solid color image in BGR
    color_bgr = np.zeros_like(img)
    color_bgr[:, :, 0] = b
    color_bgr[:, :, 1] = g
    color_bgr[:, :, 2] = r
    
    # Extract HSV channels of original and solid color
    hsv_orig = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv_color = cv2.cvtColor(color_bgr, cv2.COLOR_BGR2HSV).astype(np.float32)
    
    # Create the colorized HSV: keep original V (luminance), replace H and S
    colorized_hsv = hsv_orig.copy()
    colorized_hsv[:, :, 0] = hsv_color[:, :, 0] # Replace Hue
    colorized_hsv[:, :, 1] = hsv_color[:, :, 1] # Replace Saturation
    
    colorized_bgr = cv2.cvtColor(colorized_hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
    
    # Blend colorized image with original image by intensity
    return cv2.addWeighted(img, 1.0 - intensity, colorized_bgr, intensity, 0)

