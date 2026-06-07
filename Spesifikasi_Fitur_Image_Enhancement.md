# Spesifikasi Fitur — Image Enhancement

Dokumen ini menjelaskan implementasi kode untuk fitur Image Enhancement di Mini Photoshop, sesuai permintaan:
- Brightness & Contrast Adjustment
- Histogram Equalization
- Sharpening
- Smoothing (Blur)

## Fungsi Utama
- **Brightness & Contrast Adjustment**: slider interaktif di UI, dengan operasi commit ke backend.
- **Histogram Equalization**: perataan histogram pada kanal luminansi untuk memperbaiki distribusi tonal.
- **Sharpening**: Unsharp Masking untuk menajamkan detail tanpa terlalu banyak noise.
- **Smoothing / Blur**: Gaussian blur untuk meredam detail dan membuat citra lebih halus.

## Lokasi Kode (Referensi)
- Frontend enhancement UI: `frontend/src/components/ToolPanel.tsx`
- Frontend API client: `frontend/src/lib/api.ts`
- Backend enhancement router: `backend/routers/enhance.py`
- Backend enhancement service: `backend/services/enhance_service.py`
- Image decoding/encoding: `backend/utils.py`

## Alur Kerja Fitur Enhancement
1. Pengguna mengubah slider Brightness/Contrast atau menekan tombol `Hist EQ`, `Sharpen`, `Blur`.
2. `ToolPanel.tsx` memanggil callback `onApply("enhance", operation, params, isPreview)`.
3. `EditorPage` menyalurkan permintaan ke `applyEnhancement(base64, operation, params)` di `frontend/src/lib/api.ts`.
4. Backend menerima request di endpoint `/api/enhance` dan memprosesnya di `backend/routers/enhance.py`.
5. Kode backend meng-`decode_image`, menjalankan operasi yang diminta, lalu meng-`encode_image` kembali menjadi Base64.
6. Frontend menerima respons Base64 dan menampilkan hasil di panel `AFTER`.

## Detail Operasi

### 1. Brightness & Contrast Adjustment
- UI: slider `Brightness` (-100 sampai 100) dan `Contrast` (0.1 sampai 3.0) di `ToolPanel.tsx`.
- Nilai brightness slider dikonversi menjadi multiplier dengan `1 + brightness / 100`.
- Tombol `Apply Enhancement` memanggil:
  - `onApply("enhance", "brightness_contrast", { brightness: bMultiplier, contrast }, false)`
- Backend: `adjust_brightness_contrast(img, brightness, contrast)`
  - Mengubah ke `float32` dalam rentang [0, 1]
  - Menerapkan brightness sebagai multiplier
  - Menerapkan contrast dengan pivot pada 0.5
  - Clip kembali ke [0, 255]
- Keluaran: citra yang sudah disesuaikan dengan skala yang serupa CSS `brightness` dan `contrast`.

### 2. Histogram Equalization
- UI: tombol `Hist EQ` di `ToolPanel.tsx`.
- Permintaan backend: `onApply("enhance", "histogram_eq", {})`.
- Backend: `histogram_equalization(img)`
  - Untuk grayscale: `cv2.equalizeHist`
  - Untuk BGR: konversi ke YCrCb, equalize hanya channel Y, lalu kembali ke BGR
- Tujuan: memperbaiki kontras tonal tanpa merusak informasi warna.

### 3. Sharpening
- UI: tombol `Sharpen` dan slider `Sharpen Intensity` (0.5 sampai 3.0) di `ToolPanel.tsx`.
- Permintaan backend: `onApply("enhance", "sharpen", { intensity: sharpIntensity })`.
- Backend: `sharpen(img, intensity)`
  - Menerapkan Gaussian blur sebagai mask dengan `sigmaX=1.5`
  - Menjaga intensitas maksimum `2.0`
  - Menggunakan `cv2.addWeighted(img, 1.0 + intensity, blurred, -intensity, 0)`
- Efek: meningkatkan ketajaman tepi dengan Unsharp Masking.

### 4. Smoothing (Blur)
- UI: tombol `Blur` dan slider `Blur Kernel` (3 sampai 31, langkah 2) di `ToolPanel.tsx`.
- Permintaan backend: `onApply("enhance", "blur", { kernel_size: blurKernel })`.
- Backend: `blur(img, kernel_size)`
  - Memastikan kernel adalah bilangan ganjil minimal 3
  - Menggunakan `cv2.GaussianBlur(img, (ksize, ksize), 0)`
- Efek: meratakan noise dan detail halus untuk hasil lebih lembut.

## Operasi Tambahan
- `ToolPanel.tsx` juga menyediakan tombol `Smart Enhance`, yang memanggil operasi `smart_enhance`.
- `smart_enhance(img)` di backend melakukan:
  - CLAHE pada kanal L dalam ruang warna LAB
  - Normalisasi brightness
  - Sharpening moderat
- Jadi meski tidak diminta secara eksplisit, fitur ini tersedia sebagai enhancement otomatis.

## API Backend
- Endpoint: `POST /api/enhance`
- Request body:
  - `image`: Base64 string
  - `operation`: `brightness_contrast` | `histogram_eq` | `sharpen` | `blur` | `smart_enhance`
  - `brightness`: float
  - `contrast`: float
  - `intensity`: float
  - `kernel_size`: int
- Response body:
  - `image`: hasil Base64

## Contoh Permintaan API
```
curl -X POST http://localhost:8000/api/enhance \
  -H "Content-Type: application/json" \
  -d '{"image":"<BASE64_DATA>","operation":"brightness_contrast","brightness":1.2,"contrast":1.5}'
```

## Catatan Penting
- Pada frontend, slider brightness hanya mempengaruhi preview live lewat `liveFilters` dan di-commit ketika pengguna menekan `Apply Enhancement`.
- Operasi `histogram_eq`, `sharpen`, dan `blur` berjalan di backend, sehingga hasilnya dikembalikan sebagai Base64 dari server.
- `backend/routers/enhance.py` menggunakan `ensure_3channel`/`merge_alpha` untuk menjaga alpha channel bila gambar transparan.

---
File ini menjelaskan implementasi Image Enhancement berdasarkan kode yang ada saat ini.