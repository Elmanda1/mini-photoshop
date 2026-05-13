"""
Edge Detection & Binary Processing Service — Module 5
Six edge detection methods + thresholding + morphology.
"""

import cv2
import numpy as np


def _to_gray(img: np.ndarray) -> np.ndarray:
    """Convert to grayscale if needed."""
    if len(img.shape) == 3:
        return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return img


def canny_edge(img: np.ndarray, threshold1: int = 100, threshold2: int = 200) -> np.ndarray:
    """Canny edge detection."""
    gray = _to_gray(img)
    edges = cv2.Canny(gray, threshold1, threshold2)
    return cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)


def sobel_edge(img: np.ndarray, ksize: int = 3) -> np.ndarray:
    """Sobel edge detection — combines X and Y gradients."""
    gray = _to_gray(img)
    sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=ksize)
    sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=ksize)
    magnitude = cv2.magnitude(sobelx, sobely)
    # Use normalize instead of clip: magnitude can far exceed 255
    magnitude = cv2.normalize(magnitude, None, 0, 255, cv2.NORM_MINMAX)
    return cv2.cvtColor(np.uint8(magnitude), cv2.COLOR_GRAY2BGR)


def prewitt_edge(img: np.ndarray) -> np.ndarray:
    """Prewitt edge detection using manual kernels."""
    gray = _to_gray(img)
    
    kernel_x = np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], dtype=np.float32)
    kernel_y = np.array([[-1, -1, -1], [0, 0, 0], [1, 1, 1]], dtype=np.float32)
    
    prewitt_x = cv2.filter2D(gray, cv2.CV_64F, kernel_x)
    prewitt_y = cv2.filter2D(gray, cv2.CV_64F, kernel_y)
    
    magnitude = cv2.magnitude(prewitt_x, prewitt_y)
    # Use normalize instead of clip
    magnitude = cv2.normalize(magnitude, None, 0, 255, cv2.NORM_MINMAX)
    return cv2.cvtColor(np.uint8(magnitude), cv2.COLOR_GRAY2BGR)


def robert_edge(img: np.ndarray) -> np.ndarray:
    """Robert cross-gradient edge detection."""
    gray = _to_gray(img)
    
    kernel_x = np.array([[1, 0], [0, -1]], dtype=np.float32)
    kernel_y = np.array([[0, 1], [-1, 0]], dtype=np.float32)
    
    robert_x = cv2.filter2D(gray, cv2.CV_64F, kernel_x)
    robert_y = cv2.filter2D(gray, cv2.CV_64F, kernel_y)
    
    magnitude = cv2.magnitude(robert_x, robert_y)
    # Use normalize instead of clip
    magnitude = cv2.normalize(magnitude, None, 0, 255, cv2.NORM_MINMAX)
    return cv2.cvtColor(np.uint8(magnitude), cv2.COLOR_GRAY2BGR)


def laplacian_edge(img: np.ndarray) -> np.ndarray:
    """Laplacian edge detection."""
    gray = _to_gray(img)
    lap = cv2.Laplacian(gray, cv2.CV_64F)
    # Use normalize instead of direct abs cast: abs can overflow uint8
    lap_abs = np.abs(lap)
    lap_norm = cv2.normalize(lap_abs, None, 0, 255, cv2.NORM_MINMAX)
    return cv2.cvtColor(np.uint8(lap_norm), cv2.COLOR_GRAY2BGR)


def log_edge(img: np.ndarray, sigma: float = 1.0) -> np.ndarray:
    """Laplacian of Gaussian (LoG) edge detection."""
    gray = _to_gray(img)
    # Apply Gaussian blur first
    ksize = int(6 * sigma + 1)
    if ksize % 2 == 0:
        ksize += 1
    blurred = cv2.GaussianBlur(gray, (ksize, ksize), sigma)
    # Then apply Laplacian
    log = cv2.Laplacian(blurred, cv2.CV_64F)
    # Use normalize instead of direct abs cast
    log_abs = np.abs(log)
    log_norm = cv2.normalize(log_abs, None, 0, 255, cv2.NORM_MINMAX)
    return cv2.cvtColor(np.uint8(log_norm), cv2.COLOR_GRAY2BGR)


def threshold_binary(img: np.ndarray, thresh: int = 127, max_val: int = 255) -> np.ndarray:
    """Apply binary thresholding."""
    gray = _to_gray(img)
    _, binary = cv2.threshold(gray, thresh, max_val, cv2.THRESH_BINARY)
    return cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)


def erosion(img: np.ndarray, kernel_size: int = 5, iterations: int = 1) -> np.ndarray:
    """Apply morphological erosion."""
    kernel = np.ones((kernel_size, kernel_size), np.uint8)
    return cv2.erode(img, kernel, iterations=iterations)


def dilation(img: np.ndarray, kernel_size: int = 5, iterations: int = 1) -> np.ndarray:
    """Apply morphological dilation."""
    kernel = np.ones((kernel_size, kernel_size), np.uint8)
    return cv2.dilate(img, kernel, iterations=iterations)
