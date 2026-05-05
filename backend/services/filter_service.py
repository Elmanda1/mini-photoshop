"""
Noise Reduction / Image Restoration Service — Module 4
Gaussian blur, median filter, and salt & pepper noise handling.
"""

import cv2
import numpy as np


def gaussian_blur(img: np.ndarray, kernel_size: int = 5) -> np.ndarray:
    """
    Apply Gaussian blur for noise reduction.
    
    Args:
        img: Input image (BGR)
        kernel_size: Kernel size (odd, 3-31)
        
    Returns:
        Blurred image
    """
    ksize = max(3, kernel_size)
    if ksize % 2 == 0:
        ksize += 1
    return cv2.GaussianBlur(img, (ksize, ksize), 0)


def median_filter(img: np.ndarray, kernel_size: int = 5) -> np.ndarray:
    """
    Apply median filter — effective for salt & pepper noise removal.
    
    Args:
        img: Input image (BGR)
        kernel_size: Kernel size (odd, 3-31)
        
    Returns:
        Filtered image
    """
    ksize = max(3, kernel_size)
    if ksize % 2 == 0:
        ksize += 1
    return cv2.medianBlur(img, ksize)


def add_salt_pepper_noise(img: np.ndarray, amount: float = 0.05) -> np.ndarray:
    """
    Add salt and pepper noise to an image for demonstration.
    
    Args:
        img: Input image (BGR)
        amount: Proportion of pixels affected (0.0 to 0.5)
        
    Returns:
        Noisy image
    """
    noisy = img.copy()
    h, w = noisy.shape[:2]
    num_pixels = int(amount * h * w)
    
    # Salt (white)
    coords_salt = (
        np.random.randint(0, h, num_pixels),
        np.random.randint(0, w, num_pixels)
    )
    noisy[coords_salt] = 255
    
    # Pepper (black)
    coords_pepper = (
        np.random.randint(0, h, num_pixels),
        np.random.randint(0, w, num_pixels)
    )
    noisy[coords_pepper] = 0
    
    return noisy


def remove_noise(img: np.ndarray, method: str = "median", kernel_size: int = 5) -> np.ndarray:
    """
    Remove noise using the specified method.
    
    Args:
        img: Input image (BGR)
        method: 'gaussian' or 'median'
        kernel_size: Filter kernel size
        
    Returns:
        Denoised image
    """
    if method == "gaussian":
        return gaussian_blur(img, kernel_size)
    elif method == "median":
        return median_filter(img, kernel_size)
    else:
        raise ValueError(f"Unknown noise removal method: {method}")
