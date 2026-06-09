# Analisis Mendalam - Modul 3: Geometric Transformation
## Projek: Mini Photoshop

Dokumen ini berisi analisis teknis terhadap implementasi Modul 3: Geometric Transformation, mencakup rotasi, flip, crop, skala (resize), dan translasi.

---

## 1. Analisis & Pemetaan Kode

Berdasarkan pemeriksaan codebase, fungsi-fungsi transformasi geometri dipusatkan pada file berikut:

| Fitur | Layer | Lokasi File | Fungsi Utama |
| :--- | :--- | :--- | :--- |
| **Rotate** | Service | `backend/services/transform_service.py` | `rotate_image` |
| **Flip** | Service | `backend/services/transform_service.py` | `flip_image` |
| **Crop** | Service | `backend/services/transform_service.py` | `crop_image` |
| **Resize** | Service | `backend/services/transform_service.py` | `resize_image` |
| **Translate** | Service | `backend/services/transform_service.py` | `translate_image` |
| **API Entry Point**| Router | `backend/routers/transform.py` | `transform_endpoint` |

---

## 2. Bedah Formula Affine & Interpolasi

### A. Matriks Transformasi Geometri (Affine Matrix)
Aplikasi menggunakan matriks Affine 2D berukuran $2 \times 3$ yang memetakan koordinat asli $(x, y)$ ke koordinat baru $(x', y')$:
$$ \begin{bmatrix} x' \\ y' \end{bmatrix} = \begin{bmatrix} a_{11} & a_{12} & t_x \\ a_{21} & a_{22} & t_y \end{bmatrix} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix} $$

*   **Translasi**: Pada fungsi `translate_image`, matriks didefinisikan secara eksplisit sebagai `[[1, 0, tx], [0, 1, ty]]`. Ini langsung menggeser titik piksel ke kanan sebesar $tx$ dan ke bawah sebesar $ty$.
*   **Rotasi**: Fungsi `rotate_image` menggunakan `cv2.getRotationMatrix2D` yang menghitung gabungan translasi (ke titik pusat), rotasi (menggunakan $\cos \theta$ dan $\sin \theta$), dan translasi balik.

### B. Interpolasi
Ketika piksel digeser, diputar, atau di-scaling, koordinat baru seringkali bernilai desimal (tidak jatuh tepat di atas piksel 1x1). Untuk itu diperlukan interpolasi:
*   **Nearest Neighbor (`cv2.INTER_NEAREST`)**: Mengambil nilai piksel terdekat. Prosesnya sangat cepat namun menghasilkan gambar yang bergerigi (*pixelated/aliased*).
*   **Bilinear/Linear (`cv2.INTER_LINEAR`)**: Melakukan rata-rata tertimbang (*weighted average*) dari 4 piksel terdekat. Digunakan sebagai default pada Resize dan Translate di project ini karena memberikan hasil yang mulus.
*   **Lanczos (`cv2.INTER_LANCZOS4`)**: Interpolasi tingkat tinggi menggunakan fungsi Sinc pada area $8 \times 8$ piksel. Digunakan pada Rotasi dan perpaduan Crop-Resize di proyek ini untuk kualitas maksimal tanpa blur.

---

## 3. Analisis Bug & Edge Cases

1.  **Rotasi & Area Kosong (Padding)**:
    *   *Masalah Umum*: Rotasi 45 derajat sering memotong sudut gambar jika kanvas tidak diperbesar.
    *   *Solusi di Kode*: Fungsi `rotate_image` secara otomatis menghitung *bounding box* baru: `new_w = int(np.ceil(h * sin + w * cos))`. Selain itu, kode menangani channel Alpha (transparansi) secara pintar sehingga *padding* hitam digantikan oleh *transparent padding*.
2.  **Crop Out-of-Bounds**:
    *   *Masalah Umum*: Input koordinat $(x, y)$ melebihi lebar/tinggi gambar menyebabkan *IndexError*.
    *   *Solusi di Kode*: `crop_image` mengamankan ini menggunakan fungsi *clipping*: `x1 = max(0, min(x1, w))`.
3.  **Translasi**:
    *   Sesuai standar *image editor*, fungsi translasi menjaga ukuran kanvas tetap (`w, h`). Bagian gambar yang keluar akan terpotong, dan ruang kosong di belakangnya diisi dengan `(0, 0, 0, 0)` atau transparan menggunakan mode `cv2.BORDER_CONSTANT`.

---

## 4. Rekomendasi Perbaikan Kode

1.  **Standardisasi Interpolasi Lanczos**:
    *   Pada fungsi `resize_image`, opsi interpolasi yang tersedia hanya `linear` dan `nearest`. Sebaiknya tambahkan `lanczos` sebagai opsi untuk user, mengingat fungsi `rotate_image` sudah menggunakan algoritma kelas atas ini.
2.  **Pemisahan Logika Rotasi & Masking**:
    *   Fungsi `rotate_image` sedikit membengkak dengan adanya logika pembersihan mask alpha (Fungsi internal `_crop_to_alpha_content`). Hal ini berpotensi sedikit membebani komputasi berulang. Walaupun efektif untuk *Mini Photoshop*, untuk gambar skala besar > 4K hal ini dapat diperbaiki menggunakan *bounding box tracking* tanpa memutar ulang mask penuh.

---
**Status Modul 3:** `TERVERIFIKASI` (Rotasi bebas potong, Crop aman, Translasi dan Resize bekerja sesuai dengan operasi pemetaan Affine).
