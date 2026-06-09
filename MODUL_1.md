# Analisis Mendalam - Modul 1: Image Management
## Projek: Mini Photoshop

Dokumen ini berisi analisis teknis terhadap implementasi Modul 1: Image Management pada aplikasi Mini Photoshop.

---

## 1. Analisis & Pemetaan Kode

Fitur utama Modul 1 tersebar pada layer Backend (FastAPI + OpenCV) dan Frontend (Next.js + React). Berikut adalah pemetaannya:

### A. Backend (Logika Image Processing)
| Fitur | File | Fungsi | Keterangan |
| :--- | :--- | :--- | :--- |
| **Decode Image** | `backend/utils.py` | `decode_image` | Mengubah string Base64 dari frontend menjadi NumPy array (BGR). |
| **Encode Image** | `backend/utils.py` | `encode_image` | Mengubah NumPy array kembali ke string Base64 untuk dikirim ke frontend. |
| **Load Endpoint** | `backend/routers/image.py` | `load_image_endpoint` | Endpoint `/api/image/load` yang memvalidasi awal gambar. |
| **Save Service** | `backend/services/image_service.py` | `save_image` | Menangani konversi format ke JPG, PNG, atau BMP menggunakan `cv2.imencode`. |

### B. Frontend (UI & State Management)
| Fitur | File | Komponen/Fungsi | Keterangan |
| :--- | :--- | :--- | :--- |
| **Dropzone/Load** | `frontend/src/components/ImageCanvas.tsx` | `onDrop` | Menggunakan `react-dropzone` untuk membaca file lokal ke Base64. |
| **Reset State** | `frontend/src/app/editor/page.tsx` | `handleReset` | Mengembalikan status `displayImage` ke `uploadedImage`. |
| **Preview Panel** | `frontend/src/components/ImageCanvas.tsx` | `ImageCanvas` | Merender dua panel (Before & After) secara berdampingan. |
| **Save/Export** | `frontend/src/app/editor/page.tsx` | `handleExport` | Mengeksekusi download file dengan format yang dipilih user. |

---

## 2. Detail Alur Teknis & Operasi Array

### A. Pengolahan di Memori (NumPy Array)
Saat gambar masuk ke backend, OpenCV memprosesnya sebagai **NumPy ndarray**.
1.  **Struktur Data**: Gambar direpresentasikan dalam array 3D: `(height, width, channels)`.
2.  **Color Space**: Secara default, OpenCV menggunakan format **BGR** (Blue, Green, Red). Kode di `utils.py` (baris 56) juga menyediakan fungsi `ensure_3channel` untuk memisahkan *Alpha Channel* (transparansi) agar operasi matriks pada modul selanjutnya lebih stabil.
3.  **Transisi Before-After**:
    *   **Before**: Merupakan array statis yang disimpan di frontend sejak pertama kali upload.
    *   **After**: Hasil dari pemrosesan backend yang dikirim balik dalam format Base64. Frontend melakukan update pada state `displayImage` yang kemudian memicu re-render pada panel "After".

### B. Mekanisme Reset
Aplikasi menggunakan sistem **Dual-State**:
```typescript
const [uploadedImage, setUploadedImage] = useState(null); // Original
const [displayImage, setDisplayImage] = useState(null);   // Processed
```
Fungsi reset tidak melakukan request ke server, melainkan hanya menyalin isi `uploadedImage` kembali ke `displayImage`. Hal ini sangat efisien karena tidak membebani network.

---

## 3. Temuan Masalah & Potensi Error

1.  **Base64 Overhead**: Data gambar dikirim dalam format string Base64. Ini meningkatkan ukuran data sebesar ~33% dibandingkan file binary asli. Untuk gambar beresolusi sangat tinggi (misal > 10MB), ini dapat menyebabkan *bottleneck* pada RAM browser.
2.  **Redundansi Logika Save**: 
    *   Backend punya `save_image` di `image_service.py`.
    *   Frontend punya `handleSave` yang menggunakan `canvas.toBlob`.
    *   **Masalah**: Jika user menggunakan fitur "Export", frontend melakukan rendering ulang di canvas. Ini berpotensi menyebabkan hasil save sedikit berbeda dengan hasil preview OpenCV jika pengaturan kompresi browser tidak sinkron dengan backend.
3.  **Pathing & File Handling**: Saat ini aplikasi hanya menerima upload langsung. Tidak ada mekanisme *temporary storage* di server (semua *in-memory*), yang mana bagus untuk privasi tapi beresiko *crash* jika banyak user melakukan upload gambar besar secara bersamaan.

---

## 4. Rekomendasi Perbaikan & Clean Code

### A. Sinkronisasi Save Logic
Gunakan backend untuk proses encoding final agar hasil simpan 100% akurat dengan algoritma OpenCV.

```python
# Rekomendasi perbaikan pada backend/routers/image.py
@router.post("/save")
async def save_image_endpoint(req: SaveRequest):
    img = decode_image(req.image)
    # Pastikan format didukung
    if req.format.lower() not in ['jpg', 'png', 'bmp']:
        raise HTTPException(status_code=400, detail="Format tidak didukung")
    
    encoded = encode_image(img, f".{req.format}")
    return {"image": encoded, "format": req.format}
```

### B. Penanganan Error yang Lebih Baik
Pada `utils.py`, decoding seringkali gagal jika string base64 tidak lengkap. Tambahkan validasi header.

```python
# backend/utils.py
def decode_image(base64_str: str) -> np.ndarray:
    try:
        # Hapus header data:image/...;base64, jika ada
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        
        img_bytes = base64.b64decode(base64_str)
        # ... sisa kode
```

### C. Konsistensi UI
Tambahkan format **BMP** pada pilihan dropdown Export di frontend agar sesuai dengan kapabilitas backend yang sudah ada.

---
**Status Modul 1:** `TERVERIFIKASI` (Fitur utama Load, Save, Reset, Preview berfungsi sesuai spesifikasi).
