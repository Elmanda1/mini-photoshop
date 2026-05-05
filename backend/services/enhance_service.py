"""
Image Enhancement Service — Module 2
Brightness, contrast, histogram equalization, sharpening, and blur.
"""

import cv2
import numpy as np


def adjust_brightness_contrast(img: np.ndarray, brightness: int = 0, contrast: float = 1.0) -> np.ndarray:
    """
    Adjust brightness and contrast of an image.
    
    Args:
        img: Input image (BGR)
        brightness: Brightness offset (-100 to 100)
        contrast: Contrast multiplier (0.5 to 3.0)
        
    Returns:
        Enhanced image
    """
    # alpha = contrast, beta = brightness
    result = cv2.convertScaleAbs(img, alpha=contrast, beta=brightness)
    return result


def histogram_equalization(img: np.ndarray) -> np.ndarray:
    """
    Apply histogram equalization.
    For color images, converts to YCrCb and equalizes the Y channel
    to preserve color information.
    
    Args:
        img: Input image (BGR)
        
    Returns:
        Equalized image
    """
    if len(img.shape) == 2:
        # Grayscale
        return cv2.equalizeHist(img)
    
    # Convert to YCrCb to equalize luminance only
    ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    ycrcb[:, :, 0] = cv2.equalizeHist(ycrcb[:, :, 0])
    return cv2.cvtColor(ycrcb, cv2.COLOR_YCrCb2BGR)


def sharpen(img: np.ndarray, intensity: float = 1.0) -> np.ndarray:
    """
    Sharpen the image using an unsharp masking kernel.
    
    Args:
        img: Input image (BGR)
        intensity: Sharpening intensity (0.5 to 3.0)
        
    Returns:
        Sharpened image
    """
    # Standard sharpening kernel
    kernel = np.array([
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
    ], dtype=np.float32)
    
    # Scale the negative values by intensity
    kernel_adjusted = np.array([
        [0, -intensity, 0],
        [-intensity, 1 + 4 * intensity, -intensity],
        [0, -intensity, 0]
    ], dtype=np.float32)
    
    return cv2.filter2D(img, -1, kernel_adjusted)


def blur(img: np.ndarray, kernel_size: int = 5) -> np.ndarray:
    """
    Apply Gaussian blur to smooth the image.
    
    Args:
        img: Input image (BGR)
        kernel_size: Blur kernel size (must be odd, 3-31)
        
    Returns:
        Blurred image
    """
    # Ensure kernel size is odd
    ksize = max(3, kernel_size)
    if ksize % 2 == 0:
        ksize += 1
    
    return cv2.GaussianBlur(img, (ksize, ksize), 0)
