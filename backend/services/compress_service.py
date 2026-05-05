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
    quality = max(1, min(100, quality))
    
    _, orig_buf = cv2.imencode('.png', img)
    original_size = len(orig_buf)
    
    encode_params = [cv2.IMWRITE_JPEG_QUALITY, quality]
    _, comp_buf = cv2.imencode('.jpg', img, encode_params)
    compressed_size = len(comp_buf)
    
    compressed_img = cv2.imdecode(comp_buf, cv2.IMREAD_COLOR)
    
    return compressed_img, original_size, compressed_size
