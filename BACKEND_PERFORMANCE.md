# Analisis Stack Backend & Performa — Mini Photoshop

Dokumen ini merinci teknologi yang digunakan pada backend Mini Photoshop serta analisis performa pemrosesan citra.

## 1. Stack Teknologi Backend

Backend dibangun menggunakan ekosistem Python modern yang berfokus pada kecepatan eksekusi dan efisiensi memori.

| Komponen | Teknologi | Versi | Peran Utama |
|---|---|---|---|
| **Runtime** | Python | 3.12.x | Bahasa pemrograman utama dengan dukungan `typing` dan `async`. |
| **Framework** | FastAPI | 0.115.x | REST API framework dengan performa tinggi (setara Go/Node.js). |
| **Web Server** | Uvicorn | 0.30.x | ASGI server untuk menangani request asinkron secara efisien. |
| **Image Engine** | OpenCV | 4.10.x | Library standar industri untuk pengolahan citra real-time (C++ backend). |
| **Data Processing** | NumPy | 1.26.x | Manipulasi array n-dimensi yang dioptimalkan (vektorisasi). |
| **Validation** | Pydantic | 2.x | Validasi data skema API yang sangat cepat berbasis Rust. |

## 2. Analisis Kecepatan & Efisiensi

### Kecepatan Framework (FastAPI)
FastAPI dipilih karena merupakan salah satu framework Python tercepat yang tersedia saat ini. Dengan dukungan **Asynchronous I/O**, backend dapat menangani banyak permintaan secara paralel tanpa memblokir proses utama, yang sangat penting saat melayani banyak user yang mengedit gambar secara bersamaan.

### Kecepatan Pengolahan Citra (OpenCV + NumPy)
Meskipun ditulis dalam Python, pengolahan citra di Mini Photoshop sangat cepat karena:
- **C++ Core:** Semua fungsi OpenCV (seperti `cv2.warpAffine` untuk rotasi atau `cv2.Canny`) dijalankan dalam kode C++ yang sudah dikompilasi, bukan Python murni.
- **Vektorisasi NumPy:** Operasi piksel (seperti penyesuaian Brightness/Contrast) dilakukan secara serentak pada seluruh array (SIMD), menghindari *loop* Python yang lambat.

### Estimasi Waktu Pemrosesan (Benchmark Tipikal)
*Diukur pada gambar resolusi HD (1280x720) pada mesin standar:*

| Operasi | Estimasi Waktu | Keterangan |
|---|---|---|
| **Transformasi** (Rotate, Flip, Translate) | < 10ms | Operasi matriks instan. |
| **Enhancement** (Brightness, Contrast) | < 5ms | Vektorisasi NumPy murni. |
| **Filtering** (Gaussian Blur, Sharpen) | 10ms - 30ms | Tergantung ukuran kernel. |
| **Edge Detection** (Canny) | 15ms - 40ms | Pemrosesan gradien yang efisien. |
| **Segmentation** (K-Means) | 100ms - 500ms | Operasi iteratif (paling berat). |
| **ML Inference** (Face Detect) | 50ms - 150ms | Menggunakan model terkompresi ResNet SSD. |

## 3. Optimasi yang Diimplementasikan

1. **Stateless Processing:** Gambar tidak disimpan di server (memory-efficient). Dikirim via Base64, diproses, dan langsung dikembalikan.
2. **BGR to RGB Handling:** Penanganan otomatis perbedaan format OpenCV (BGR) dan Browser (RGB) untuk akurasi warna.
3. **Headless OpenCV:** Menggunakan `opencv-python-headless` untuk mengurangi ukuran image/container dan overhead GUI yang tidak diperlukan di server.
4. **Lazy Loading ML:** Model CNN hanya dimuat satu kali saat startup server, bukan pada setiap request API.
