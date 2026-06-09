# Analisis Mendalam - Modul 8: Image Compression
## Projek: Mini Photoshop

Dokumen ini berisi analisis teknis terhadap implementasi Modul 8: Image Compression, mencakup simulasi kompresi JPEG dan RLE.

---

## 1. Analisis & Pemetaan Kode

Logika kompresi citra diimplementasikan pada file berikut:

| Fitur | Layer | Lokasi File | Fungsi Utama |
| :--- | :--- | :--- | :--- |
| **JPEG Simulation** | Service | `backend/services/compress_service.py` | `compress_jpeg` |
| **RLE Simulation** | Service | `backend/services/compress_service.py` | `compress_rle` |
| **API Entry Point** | Router | `backend/routers/compress.py` | `compress_endpoint` |
| **UI Control** | Frontend | `frontend/src/components/ToolPanel.tsx` | "Compression" Section |

---

## 2. Bedah Algoritma Kompresi

Aplikasi menyediakan dua metode kompresi untuk simulasi:

### A. Lossy Compression (JPEG)
Aplikasi melakukan simulasi kompresi JPEG yang mempengaruhi kualitas visual secara permanen.
1.  **Kuantisasi**: Saat `cv2.imencode('.jpg', ..., [cv2.IMWRITE_JPEG_QUALITY, quality])` dipanggil, OpenCV menerapkan matriks kuantisasi. Semakin rendah `quality`, semakin banyak data frekuensi tinggi yang dibuang (dibulatkan ke nol).
2.  **Rekonstruksi**: Gambar hasil kompresi di-decode kembali ke array NumPy (`cv2.imdecode`). Hasilnya akan menunjukkan artefak blok (*blocking artifacts*) jika kualitas diatur sangat rendah (misal < 10%).

### B. Lossless Compression (RLE - Run-Length Encoding)
Aplikasi menyediakan simulasi RLE untuk membandingkan efisiensi ruang tanpa merusak piksel.
1.  **Logika RLE**: Algoritma mencari rentetan piksel dengan nilai yang sama secara berurutan.
    *   *Contoh*: `[255, 255, 255, 0, 0]` dikompresi menjadi `(3, 255), (2, 0)`.
2.  **Estimasi Ukuran**: Karena gambar warna sangat kompleks, RLE seringkali tidak efisien (ukuran bisa lebih besar dari asli). Kode di `compress_rle` menghitung estimasi ukuran berdasarkan jumlah perubahan nilai pada array piksel yang diratakan (*flattened*).

---

## 3. Evaluasi Efisiensi

1.  **Simulasi Ukuran**: Sistem ini **benar-benar menghitung** ukuran byte hasil kompresi (`len(comp_buf)`). Frontend menampilkan perbandingan ukuran asli (dalam PNG/Raw) vs ukuran hasil kompresi (dalam JPEG/RLE) secara matematis.
2.  **Batas Kode**: 
    *   Fungsi RLE saat ini hanya bersifat **estimasi ukuran** (`estimated_size`). Gambar yang ditampilkan ke user tetap gambar asli karena RLE bersifat *lossless* (tidak mengubah visual).
    *   Kompresi JPEG adalah **nyata**. Gambar yang dikirim ke frontend adalah gambar yang sudah melewati siklus *encode-decode* JPEG, sehingga penurunan kualitas dapat dilihat langsung oleh mata user.

---

## 4. Rekomendasi Optimasi

1.  **Implementasi RLE Visual**: Tambahkan efek visual pada RLE dengan melakukan *quantization* warna terlebih dahulu (posterisasi). RLE akan bekerja jauh lebih efisien pada gambar dengan jumlah warna sedikit (seperti logo atau karton).
2.  **Metadata Info**: Tambahkan informasi "Compression Ratio" di UI (misal: "1:4.5") agar mahasiswa dapat lebih memahami efektivitas algoritma kompresi yang dipilih.
3.  **Format WebP**: Tambahkan dukungan kompresi WebP. WebP saat ini merupakan standar industri yang menggabungkan keunggulan JPEG (kecil) dan PNG (transparansi) dengan algoritma prediksi intra-frame yang lebih modern.

---
**Status Modul 8:** `TERVERIFIKASI` (Simulasi lossy vs lossless bekerja dengan perhitungan byte yang akurat).
