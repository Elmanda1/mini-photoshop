# Dokumentasi Teknis Lengkap: Mini Photoshop
**Proyek Mata Kuliah: Pengolahan Citra Digital**
**Dosen Pengampu:** Rizki Elisa Nalawati, S.T., M.T.

---

## 1. Pendahuluan
**Mini Photoshop** adalah sebuah platform pengolahan citra digital berbasis web yang mengintegrasikan komputasi performa tinggi di sisi Backend (Python + OpenCV) dengan antarmuka pengguna yang modern di sisi Frontend (Next.js + Tailwind CSS). Dokumen ini menjelaskan detail teknis dari setiap modul sesuai dengan spesifikasi kurikulum Pengolahan Citra Digital.

---

## 2. Bedah Modul Sistem

### 2.1. Image Management (Modul 1)
Mengelola siklus hidup data citra dari input hingga output.
*   **Fungsi:** Load (JPG, PNG, BMP), Save (Multi-format), Reset.
*   **Teknis:** Citra diterima dalam format Base64 dari frontend, dikonversi menjadi matriks NumPy (BGR) menggunakan `cv2.imdecode`.
*   **Implementasi:** `backend/services/image_service.py`.

### 2.2. Image Enhancement (Modul 2)
Memperbaiki kualitas visual citra untuk interpretasi manusia atau mesin.
*   **Brightness & Contrast:** Menggunakan operasi point-processing.
    *   Rumus: $g(x,y) = \alpha \cdot f(x,y) + \beta$
    *   Di mana $\alpha$ adalah kontras dan $\beta$ adalah kecerahan.
*   **Histogram Equalization:** Kami menggunakan **CLAHE (Contrast Limited Adaptive Histogram Equalization)** pada channel Luminance (Y) dalam ruang warna YCrCb untuk mencegah pergeseran warna (*color shifting*).
*   **Sharpening:** Teknik **Unsharp Masking**. Mengurangi versi blur dari citra asli untuk mendapatkan detail tepi, kemudian detail tersebut ditambahkan kembali ke citra asli.

### 2.3. Geometric Transformation (Modul 3)
Manipulasi spasial koordinat piksel.
*   **Rotate:** Transformasi affine berbasis pusat massa citra. 
    *   **Teknis:** Menggunakan `cv2.getRotationMatrix2D`. Implementasi kami menyertakan perhitungan bounding box baru sehingga gambar yang diputar 45 derajat tidak terpotong di bagian sudut.
*   **Flip:** Operasi pencerminan pada sumbu X (Horizontal), Y (Vertikal), atau keduanya.
*   **Resize:** Menggunakan interpolasi **Bilinear** (default) untuk hasil halus, atau **Nearest Neighbor** untuk menjaga ketajaman tepi pada objek biner.
*   **Translation:** Pergeseran matriks $[1, 0, tx; 0, 1, ty]$.

### 2.4. Image Restoration & Noise Reduction (Modul 4)
Menghilangkan gangguan (noise) yang muncul saat akuisisi citra.
*   **Gaussian Blur:** Filter lolos rendah (low-pass filter) untuk mereduksi noise Gaussian.
*   **Median Filter:** Sangat efektif untuk **Salt & Pepper Noise**. Mengganti piksel pusat dengan nilai median dari tetangganya, sehingga nilai ekstrem (0 atau 255) tereliminasi tanpa mengaburkan tepi secara signifikan.
*   **Teknis:** Menggunakan konvolusi kernel spasial dengan ukuran kernel dinamis (3x3 hingga 31x31).

### 2.5. Binary & Edge Processing (Modul 5)
Menganalisis struktur objek melalui segmentasi biner dan deteksi tepi.
*   **Thresholding:** Mengubah citra menjadi biner menggunakan nilai ambang tunggal.
*   **Edge Detection:**
    *   **Sobel/Prewitt/Robert:** Deteksi tepi berbasis gradien (turunan pertama).
    *   **Laplacian/LoG:** Deteksi tepi berbasis zero-crossing (turunan kedua).
    *   **Canny:** Metode optimal yang melibatkan *Non-Maximum Suppression* dan *Hysteresis Thresholding*.
*   **Morfologi:** **Erosion** untuk memperkecil objek (menghilangkan noise kecil) dan **Dilation** untuk memperbesar objek (menutup lubang).

### 2.6. Color Processing (Modul 6)
Manipulasi representasi warna dalam berbagai ruang warna.
*   **RGB to Grayscale:** Menggunakan standar BT.601 ($0.299R + 0.587G + 0.114B$).
*   **Channel Splitting:** Memecah array matriks 3D menjadi tiga matriks 2D independen.
*   **Hue/Saturation:** Manipulasi pada ruang warna **HSV** untuk kontrol warna yang lebih intuitif bagi manusia dibandingkan RGB.

### 2.7. Image Segmentation (Modul 7)
Memisahkan citra ke dalam beberapa bagian/region yang bermakna.
*   **Threshold-based:** Menggunakan masking biner untuk memotong objek.
*   **Edge-based:** Menggabungkan deteksi tepi dengan algoritma *Contour Finding*.
*   **Region-based:** Menggunakan **K-Means Clustering** untuk mengelompokkan piksel berdasarkan kesamaan warna secara otomatis.

### 2.8. Image Compression (Modul 8)
Mengurangi ukuran penyimpanan tanpa (atau dengan sedikit) kehilangan informasi penting.
*   **JPEG Simulation:** Menggunakan algoritma kuantisasi berbasis parameter kualitas. Semakin tinggi kuantisasi, semakin banyak informasi frekuensi tinggi yang dibuang (lossy).
*   **RLE Estimation:** Menghitung redundansi pada baris piksel yang sama (lossless).

### 2.9. Histogram Analysis (Modul 9)
Alat bantu statistik untuk memahami distribusi cahaya citra.
*   **Fitur:** Menampilkan histogram per channel (R, G, B) dan Grayscale.
*   **Teknis:** Menggunakan `cv2.calcHist` dan divisualisasikan menggunakan Chart.js di frontend.

### 2.10. User Interface (GUI) (Modul 10)
*   **Frontend:** React + Next.js dengan arsitektur komponen atom.
*   **Editor:** Mendukung *Live Preview* dengan latensi rendah melalui optimasi debouncing pada input slider.

### 2.11. Machine Learning Integration (Modul 11)
**Fitur Unggulan: Pengenalan Objek Wajah dengan CNN.**
*   **Arsitektur:** CNN Custom (4 Layer Konvolusi + Batch Normalization + Dropout).
*   **Dataset:** Gabungan **ORL Faces** (400 gambar) dan **LFW** (1200 gambar).
*   **Keunggulan:** Mampu mengenali identitas wajah secara real-time dengan akurasi di atas 90% pada data uji. Ukuran model ~82MB.

---

## 3. Penutup
Sistem Mini Photoshop ini berhasil mengintegrasikan seluruh materi utama mata kuliah Pengolahan Citra Digital ke dalam satu aplikasi yang fungsional dan siap pakai. Implementasi teknis menggunakan OpenCV memastikan akurasi hasil pengolahan sesuai dengan teori-teori akademis.
