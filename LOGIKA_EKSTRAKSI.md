# Logika Ekstraksi & Segmentasi — Mini Photoshop

Dokumen ini menjelaskan berbagai logika "Extraction" yang ada di Mini Photoshop, mencakup pemisahan channel warna, ekstraksi region (segmentasi), hingga ekstraksi fitur ML.

## 1. Color Channel Extraction
**File:** `backend/services/color_service.py` -> `split_channel`

Mengekstraksi salah satu channel warna (Red, Green, atau Blue) dari gambar BGR. Hasilnya ditampilkan kembali dalam format BGR namun dengan dua channel lainnya di-nol-kan untuk visualisasi.

```python
def split_channel(img: np.ndarray, channel: str) -> np.ndarray:
    result = np.zeros_like(img)
    channel = channel.lower()
    if channel == "b":
        result[:, :, 0] = img[:, :, 0]
    elif channel == "g":
        result[:, :, 1] = img[:, :, 1]
    elif channel == "r":
        result[:, :, 2] = img[:, :, 2]
    return result
```

## 2. Image Segmentation (Region Extraction)
**File:** `backend/services/segment_service.py`

Modul ini mengekstraksi region tertentu dari gambar berdasarkan kriteria tertentu (threshold, edge, atau warna).

### A. Threshold-based Segmentation
Ekstraksi objek berdasarkan nilai ambang batas (threshold) intensitas piksel.
```python
def threshold_segmentation(img: np.ndarray, thresh: int = 127) -> np.ndarray:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, mask = cv2.threshold(gray, thresh, 255, cv2.THRESH_BINARY)
    return cv2.bitwise_and(img, img, mask=mask)
```

### B. Edge-based Segmentation
Mengekstraksi region dengan mendeteksi tepi (Canny), melakukan dilatasi untuk menutup celah, dan mengisi kontur (contour filling).
```python
def edge_segmentation(img: np.ndarray, threshold1: int = 50, threshold2: int = 150) -> np.ndarray:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, threshold1, threshold2)
    
    # Dilate edges to close gaps
    kernel = np.ones((3, 3), np.uint8)
    dilated = cv2.dilate(edges, kernel, iterations=2)
    
    # Find contours and fill them
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    mask = np.zeros(gray.shape, dtype=np.uint8)
    cv2.drawContours(mask, contours, -1, 255, -1)  # Fill contours
    
    return cv2.bitwise_and(img, img, mask=mask)
```

### C. Region-based (K-Means Clustering)
Ekstraksi region berdasarkan kemiripan warna menggunakan algoritma K-Means untuk mengurangi palet warna dan mengelompokkan piksel.
```python
def region_segmentation(img: np.ndarray, num_regions: int = 3) -> np.ndarray:
    pixel_data = img.reshape((-1, 3)).astype(np.float32)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
    _, labels, centers = cv2.kmeans(
        pixel_data, num_regions, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS
    )
    centers = np.uint8(centers)
    segmented = centers[labels.flatten()].reshape(img.shape)
    return segmented
```

## 3. ML Feature Extraction (Face/Person Detection)
**File:** `backend/routers/ml.py`

Mengekstraksi tingkat kepercayaan (confidence) dan label dari model ResNet SSD untuk mendeteksi keberadaan manusia/wajah dalam gambar.

```python
# Ekstraksi confidences dari hasil deteksi model
persons = []
for i in range(0, detections.shape[2]):
    confidence = float(detections[0, 0, i, 2])
    if confidence > 0.1:
        persons.append(confidence)
```
