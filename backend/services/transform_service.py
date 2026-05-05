"""
Geometric Transformation Service — Module 3
Rotate, flip, crop, resize, and translate.
"""

import cv2
import numpy as np


def rotate_image(img: np.ndarray, angle: float) -> np.ndarray:
    """
    Rotate image by a given angle (degrees).
    The image canvas expands to fit the full rotated image.
    
    Args:
        img: Input image (BGR)
        angle: Rotation angle in degrees (0–360)
        
    Returns:
        Rotated image
    """
    h, w = img.shape[:2]
    center = (w // 2, h // 2)
    
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    
    # Calculate new bounding box size
    cos = np.abs(M[0, 0])
    sin = np.abs(M[0, 1])
    new_w = int(h * sin + w * cos)
    new_h = int(h * cos + w * sin)
    
    # Adjust the rotation matrix for the new center
    M[0, 2] += (new_w - w) / 2
    M[1, 2] += (new_h - h) / 2
    
    return cv2.warpAffine(img, M, (new_w, new_h))


def flip_image(img: np.ndarray, flip_code: int) -> np.ndarray:
    """
    Flip image.
    
    Args:
        img: Input image (BGR)
        flip_code: 0=vertical, 1=horizontal, -1=both
        
    Returns:
        Flipped image
    """
    return cv2.flip(img, flip_code)


def crop_image(img: np.ndarray, x1: int, y1: int, x2: int, y2: int) -> np.ndarray:
    """
    Crop image to the specified rectangle.
    
    Args:
        img: Input image (BGR)
        x1, y1: Top-left corner
        x2, y2: Bottom-right corner
        
    Returns:
        Cropped image
    """
    h, w = img.shape[:2]
    # Clamp coordinates to image bounds
    x1 = max(0, min(x1, w))
    y1 = max(0, min(y1, h))
    x2 = max(0, min(x2, w))
    y2 = max(0, min(y2, h))
    
    if x2 <= x1 or y2 <= y1:
        raise ValueError("Invalid crop coordinates")
    
    return img[y1:y2, x1:x2].copy()


def resize_image(img: np.ndarray, scale: float = 1.0, width: int = None, height: int = None,
                 interpolation: str = "linear") -> np.ndarray:
    """
    Resize image by scale factor or to specific dimensions.
    
    Args:
        img: Input image (BGR)
        scale: Scale factor (0.1 to 5.0). Ignored if width/height provided.
        width: Target width (optional)
        height: Target height (optional)
        interpolation: 'nearest' or 'linear'
        
    Returns:
        Resized image
    """
    interp = cv2.INTER_LINEAR if interpolation == "linear" else cv2.INTER_NEAREST
    
    if width and height:
        return cv2.resize(img, (width, height), interpolation=interp)
    
    if scale and scale != 1.0:
        return cv2.resize(img, None, fx=scale, fy=scale, interpolation=interp)
    
    return img


def translate_image(img: np.ndarray, tx: int, ty: int) -> np.ndarray:
    """
    Translate (shift) image by tx, ty pixels.
    
    Args:
        img: Input image (BGR)
        tx: Horizontal translation (pixels)
        ty: Vertical translation (pixels)
        
    Returns:
        Translated image
    """
    h, w = img.shape[:2]
    M = np.float32([[1, 0, tx], [0, 1, ty]])
    return cv2.warpAffine(img, M, (w, h))
