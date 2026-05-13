"""
Image Compression Service — Module 8
JPEG quality simulation and file size comparison.
"""

import cv2
import numpy as np


def compress_jpeg(img: np.ndarray, quality: int = 80) -> tuple:
    """
    Compress image with specified JPEG quality.
    
    Returns:
        Tuple of (compressed_image, original_size_bytes, compressed_size_bytes)
    """
    # Ensure quality is within valid range (1-100)
    quality = max(1, min(100, int(quality)))
    
    # Get original size for comparison
    _, orig_buf = cv2.imencode('.png', img)
    original_size = len(orig_buf)
    
    # Encode with quality parameter
    encode_params = [cv2.IMWRITE_JPEG_QUALITY, quality]
    success, comp_buf = cv2.imencode('.jpg', img, encode_params)
    
    if not success:
        # Fallback to original if encoding fails
        return img, original_size, original_size
        
    compressed_size = len(comp_buf)
    
    # Decode back to image format
    compressed_img = cv2.imdecode(comp_buf, cv2.IMREAD_COLOR)
    
    return compressed_img, original_size, compressed_size

