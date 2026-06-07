# Spesifikasi Fitur — Image Management

Dokumen ini menjelaskan implementasi kode untuk fitur Image Management (Load, Save, Reset, Preview) pada sistem Mini Photoshop.

## Ringkasan Fungsi Utama
- Load image: menerima file lokal (JPG, PNG, BMP) melalui frontend, mengubah ke Base64, lalu diproses di editor.
- Save image: ekspor/unduh hasil edit (client-side) atau panggilan API untuk encode/format server-side.
- Reset: kembalikan ke gambar awal yang diunggah tanpa perubahan.
- Preview: tampilan before–after panel (side-by-side) untuk membandingkan original vs edited.

## Alur Data Singkat
1. Pengguna drag & drop atau pilih file di UI. (Frontend: `frontend/src/components/ImageCanvas.tsx`)
2. `FileReader` membaca file → data URL → frontend mengirimkan Base64 (tanpa prefix) ke handler upload.
3. `EditorPage` menyimpan `uploadedImage` (asli), `baseImage` (untuk operasi live), dan `displayImage` (yang ditampilkan/diunduh).
4. Untuk penyimpanan server-side, frontend kirim Base64 ke endpoint backend `/api/image/save`.

## Lokasi Kode (Referensi)
- Router & API endpoints: [backend/routers/image.py](backend/routers/image.py#L1-L80)
- Service encoding/format: [backend/services/image_service.py](backend/services/image_service.py#L1-L140)
- Util Base64 encode/decode: [backend/utils.py](backend/utils.py#L1-L200)
- Frontend canvas & dropzone: [frontend/src/components/ImageCanvas.tsx](frontend/src/components/ImageCanvas.tsx#L1-L120)
- Editor state & actions (load/reset/save/export): [frontend/src/app/editor/page.tsx](frontend/src/app/editor/page.tsx#L1-L220)
- UI controls that trigger reset: [frontend/src/components/ToolPanel.tsx](frontend/src/components/ToolPanel.tsx#L1-L80)

## Detail Implementasi

Load (Upload)
- Frontend: `ImageCanvas.tsx` menggunakan `useDropzone` dan `FileReader`.
  - Setelah membaca file, kode mengekstrak Base64 dengan `result.split(",")[1]` lalu memanggil `onImageUpload(base64)`.
  - File diterima hanya untuk tipe `image/jpeg`, `image/png`, `image/bmp`.
- Editor: `handleImageUpload(base64)` (di `EditorPage`) menyimpan `uploadedImage`, `baseImage`, `displayImage`, menginisialisasi history, dan memanggil `getHistogram`.
- Backend: jika perlu decode server-side, endpoint `/api/image/load` menerima JSON `{ image: "<base64>" }` dan menggunakan `utils.decode_image`.

Save (Ekspor)
- Client-side quick save: `handleSave()` di `EditorPage` membuat `canvas`, menerapkan CSS filters bila ada, lalu `canvas.toBlob` dan memicu unduhan browser (`a.download`).
- Export dengan format pilihan: `handleExport()` membuat canvas dengan ukuran asli, menerapkan filter, lalu memilih MIME/ekstensi (`png`, `jpg`, `webp`) lalu memicu unduh.
- Server-side save: endpoint `/api/image/save` di [backend/routers/image.py](backend/routers/image.py#L1-L80) menerima `{ image, format, quality }` →
  - `utils.decode_image` mengubah Base64 → OpenCV ndarray
  - `services.image_service.save_image(img, format, quality)` mengencode via `cv2.imencode` dan mengembalikan bytes + mime
  - Router mengirim kembali Base64 hasil encode.

Reset
- `handleReset()` di `EditorPage` melakukan:
  - Hentikan request live yang sedang berjalan (cancel timer / increment request id)
  - Set `baseImage` dan `displayImage` = `uploadedImage`
  - Reset semua `liveFilters` ke nilai default
  - Reset zoom, `resetKey` (digunakan oleh `ToolPanel` untuk mereset kontrol lokal)
  - Update histogram dan history

Preview (Before–After)
- `ImageCanvas.tsx` menampilkan dua kolom: LEFT = BEFORE (originalImage), RIGHT = AFTER (currentImage / edited).
- `displayImage` di `EditorPage` di-commit sebagai `currentImage` setelah operasi live atau ketika user memilih untuk mengaplikasikan perubahan.

## Catatan Teknis & Perilaku Penting
- Frontend mengirim Base64 tanpa data URL prefix (hanya bagian setelah `,`). Pastikan server `decode_image` menerima format ini.
- Untuk mempertahankan transparansi, `utils.ensure_3channel` dan `merge_alpha` menangani BGRA ↔ BGR.
- `services.save_image` memilih `cv2` encode params (JPEG quality, PNG compression). Jika format tidak didukung, fungsi melempar `ValueError`.
- Reset membatalkan operasi live dengan menaikkan `liveRequestId.current` sehingga respons lama diabaikan.

## Contoh Pemakaian API (curl)
1) Simulasi save (JSON body = Base64 tanpa prefix):

```
curl -X POST http://localhost:8000/api/image/save \
  -H "Content-Type: application/json" \
  -d '{"image":"<BASE64_DATA>","format":"png","quality":95}'
```

Response: JSON { image: "<BASE64>", format: "png", mime_type: "image/png" }

## Rekomendasi & Perbaikan Kecil
- Validasi ukuran file saat upload (maks 20MB) untuk menghindari OOM pada browser/server.
- Tambahkan endpoint server-side untuk menghasilkan download berkas (Content-Disposition) agar browser bisa langsung unduh tanpa menukar Base64.
- Dokumentasikan konvensi Base64 (prefix vs tanpa prefix) pada `README` sehingga integrasi pihak ketiga jelas.

---
File ini dibuat otomatis untuk menjelaskan alur kode Image Management.
