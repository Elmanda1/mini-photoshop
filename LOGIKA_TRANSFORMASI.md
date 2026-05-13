# Logika Transformasi Geometrik — Mini Photoshop

Dokumen ini menjelaskan logika dan implementasi modul **Geometric Transformation** (Modul 3) pada aplikasi Mini Photoshop, mencakup Rotasi, Translasi, Flipping, Resizing, dan Cropping.

## 1. Rotasi (Rotate)
**File:** `backend/services/transform_service.py` -> `rotate_image`

Memutar gambar berdasarkan sudut tertentu (derajat). Implementasi ini mencakup perhitungan "bounding box" baru agar seluruh bagian gambar yang diputar tetap terlihat (tidak terpotong).

```python
def rotate_image(img: np.ndarray, angle: float) -> np.ndarray:
    h, w = img.shape[:2]
    center = (w // 2, h // 2)
    
    # CSS rotates clockwise, OpenCV rotates counter-clockwise.
    angle_cv = -angle
    M = cv2.getRotationMatrix2D(center, angle_cv, 1.0)
    
    # Hitung ukuran bounding box baru agar gambar tidak terpotong
    cos = np.abs(M[0, 0])
    sin = np.abs(M[0, 1])
    new_w = int(h * sin + w * cos)
    new_h = int(h * cos + w * sin)
    
    # Sesuaikan matriks rotasi untuk center yang baru
    M[0, 2] += (new_w - w) / 2
    M[1, 2] += (new_h - h) / 2
    
    return cv2.warpAffine(img, M, (new_w, new_h))
```

## 2. Translasi (Translate/Shift)
**File:** `backend/services/transform_service.py` -> `translate_image`

Menggeser posisi gambar secara horizontal (tx) dan vertikal (ty) menggunakan matriks transformasi affine.

```python
def translate_image(img: np.ndarray, tx: int, ty: int) -> np.ndarray:
    h, w = img.shape[:2]
    # Matriks transformasi: [[1, 0, tx], [0, 1, ty]]
    M = np.float32([[1, 0, tx], [0, 1, ty]])
    return cv2.warpAffine(img, M, (w, h))
```

## 3. Flipping (Mirroring)
**File:** `backend/services/transform_service.py` -> `flip_image`

Membalikkan gambar secara horizontal, vertikal, atau keduanya.
- `1`: Horizontal (kiri-kanan)
- `0`: Vertikal (atas-bawah)
- `-1`: Keduanya

```python
def flip_image(img: np.ndarray, flip_code: int) -> np.ndarray:
    return cv2.flip(img, flip_code)
```

## 4. Resize (Scaling)
**File:** `backend/services/transform_service.py` -> `resize_image`

Mengubah ukuran gambar berdasarkan faktor skala atau dimensi spesifik (lebar/tinggi). Menggunakan interpolasi `LINEAR` untuk hasil halus atau `NEAREST` untuk performa cepat.

```python
def resize_image(img: np.ndarray, scale: float = 1.0, width: int = None, height: int = None) -> np.ndarray:
    if width and height:
        return cv2.resize(img, (width, height), interpolation=cv2.INTER_LINEAR)
    return cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_LINEAR)
```

## 5. Cropping
**File:** `backend/services/transform_service.py` -> `crop_image`

Memotong bagian tertentu dari gambar menggunakan indexing array NumPy `[y1:y2, x1:x2]`.
