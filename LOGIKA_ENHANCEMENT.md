# Logika Image Enhancement — Mini Photoshop

Dokumen ini menjelaskan logika dan implementasi modul **Image Enhancement** (Modul 2) pada aplikasi Mini Photoshop.

## 1. Brightness & Contrast Adjustment
**File:** `backend/services/enhance_service.py` -> `adjust_brightness_contrast`

Mengatur kecerahan dan kontras menggunakan logika yang ekuivalen dengan CSS filter.
- **Brightness:** Mengalikan nilai piksel dengan faktor brightness.
- **Contrast:** Melakukan penyesuaian kontras dengan titik pivot di 0.5 (tengah).

```python
def adjust_brightness_contrast(img: np.ndarray, brightness: float = 1.0, contrast: float = 1.0) -> np.ndarray:
    img_float = img.astype(np.float32) / 255.0
    # Apply brightness (multiplier)
    img_float = img_float * brightness
    # Apply contrast (pivot around 0.5)
    img_float = (img_float - 0.5) * contrast + 0.5
    return np.clip(img_float * 255.0, 0, 255).astype(np.uint8)
```

## 2. Histogram Equalization
**File:** `backend/services/enhance_service.py` -> `histogram_equalization`

Meningkatkan kontras global gambar dengan meratakan distribusi intensitas piksel. Untuk gambar berwarna, konversi ke ruang warna YCrCb dilakukan terlebih dahulu agar hanya channel Y (Luminance) yang diproses, sehingga informasi warna tetap terjaga.

```python
def histogram_equalization(img: np.ndarray) -> np.ndarray:
    if len(img.shape) == 2:
        return cv2.equalizeHist(img)
    # Convert to YCrCb to equalize luminance only
    ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    ycrcb[:, :, 0] = cv2.equalizeHist(ycrcb[:, :, 0])
    return cv2.cvtColor(ycrcb, cv2.COLOR_YCrCb2BGR)
```

## 3. Sharpening
**File:** `backend/services/enhance_service.py` -> `sharpen`

Mempertajam detail gambar menggunakan kernel **Unsharp Masking**. Intensitas penajaman dapat diatur melalui parameter.

```python
def sharpen(img: np.ndarray, intensity: float = 1.0) -> np.ndarray:
    kernel_adjusted = np.array([
        [0, -intensity, 0],
        [-intensity, 1 + 4 * intensity, -intensity],
        [0, -intensity, 0]
    ], dtype=np.float32)
    return cv2.filter2D(img, -1, kernel_adjusted)
```

## 4. Smoothing (Blur)
**File:** `backend/services/enhance_service.py` -> `blur`

Mengurangi noise dan menghaluskan gambar menggunakan **Gaussian Blur**.

```python
def blur(img: np.ndarray, kernel_size: int = 5) -> np.ndarray:
    ksize = max(3, kernel_size)
    if ksize % 2 == 0: ksize += 1
    return cv2.GaussianBlur(img, (ksize, ksize), 0)
```

## 5. Smart Enhance
**File:** `backend/services/enhance_service.py` -> `smart_enhance`

Kombinasi otomatis beberapa teknik untuk hasil instan yang optimal:
1. **CLAHE (Contrast Limited Adaptive Histogram Equalization):** Meningkatkan kontras secara lokal tanpa noise berlebih.
2. **Normalisasi:** Memastikan rentang warna digunakan secara penuh (0-255).
3. **Sharpening:** Memberikan detail tambahan.
