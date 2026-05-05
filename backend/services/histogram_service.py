"""
Histogram Analysis Service — Module 9
Calculate histogram data for grayscale and color channels.
"""

import cv2
import numpy as np


def calculate_histogram(img: np.ndarray) -> dict:
    """
    Calculate histogram for all channels.
    
    Returns:
        Dict with 'grayscale', 'r', 'g', 'b' histogram arrays (256 bins each)
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
    
    hist_gray = cv2.calcHist([gray], [0], None, [256], [0, 256]).flatten().tolist()
    
    result = {"grayscale": hist_gray}
    
    if len(img.shape) == 3:
        colors = ('b', 'g', 'r')
        for i, color in enumerate(colors):
            hist = cv2.calcHist([img], [i], None, [256], [0, 256]).flatten().tolist()
            result[color] = hist
    
    return result
