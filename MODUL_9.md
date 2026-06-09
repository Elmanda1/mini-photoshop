# Analisis Mendalam - Modul 9: Histogram Analysis
## Projek: Mini Photoshop

Dokumen ini berisi analisis teknis terhadap implementasi Modul 9: Histogram Analysis, mencakup kalkulasi distribusi intensitas piksel dan visualisasinya.

---

## 1. Analisis & Pemetaan Kode

Fitur analisis histogram diimplementasikan secara kolaboratif antara backend untuk kalkulasi dan frontend untuk visualisasi:

| Fitur | Layer | Lokasi File | Fungsi/Komponen Utama |
| :--- | :--- | :--- | :--- |
| **Histogram Calculation** | Backend | `backend/services/histogram_service.py` | `calculate_histogram` |
| **API Endpoint** | Backend | `backend/main.py` | `/api/histogram` |
| **Visualisasi (Chart)** | Frontend | `frontend/src/components/HistogramChart.tsx` | `HistogramChart` |
| **Integrasi UI** | Frontend | `frontend/src/app/editor/page.tsx` | `showHistogram` state |

---

## 2. Alur Distribusi Intensitas

### A. Kalkulasi Frekuensi Piksel
Piksel dihitung berdasarkan kemunculan intensitasnya dalam rentang 0 (hitam pekat) hingga 255 (putih murni).
*   **Proses**: Menggunakan `cv2.calcHist`. Fungsi ini memindai seluruh matriks gambar dan mengisi 256 "tong" (*bins*) dengan jumlah piksel yang memiliki nilai tersebut.
*   **Channel**: Aplikasi menghitung 4 jenis histogram: Grayscale (luminansi umum), serta channel Red, Green, dan Blue secara spesifik untuk mendeteksi *color cast*.

### B. Visualisasi Interaktif (React + Chart.js)
Berbeda dengan Matplotlib yang bersifat statis dan sering memblokir *Main Thread* (GUI Freezing), aplikasi ini menggunakan **Chart.js** di sisi frontend:
1.  **Non-Blocking**: Data histogram dikirim dari backend dalam format JSON (array angka).
2.  **Rendering**: Frontend menggunakan elemen `<canvas>` HTML5 untuk menggambar grafik garis (*Line Chart*) secara asinkron. Ini memastikan UI tetap responsif saat grafik sedang di-update.
3.  **Perbandingan Before-After**: Sistem menyimpan dua set data histogram. Saat user beralih ke mode "After", grafik akan melakukan transisi mulus (*smooth transition*) untuk menunjukkan perubahan distribusi setelah filter diterapkan.

---

## 3. Deteksi Isu Sinkronisasi

Berdasarkan pemeriksaan kode pada `page.tsx`:
*   **Status**: **SINKRON**. Setiap kali operasi destruktif (seperti Brightness, Kontras, atau Filter) diterapkan melalui tombol "Apply", fungsi `getHistogram` dipanggil kembali untuk mengambil data terbaru dari backend.
*   **Potensi Lag**: Pada mode *Live Preview* (saat slider digeser tanpa klik Apply), histogram **tidak terupdate secara real-time**. Hal ini disengaja untuk menjaga performa (menghindari ribuan request API histogram per detik).
*   **Masalah Sinkronisasi**: Jika user melakukan Undo/Redo, data histogram juga ikut diperbarui secara otomatis di dalam fungsi `handleUndo` dan `handleRedo`.

---

## 4. Rekomendasi Perbaikan GUI-Plot

1.  **Histogram Clipping Warning**: Tambahkan indikator visual (misal: warna merah pada ujung kiri/kanan grafik) jika histogram menumpuk terlalu tajam di nilai 0 atau 255. Ini sangat berguna bagi user untuk mengetahui apakah gambar mereka kehilangan detail (*shadow/highlight clipping*).
2.  **Toggle Per Channel**: Saat ini semua channel (RGB + Gray) ditampilkan bersamaan. Tambahkan tombol *legend* yang dapat diklik untuk menyembunyikan/menampilkan channel tertentu agar grafik tidak terlihat terlalu penuh.
3.  **Sampling Data**: Untuk gambar beresolusi sangat tinggi, backend bisa melakukan *downsampling* (misal hanya memproses 1/4 jumlah piksel) sebelum menghitung histogram guna mempercepat waktu respon API tanpa mengurangi akurasi visual histogram secara signifikan.

---
**Status Modul 9:** `TERVERIFIKASI` (Visualisasi asinkron sangat responsif dan data distribusi 0-255 akurat sesuai standar DIP).
