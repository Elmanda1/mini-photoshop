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


def compress_rle(img: np.ndarray) -> tuple:
    """
    Simulate Lossless RLE (Run-Length Encoding) compression.
    Since RLE is lossless, the image content remains identical.
    We estimate the size reduction by encoding the flattened array.
    
    Returns:
        Tuple of (original_image, original_size_bytes, estimated_rle_size_bytes)
    """
    # Get original size (PNG for lossless comparison)
    _, orig_buf = cv2.imencode('.png', img)
    original_size = len(orig_buf)
    
    # Flatten image to 1D to perform RLE on the raw pixel data
    flat = img.flatten()
    
    # Simple RLE implementation for size estimation
    if len(flat) == 0:
        return img, original_size, original_size
        
    # We store as (count, value) pairs. 
    # A simple estimation: 1 byte for count, 1 byte for value per run.
    # In reality, RLE depends on pixel similarities.
    
    # Find indices where values change
    changes = np.where(flat[:-1] != flat[1:])[0]
    # Number of runs = number of changes + 1
    num_runs = len(changes) + 1
    
    # Estimated RLE size: each run takes ~2 bytes (count + value)
    # Plus some overhead for headers
    estimated_size = num_runs * 2 + 1024 
    
    # For very complex images, RLE can be larger than raw. 
    # But usually smaller than a PNG.
    return img, original_size, estimated_size


def _calculate_entropy(img: np.ndarray) -> float:
    """Helper to calculate Shannon entropy of the image."""
    # Convert to grayscale for entropy calculation
    if len(img.shape) == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img
        
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
    hist = hist.ravel() / hist.sum()
    logs = np.log2(hist + 1e-10)
    entropy = -np.sum(hist * logs)
    return float(entropy)


def compress_huffman(img: np.ndarray) -> tuple:
    """Simulate Lossless Huffman Encoding."""
    _, orig_buf = cv2.imencode('.png', img)
    original_size = len(orig_buf)
    
    entropy = _calculate_entropy(img)
    # Total bits = entropy * width * height * channels
    # Divide by 8 for bytes
    num_pixels = img.shape[0] * img.shape[1]
    num_channels = img.shape[2] if len(img.shape) == 3 else 1
    estimated_size = int((entropy * num_pixels * num_channels) / 8) + 512
    
    return img, original_size, min(estimated_size, original_size)


def compress_arithmetic(img: np.ndarray) -> tuple:
    """Simulate Lossless Arithmetic Encoding (typically 5-10% better than Huffman)."""
    img, original_size, huffman_size = compress_huffman(img)
    # Arithmetic is slightly more efficient
    estimated_size = int(huffman_size * 0.92) + 256
    return img, original_size, min(estimated_size, original_size)


def compress_lzw(img: np.ndarray) -> tuple:
    """Simulate Lossless LZW Encoding."""
    _, orig_buf = cv2.imencode('.png', img)
    original_size = len(orig_buf)
    
    # LZW efficiency varies, but for images it's often similar to PNG/GIF
    # We'll use a heuristic based on image complexity
    entropy = _calculate_entropy(img)
    complexity_factor = entropy / 8.0 # 0.0 to 1.0
    
    num_pixels = img.shape[0] * img.shape[1]
    num_channels = img.shape[2] if len(img.shape) == 3 else 1
    # Base size + variable size based on complexity
    estimated_size = int(original_size * (0.3 + 0.5 * complexity_factor))
    
    return img, original_size, min(estimated_size, original_size)

