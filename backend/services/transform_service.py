"""
Geometric Transformation Service — Module 3
Rotate, flip, crop, resize, and translate.
"""

import cv2
import numpy as np


def _crop_to_alpha_content(img: np.ndarray) -> np.ndarray:
    """Trim transparent padding while preserving visible pixels."""
    if img.ndim != 3 or img.shape[2] != 4:
        return img

    alpha = img[:, :, 3]
    coords = cv2.findNonZero((alpha > 0).astype(np.uint8))
    if coords is None:
        return img

    x, y, w, h = cv2.boundingRect(coords)
    return img[y:y + h, x:x + w].copy()


def rotate_image(img: np.ndarray, angle: float) -> np.ndarray:
    """
    Rotate image by a given angle (degrees).
    The image canvas expands to fit the full rotated image so nothing is cropped.
    Fills rotated corners with transparency.
    
    Args:
        img: Input image (BGR or BGRA)
        angle: Rotation angle in degrees (0–360)
        
    Returns:
        Rotated image (BGRA)
    """
    h, w = img.shape[:2]
    center = (w / 2.0, h / 2.0)
    
    # CSS rotates clockwise, OpenCV rotates counter-clockwise.
    # Negate the angle to match frontend behavior.
    angle_cv = -angle
    M = cv2.getRotationMatrix2D(center, angle_cv, 1.0)
    
    # Calculate new bounding box size
    cos = np.abs(M[0, 0])
    sin = np.abs(M[0, 1])
    new_w = int(np.ceil(h * sin + w * cos))
    new_h = int(np.ceil(h * cos + w * sin))
    
    # Adjust the rotation matrix for the new center
    M[0, 2] += (new_w - w) / 2.0
    M[1, 2] += (new_h - h) / 2.0
    
    # Use the existing alpha channel as the content mask. This prevents
    # transparent padding from previous rotations from growing repeatedly.
    if img.ndim == 3 and img.shape[2] == 4:
        source_mask = img[:, :, 3]
    else:
        source_mask = np.ones((h, w), dtype=np.uint8) * 255

    # Ensure image has an alpha channel for transparent borders
    if img.ndim == 3 and img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
    elif img.ndim == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGRA)
        
    # Warp image content
    warped = cv2.warpAffine(img, M, (new_w, new_h), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    
    # Warp the mask to locate original pixels versus transparent background
    warped_mask = cv2.warpAffine(source_mask, M, (new_w, new_h), flags=cv2.INTER_NEAREST, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    
    # Force the alpha channel to match the warped mask precisely
    warped[:, :, 3] = warped_mask
    
    return _crop_to_alpha_content(warped)






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


def crop_image(img: np.ndarray, x1: int, y1: int, x2: int, y2: int, target_w: int = None, target_h: int = None) -> np.ndarray:
    """
    Crop image and optionally resize the result.
    """
    h, w = img.shape[:2]
    x1 = max(0, min(x1, w))
    y1 = max(0, min(y1, h))
    x2 = max(0, min(x2, w))
    y2 = max(0, min(y2, h))
    
    if x2 <= x1 or y2 <= y1:
        raise ValueError("Invalid crop coordinates")
    
    cropped = img[y1:y2, x1:x2]
    
    if target_w and target_h:
        return cv2.resize(cropped, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
    
    return cropped.copy()


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
    Keeps the canvas size fixed, matching common editor move/translate behavior.
    Empty areas are transparent and pixels moved outside the canvas are clipped.
    
    Args:
        img: Input image (BGR or BGRA)
        tx: Horizontal translation (pixels)
        ty: Vertical translation (pixels)
        
    Returns:
        Translated image (BGRA), with the same width and height as input
    """
    h, w = img.shape[:2]
    
    # Ensure image has an alpha channel for transparent borders
    if img.ndim == 3 and img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
        
    matrix = np.float32([[1, 0, tx], [0, 1, ty]])
    return cv2.warpAffine(
        img,
        matrix,
        (w, h),
        flags=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=(0, 0, 0, 0),
    )
