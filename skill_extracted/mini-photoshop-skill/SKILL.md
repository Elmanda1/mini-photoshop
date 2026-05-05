---
name: mini-photoshop
description: >
  Skill untuk proyek Mini Photoshop — aplikasi pengolahan citra digital
  berbasis Python (FastAPI) + React/Next.js, mata kuliah Pengolahan Citra Digital.
  
  GUNAKAN skill ini setiap kali user meminta bantuan terkait proyek ini, termasuk:
  - Mulai coding modul baru (enhancement, edge detection, segmentasi, dll)
  - Membuat endpoint FastAPI baru
  - Membuat komponen React/Next.js (ImageCanvas, ToolPanel, dll)
  - Bertanya soal OpenCV, NumPy, Pillow untuk pengolahan citra
  - Debugging error di backend Python atau frontend Next.js
  - Menanyakan cara implementasi algoritma citra (Canny, Sobel, Histogram Equalization, dll)
  - Pertanyaan soal model CNN / transfer learning untuk object recognition
  - Merencanakan sprint minggu ini
  - Membuat laporan / dokumentasi proyek
  
  Juga trigger jika user menyebut: "modul", "sprint", "OpenCV", "FastAPI endpoint",
  "histogram", "edge detection", "segmentasi", "kompresi", "CNN", "Before/After panel".
---

# Mini Photoshop — Project Skill

## Konteks Proyek

| Atribut | Detail |
|---|---|
| Nama Proyek | Mini Photoshop |
| Mata Kuliah | Pengolahan Citra Digital |
| Dosen | Rizki Elisa Nalawati, S.T., M.T. |
| Developer | Solo (1 orang) |
| Progress | Sprint mingguan (ada sharing progress tiap minggu) |

## Stack Teknologi

```
Backend  : Python + FastAPI + OpenCV + NumPy + Pillow
ML       : TensorFlow atau PyTorch (CNN, transfer learning)
Frontend : React / Next.js + Tailwind CSS
API      : REST (JSON + Base64 image encoding)
```

## Arsitektur Folder

```
mini-photoshop/
├── backend/
│   ├── main.py                  # FastAPI entry point + CORS
│   ├── routers/
│   │   ├── image.py             # load, save, reset
│   │   ├── enhance.py           # brightness, contrast, sharpen, blur
│   │   ├── transform.py         # rotate, flip, crop, resize, translate
│   │   ├── filter.py            # gaussian, median, salt&pepper
│   │   ├── edge.py              # canny, sobel, prewitt, robert, laplacian, LoG
│   │   ├── color.py             # grayscale, channel split, hue/sat
│   │   ├── segment.py           # threshold, edge-based, region
│   │   ├── compress.py          # JPEG quality simulation
│   │   └── ml.py                # CNN object recognition
│   └── services/                # Logika OpenCV murni (dipanggil oleh router)
│       ├── enhance_service.py
│       ├── transform_service.py
│       └── ... (satu file per modul)
└── frontend/
    ├── app/                     # Next.js App Router
    ├── components/
    │   ├── ImageCanvas.jsx      # Panel Before/After
    │   ├── ToolPanel.jsx        # Sidebar tool & slider
    │   ├── HistogramChart.jsx   # Chart.js histogram
    │   └── MLResult.jsx         # Tampilkan label + confidence
    └── lib/
        └── api.js               # Axios wrapper semua endpoint
```

## Daftar Endpoint

| Method | Endpoint | Modul |
|---|---|---|
| POST | /api/image/load | Upload gambar |
| POST | /api/image/save | Download hasil |
| POST | /api/enhance | Brightness, contrast, sharpen, blur, hist eq |
| POST | /api/transform | Rotate, flip, crop, resize, translate |
| POST | /api/filter | Gaussian, median, noise removal |
| POST | /api/edge | 6 metode edge + morphology + threshold |
| POST | /api/color | Grayscale, channel split, hue/saturation |
| POST | /api/segment | Threshold, edge, region segmentation |
| POST | /api/compress | JPEG quality slider |
| GET  | /api/histogram | Data histogram before & after |
| POST | /api/ml/recognize | CNN → label + confidence score |

## Pola Transfer Gambar (Penting!)

Semua gambar dikirim sebagai **Base64 string** lewat JSON body:

```python
# Backend — decode incoming image
import base64, numpy as np, cv2

def decode_image(base64_str: str) -> np.ndarray:
    img_bytes = base64.b64decode(base64_str)
    nparr = np.frombuffer(img_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

def encode_image(img: np.ndarray) -> str:
    _, buffer = cv2.imencode('.png', img)
    return base64.b64encode(buffer).decode('utf-8')
```

```javascript
// Frontend — kirim dan terima gambar
const res = await axios.post('/api/enhance', {
  image: base64String,   // dari FileReader
  brightness: 30,
  contrast: 1.2
});
const resultImg = `data:image/png;base64,${res.data.image}`;
```

## Sprint Plan

| Minggu | Deliverable | Modul |
|---|---|---|
| 1 | Setup project + load/save + Before/After panel + Histogram | 1 + 9 |
| 2 | Brightness, contrast, sharpen, blur, histogram equalization | 2 |
| 3 | Rotate, flip, crop, resize, translate | 3 |
| 4 | Edge detection (6 metode) + morphology + thresholding | 5 |
| 5 | Grayscale, channel split + noise removal | 4 + 6 |
| 6 | Segmentasi + Kompresi JPEG | 7 + 8 |
| 7 | CNN object recognition | 11 |
| 8 | UI polish, bug fix, laporan akhir | 10 + All |

## Panduan Per Modul

### Modul 1 — Image Management
- Load: `cv2.imdecode` dari Base64
- Save: `cv2.imencode` ke format pilihan (PNG/JPG/BMP)
- Reset: simpan `original_image` di session/state, kembalikan saat reset
- Before/After: tampilkan 2 `<img>` berdampingan di frontend

### Modul 2 — Enhancement
```python
# Brightness & Contrast: alpha=contrast, beta=brightness
result = cv2.convertScaleAbs(img, alpha=alpha, beta=beta)

# Histogram Equalization (grayscale)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
eq = cv2.equalizeHist(gray)

# Sharpening
kernel = np.array([[0,-1,0],[-1,5,-1],[0,-1,0]])
sharp = cv2.filter2D(img, -1, kernel)

# Blur
blurred = cv2.GaussianBlur(img, (ksize, ksize), 0)
```

### Modul 3 — Geometric Transformation
```python
# Rotate
M = cv2.getRotationMatrix2D(center, angle, scale=1)
rotated = cv2.warpAffine(img, M, (w, h))

# Flip: 0=vertical, 1=horizontal, -1=both
flipped = cv2.flip(img, flip_code)

# Resize
resized = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

# Translate
M = np.float32([[1,0,tx],[0,1,ty]])
translated = cv2.warpAffine(img, M, (w, h))
```

### Modul 5 — Edge & Binary
```python
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Canny
edges = cv2.Canny(gray, threshold1, threshold2)

# Sobel
sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
sobel = cv2.magnitude(sobelx, sobely)

# Laplacian
lap = cv2.Laplacian(gray, cv2.CV_64F)

# Morphology
kernel = np.ones((5,5), np.uint8)
eroded = cv2.erode(binary, kernel)
dilated = cv2.dilate(binary, kernel)
```

### Modul 11 — CNN Object Recognition
- Gunakan **MobileNetV2** via TensorFlow (transfer learning, ringan)
- Pilih 1 kelas objek spesifik (contoh: kucing, wajah manusia, kendaraan)
- Return: `{ "label": "cat", "confidence": 0.94 }`
- Tampilkan di `MLResult.jsx` dengan badge warna

## Template FastAPI Router

```python
from fastapi import APIRouter
from pydantic import BaseModel
from services.enhance_service import apply_enhancement
from utils import decode_image, encode_image

router = APIRouter()

class EnhanceRequest(BaseModel):
    image: str          # Base64
    brightness: int = 0
    contrast: float = 1.0

@router.post("/enhance")
async def enhance(req: EnhanceRequest):
    img = decode_image(req.image)
    result = apply_enhancement(img, req.brightness, req.contrast)
    return {"image": encode_image(result)}
```

## Template React Component (Tool Panel)

```jsx
export default function ToolPanel({ onApply }) {
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(1.0);

  return (
    <div className="p-4 space-y-4">
      <label>Brightness: {brightness}</label>
      <input type="range" min={-100} max={100}
        value={brightness} onChange={e => setBrightness(+e.target.value)} />
      <button onClick={() => onApply({ brightness, contrast })}>
        Apply
      </button>
    </div>
  );
}
```

## Tips & Gotchas

- **CORS**: Tambahkan `CORSMiddleware` di `main.py` agar Next.js bisa hit FastAPI
- **OpenCV BGR vs RGB**: OpenCV pakai BGR, tapi browser expect RGB — konversi sebelum encode
- **Gambar besar**: resize dulu ke max 1024px sebelum kirim ke backend, supaya cepat
- **State gambar**: simpan `original` dan `current` secara terpisah di frontend state
- **CNN inference**: load model 1x saat startup FastAPI (jangan load tiap request)
- **Swagger UI**: buka `http://localhost:8000/docs` untuk test semua endpoint tanpa frontend
