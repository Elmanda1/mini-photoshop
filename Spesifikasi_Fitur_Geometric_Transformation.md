# Spesifikasi Fitur — Geometric Transformation

Dokumen ini menjelaskan fitur Geometric Transformation di Mini Photoshop:
- Rotate (0°–360°)
- Flip (horizontal/vertical)
- Crop (drag area)
- Resize (scaling)
- Translation (geser posisi)

## Fungsi Utama
- **Rotate**: memutar gambar sesuai sudut 0°–360° dan memperbesar kanvas agar tidak ada bagian yang terpotong.
- **Flip**: membalik gambar secara horizontal atau vertikal.
- **Crop**: memilih area dengan drag, termasuk preset rasio dan orientasi, lalu memotong gambar.
- **Resize**: memperbesar atau memperkecil gambar menggunakan skala.
- **Translation**: menggeser posisi gambar secara horizontal dan vertikal dalam kanvas tetap.

## Teknis
- Transformasi menggunakan matriks affine di backend.
- Interpolasi untuk resize tersedia dalam dua mode:
  - `nearest` (nearest neighbor)
  - `linear` (bilinear)

## Lokasi Kode (Referensi)
- Frontend transform controls: `frontend/src/components/ToolPanel.tsx`
- Frontend crop modal: `frontend/src/components/CropResizeModal.tsx`
- Backend transform router: `backend/routers/transform.py`
- Backend transform service: `backend/services/transform_service.py`
- Frontend API client: `frontend/src/lib/api.ts`

## Alur Kerja Transformasi
1. Pengguna memilih operasi transformasi di `ToolPanel.tsx` atau membuka `CropResizeModal.tsx`.
2. Frontend memanggil `onApply("transform", operation, params, false)`.
3. `EditorPage` meneruskan ke `applyTransform(base64, operation, params)` di `frontend/src/lib/api.ts`.
4. Backend menerima request di endpoint `POST /api/transform`.
5. Router di `backend/routers/transform.py` memanggil fungsi transformasi yang sesuai.
6. Hasil di-encode kembali ke Base64 dan dikirim ke frontend.

## Detail Implementasi

### 1. Rotate
- UI: slider `Rotation` 0–360° di `ToolPanel.tsx`.
- Permintaan backend: `onApply("transform", "rotate", { angle }, false)`.
- Backend: `rotate_image(img, angle)` di `backend/services/transform_service.py`.
- Implementasi:
  - Hitung matriks rotasi OpenCV (`cv2.getRotationMatrix2D`).
  - Sesuaikan posisi untuk memperluas kanvas agar gambar tidak terpotong.
  - Gunakan `cv2.warpAffine` dengan `INTER_LANCZOS4` untuk kualitas tinggi.
  - Hasil berupa BGRA dengan transparent border dan proses crop alpha.

### 2. Flip
- UI: tombol `H-Flip` dan `V-Flip` di `ToolPanel.tsx`.
- Permintaan backend: `onApply("transform", "flip", { flip_code }, false)`.
- Backend: `flip_image(img, flip_code)`.
- Implementasi: `cv2.flip(img, flip_code)`.
- Kode flip_code: `1` untuk horizontal, `0` untuk vertical, `-1` untuk both.

### 3. Crop
- UI: tombol `Crop (C)` membuka `CropResizeModal.tsx`.
- `CropResizeModal` menggunakan `react-cropper` untuk drag area, preset rasio, dan orientasi landscape/portrait.
- Saat klik `Confirm Crop`, frontend mengirim:
  - `x1`, `y1`, `x2`, `y2`
  - `target_w`, `target_h`
- Backend: `crop_image(img, x1, y1, x2, y2, target_w, target_h)`.
- Implementasi:
  - Validasi koordinat crop agar berada dalam batas gambar.
  - Potong ROI dengan slice `img[y1:y2, x1:x2]`.
  - Jika `target_w/target_h` tersedia, resize hasil crop dengan `INTER_LANCZOS4`.

### 4. Resize
- UI: slider `scale` di `ToolPanel.tsx`, menunjukkan dimensi output aktual.
- Permintaan backend: `onApply("transform", "resize", { scale }, false)`.
- Backend: `resize_image(img, scale, width, height, interpolation)`.
- Implementasi:
  - Jika width/height diberikan, gunakan ukuran eksplisit.
  - Jika hanya scale, gunakan `cv2.resize` dengan `fx=scale`, `fy=scale`.
  - Interpolasi:
    - `nearest` → `cv2.INTER_NEAREST`
    - `linear` → `cv2.INTER_LINEAR` (bilinear)

### 5. Translation
- UI: slider `Translate X` dan `Translate Y` di `ToolPanel.tsx`.
- Permintaan backend: `onApply("transform", "translate", { tx, ty }, false)`.
- Backend: `translate_image(img, tx, ty)`.
- Implementasi:
  - Buat matriks affine translasi `[[1, 0, tx], [0, 1, ty]]`.
  - `cv2.warpAffine` dengan `INTER_LINEAR`, `BORDER_CONSTANT`, dan transparent background.
  - Kanvas tetap ukuran asli; bagian yang bergerak keluar diklip, area kosong transparan.

## Endpoint API
- `POST /api/transform`
- Body request:
  - `image`: Base64 string
  - `operation`: `rotate` | `flip` | `crop` | `resize` | `translate`
  - `angle`: float
  - `flip_code`: int
  - `x1`, `y1`, `x2`, `y2`: int
  - `scale`: float
  - `width`, `height`: int
  - `interpolation`: `linear` atau `nearest`
  - `tx`, `ty`: int
  - `target_w`, `target_h`: int
- Response:
  - `image`: Base64 hasil transformasi

## Catatan Teknis
- Rotate dan translate memakai affine transform di OpenCV.
- Crop menggunakan bounding box yang ditentukan oleh `Cropper` dan mendukung resize output.
- Resize mendukung interpolasi bilinear dan nearest neighbor, sesuai spesifikasi teknis.
- Transformasi menjaga kanal alpha bila perlu.

---
File ini dibuat untuk menjelaskan implementasi fitur Geometric Transformation saat ini dalam Mini Photoshop.
