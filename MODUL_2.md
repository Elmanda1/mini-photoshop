# Analisis Mendalam - Modul 2: Image Enhancement
## Projek: Mini Photoshop

Dokumen ini berisi analisis teknis terhadap implementasi Modul 2: Image Enhancement, mencakup penyesuaian kecerahan, kontras, ekualisasi histogram, serta operasi kernel (sharpening & smoothing).

---

## 1. Analisis & Pemetaan Kode

Berdasarkan pemeriksaan codebase, fungsi-fungsi enhancement dipusatkan pada file berikut:

| Fitur | Layer | Lokasi File | Fungsi Utama |
| :--- | :--- | :--- | :--- |
| **Brightness & Contrast** | Service | `backend/services/enhance_service.py` | `adjust_brightness_contrast` |
| **Histogram Equalization**| Service | `backend/services/enhance_service.py` | `histogram_equalization` |
| **Sharpening (USM)** | Service | `backend/services/enhance_service.py` | `sharpen` |
| **Smoothing (Blur)** | Service | `backend/services/enhance_service.py` | `blur` |
| **API Entry Point** | Router | `backend/routers/enhance.py` | `enhance_endpoint` |

---

## 2. Penjelasan Matematis & Piksel Sederhana

### A. Brightness & Contrast (Linear Transformation)
Aplikasi menggunakan model normalisasi float untuk manipulasi piksel:
*   **Brightness**: Merupakan operasi perkalian skalar terhadap setiap piksel $P$.
    $$P_{new} = P \times \text{brightness\_factor}$$
*   **Contrast**: Menggunakan titik pusat (*pivot*) 0.5 (abu-abu tengah) agar intensitas warna menyebar atau menyempit secara seimbang.
    $$P_{new} = (P - 0.5) \times \text{contrast\_factor} + 0.5$$

### B. Histogram Equalization (Distribution Flattening)
Fungsi ini meratakan distribusi intensitas piksel yang menumpuk di area tertentu (misal terlalu gelap atau terang).
1.  **Luminance Extraction**: Gambar BGR dikonversi ke **YCrCb**. Hanya channel **Y** (Luminance) yang diproses agar warna asli tidak rusak.
2.  **CDF (Cumulative Distribution Function)**: Menghitung probabilitas kumulatif dari setiap nilai keabuan (0-255).
3.  **Mapping**: Nilai piksel lama dipetakan ke nilai baru berdasarkan fungsi distribusi kumulatif tersebut sehingga histogram menjadi lebih landai/rata.

### C. Sharpening & Smoothing (Kernel/Filter)
*   **Smoothing (Gaussian Blur)**: Menggunakan matriks kernel Gaussian yang memberikan bobot lebih tinggi pada piksel tengah. Ini merata-ratakan nilai piksel dengan tetangganya, menghilangkan detail tajam/noise.
*   **Sharpening (Unsharp Masking)**: Alih-alih konvolusi langsung, aplikasi menggunakan teknik *Unsharp Masking* (USM) yang lebih natural:
    $$\text{Result} = \text{Original} + \text{Intensity} \times (\text{Original} - \text{Blurred})$$
    Logikanya: Kurangi gambar asli dengan versi blur untuk mendapatkan "tepi" (high frequency), lalu tambahkan tepi tersebut kembali ke gambar asli.

---

## 3. Validasi Teknis (Overflow Handling)

Pemeriksaan keamanan data pada tipe `uint8` (0-255):

*   **Brightness & Contrast**: **AMAN**. Kode menggunakan `np.clip(img_float * 255.0, 0, 255)` sebelum konversi kembali ke `uint8` (Line 23). Ini mencegah nilai negatif menjadi 255 atau nilai > 255 menjadi rendah akibat *integer wrap-around*.
*   **Sharpening**: **AMAN**. Fungsi `cv2.addWeighted` yang digunakan secara internal melakukan clipping otomatis pada hasil penjumlahan matriks.
*   **Histogram Equalization**: **AMAN**. `cv2.equalizeHist` adalah fungsi internal OpenCV yang sudah teroptimasi untuk tipe data `uint8`.

---

## 4. Rekomendasi Optimasi Kode

1.  **Parameter Kernel Blur**: Pada `blur` service (Line 84), kernel size dipaksa menjadi ganjil (`ksize % 2 == 0: ksize += 1`). Ini sudah bagus, namun sebaiknya ditambahkan batas atas (misal max 31) untuk mencegah penggunaan memori berlebih yang bisa membuat backend *hang*.
2.  **CLAHE (Contrast Limited Adaptive Histogram Equalization)**: Saat ini fungsi `histogram_equalization` melakukan ekualisasi global. Untuk hasil yang lebih profesional (seperti fitur "Smart Enhance"), disarankan menggunakan CLAHE agar detail di area lokal tetap terjaga tanpa menciptakan *halo effect* yang berlebihan.
3.  **Vectorization**: Penggunaan `np.clip` dan operasi float pada kecerahan sudah ter-vektorisasi (menggunakan NumPy), sehingga performanya sudah sangat optimal untuk eksekusi di CPU.

---
**Status Modul 2:** `TERVERIFIKASI` (Logika matematis sesuai dengan standar pengolahan citra digital dan aman dari bug overflow).
