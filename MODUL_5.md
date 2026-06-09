# Analisis Mendalam - Modul 5: Binary & Edge Processing
## Projek: Mini Photoshop

Dokumen ini berisi analisis teknis terhadap implementasi Modul 5: Binary & Edge Processing, mencakup deteksi tepi (Canny, Sobel, Prewitt, Robert, Laplacian, LoG), tresholding biner, dan morfologi.

---

## 1. Analisis & Pemetaan Kode

Berdasarkan pencarian codebase, pemrosesan tepi dan morfologi ditempatkan pada file:

| Fitur | Layer | Lokasi File | Fungsi Utama |
| :--- | :--- | :--- | :--- |
| **Canny, Sobel** | Service | `backend/services/edge_service.py` | `canny_edge`, `sobel_edge` |
| **Prewitt, Robert**| Service | `backend/services/edge_service.py` | `prewitt_edge`, `robert_edge` |
| **Laplacian, LoG** | Service | `backend/services/edge_service.py` | `laplacian_edge`, `log_edge` |
| **Morphology** | Service | `backend/services/edge_service.py` | `erosion`, `dilation` |
| **Threshold** | Service | `backend/services/edge_service.py` | `threshold_binary` |
| **API Entry Point**| Router | `backend/routers/edge.py` | `edge_endpoint` |

---

## 2. Teori Teknis ke Implementasi Kode

### A. Deteksi Tepi Berbasis Gradien (Sobel, Prewitt, Robert)
Operator jenis ini bekerja dengan mencari lompatan warna drastis (gradien tinggi).
1.  Sistem melakukan pemindaian horizontal (Sumbu X) dan vertikal (Sumbu Y) secara terpisah menggunakan dua kernel konvolusi (`cv2.filter2D`).
2.  Besaran tepi sesungguhnya (Magnitude) digabungkan melalui teorema Pythagoras: $M = \sqrt{G_x^2 + G_y^2}$.
3.  Khusus untuk Prewitt dan Robert, aplikasi Mini Photoshop secara manual meng-hardcode matriks NumPy seperti `np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]])` yang secara harfiah menghitung selisih nilai intensitas dari piksel sebelah kiri dan kanan.

### B. Deteksi Tepi Kelas Atas (Canny & LoG)
*   **Canny**: Adalah algoritma multi-tahap (Blur -> Sobel -> Non-maximum Suppression -> Hysteresis). `cv2.Canny` menghasilkan garis tepi berukuran persis 1-piksel yang paling optimal untuk analisa gambar lanjutan.
*   **LoG (Laplacian of Gaussian)**: Tepi dideteksi berdasarkan pelacakan nilai "*zero-crossing*" turunan orde-kedua matriks gambar, namun disaring oleh blur Gaussian (`log_edge` menggunakan `cv2.GaussianBlur` terlebih dahulu) agar rentan terhadap noise turun drastis.

### C. Operasi Morfologi (Erosi & Dilatasi)
Morfologi menggunakan *Structuring Element* — matriks persegi berisikan nilai 1 (diciptakan via `np.ones((kernel_size, kernel_size), np.uint8)`).
*   **Erosi (`cv2.erode`)**: Memangkas warna putih pada gambar biner, seolah mengikis batas-batas objek (untuk menghapus sisa noise tepi).
*   **Dilatasi (`cv2.dilate`)**: Menebalkan/menambah lapisan warna putih. Sering dipakai untuk menutup lobang kosong di tengah objek.

---

## 3. Analisis Kesalahan Kode (Overflow Analysis)

Ada potensi fatal pada deteksi tepi jika perhitungan kalkulus derivatif dihitung sembarangan:
*   **Potensi Error Overflow**: Gradien (Magnitude) seperti $G_x$ dan $G_y$ memiliki nilai negatif (dari transisi putih ke hitam), dan ketika ditambahkan, nilainya bisa jauh melampaui batas maksimum `uint8` (255).
*   **Solusi pada Kode**: Mini Photoshop **SUDAH AMAN**. Pada `sobel_edge`, `laplacian_edge`, dll, developer secara sadar menggunakan `cv2.CV_64F` (Float 64-bit memori luas) saat melakukan konvolusi. Setelah perhitungan selesai, program memanggil `cv2.normalize(..., 0, 255)` untuk memadatkan nilainya kembali ke dalam format uint8 tanpa merusak gambar (Baris 38, 49, dst di `edge_service.py`).
*   **Kecocokan Mask Biner**: Thresholding (`cv2.threshold`) dengan baik mengubah gambar menjadi format abu-abu tunggal kemudian di-merge kembali menggunakan `cv2.cvtColor(..., cv2.COLOR_GRAY2BGR)`. Ini mencegah *shape mismatch error* ketika digabungkan ke frontend yang meminta array 3-channel.

---

## 4. Rekomendasi Perbaikan

1.  **Tipe Interpolasi Prewitt/Robert**: Implementasi filter2D manual ini menggunakan `cv2.CV_64F` yang mana sudah tepat. Secara fungsional sistem ini sudah optimal.
2.  **Otsu's Thresholding**: Saat ini `threshold_binary` mengharuskan user mencari angka pasti (`thresh_value`). Di dunia nyata, intensitas lampu berubah-ubah. Sebaiknya tambahkan metode `cv2.THRESH_OTSU` yang bisa memilah dua gunung (puncak abu-abu dan puncak putih) pada histogram untuk menebak *threshold ideal* secara otomatis.
