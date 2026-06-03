"""
Geometric Transformation Service — Module 3
Rotate, flip, crop, resize, and translate.
"""

import cv2
import numpy as np


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
    new_w = int(h * sin + w * cos)
    new_h = int(h * cos + w * sin)
    
    # Adjust the rotation matrix for the new center
    M[0, 2] += (new_w - w) / 2.0
    M[1, 2] += (new_h - h) / 2.0
    
    # Ensure image has an alpha channel for transparent borders
    if img.ndim == 3 and img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
    elif img.ndim == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGRA)
        
    # Warp image content
    warped = cv2.warpAffine(img, M, (new_w, new_h), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    
    # Create an opaque mask for the original image footprint
    mask = np.ones((h, w), dtype=np.uint8) * 255
    
    # Warp the mask to locate original pixels versus transparent background
    warped_mask = cv2.warpAffine(mask, M, (new_w, new_h), flags=cv2.INTER_NEAREST, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    
    # Force the alpha channel to match the warped mask precisely
    warped[:, :, 3] = warped_mask
    
    return warped






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
    Expands the canvas dynamically so that no clipping/cropping of content occurs.
    Fills empty borders with transparency.
    Proportionally scales tx and ty if the image is full-resolution (w > 800)
    to match the frontend's 800px preview translation exactly.
    
    Args:
        img: Input image (BGR or BGRA)
        tx: Horizontal translation (pixels)
        ty: Vertical translation (pixels)
        
    Returns:
        Translated image (BGRA)
    """
    h, w = img.shape[:2]
    
    # Scale tx and ty proportionally if we are processing the full-resolution image
    # since the frontend downscales the image to a max-width of 800px during live preview.
    if w > 800:
        scale_factor = w / 800.0
        tx = int(round(tx * scale_factor))
        ty = int(round(ty * scale_factor))
    
    # Ensure image has an alpha channel for transparent borders
    if img.ndim == 3 and img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
        
    # Calculate new dimensions to prevent clipping/cropping of content
    new_w = w + abs(tx)
    new_h = h + abs(ty)
    
    # Determine the placement offset inside the new larger canvas
    # If tx > 0, we shift to the right, so we start at x = tx (padding on the left)
    # If tx < 0, we shift to the left, so we start at x = 0 (padding on the right)
    dx = tx if tx > 0 else 0
    dy = ty if ty > 0 else 0
    
    # Create new transparent canvas
    translated = np.zeros((new_h, new_w, 4), dtype=img.dtype)
    
    # Place the original image inside the expanded transparent canvas
    translated[dy:dy+h, dx:dx+w] = img
    
    return translated
