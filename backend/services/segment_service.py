"""
Image Segmentation Service — Module 7
Threshold-based, edge-based, and region-based segmentation.
"""

import cv2
import numpy as np


def threshold_segmentation(img: np.ndarray, thresh: int = 127) -> np.ndarray:
    """
    Simple threshold-based segmentation.
    Converts to grayscale, applies binary threshold, then masks original image.
    
    Args:
        img: Input image (BGR)
        thresh: Threshold value (0-255)
        
    Returns:
        Segmented image
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, mask = cv2.threshold(gray, thresh, 255, cv2.THRESH_BINARY)
    
    # Apply mask to original image
    result = cv2.bitwise_and(img, img, mask=mask)
    return result


def edge_segmentation(img: np.ndarray, threshold1: int = 50, threshold2: int = 150) -> np.ndarray:
    """
    Edge-based segmentation using Canny edges and contour filling.
    
    Args:
        img: Input image (BGR)
        threshold1: Canny lower threshold
        threshold2: Canny upper threshold
        
    Returns:
        Segmented image with detected regions filled
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, threshold1, threshold2)
    
    # Dilate edges to close gaps
    kernel = np.ones((3, 3), np.uint8)
    dilated = cv2.dilate(edges, kernel, iterations=2)
    
    # Find contours and fill them
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    mask = np.zeros(gray.shape, dtype=np.uint8)
    cv2.drawContours(mask, contours, -1, 255, -1)  # Fill contours
    
    result = cv2.bitwise_and(img, img, mask=mask)
    return result


def region_segmentation(img: np.ndarray, num_regions: int = 3) -> np.ndarray:
    """
    Region-based segmentation using K-means clustering.
    
    Args:
        img: Input image (BGR)
        num_regions: Number of color clusters (2-10)
        
    Returns:
        Segmented image with reduced color palette
    """
    # Reshape image to 2D array of pixels
    pixel_data = img.reshape((-1, 3)).astype(np.float32)
    
    # K-means clustering
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
    _, labels, centers = cv2.kmeans(
        pixel_data, num_regions, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS
    )
    
    # Convert centers back to uint8 and reconstruct image
    centers = np.uint8(centers)
    segmented = centers[labels.flatten()]
    segmented = segmented.reshape(img.shape)
    
    return segmented
