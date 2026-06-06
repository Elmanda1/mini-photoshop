# LAPORAN TEKNIS LENGKAP: MINI PHOTOSHOP
**Aplikasi Pengolahan Citra Digital Berbasis Web**

---

## 1. PENDAHULUAN

### 1.1 Latar Belakang
Mini Photoshop adalah proyek pengembangan aplikasi web yang bertujuan untuk mendemonstrasikan implementasi algoritma pengolahan citra digital (PCD) ke dalam antarmuka yang modern dan interaktif. Proyek ini memenuhi spesifikasi tugas mata kuliah Pengolahan Citra Digital yang diampu oleh **Rizki Elisa Nalawati, S.T., M.T.**

### 1.2 Tujuan dan Lingkup Proyek
Tujuan utama proyek ini adalah membangun platform pengolahan citra yang mencakup manipulasi piksel dasar, transformasi spasial, filtering, segmentasi, hingga implementasi kecerdasan buatan (CNN). Sistem dirancang menggunakan arsitektur *Client-Server* yang memisahkan logika pemrosesan citra yang berat di sisi Backend (Python) dan antarmuka responsif di sisi Frontend (Next.js).

---

## 2. ARSITEKTUR DAN STACK TEKNOLOGI

### 2.1 Konsep Arsitektur: Stateless REST API
Aplikasi ini menggunakan model **Stateless**, di mana server tidak menyimpan data gambar secara permanen. Setiap permintaan (*request*) dari klien membawa muatan data gambar lengkap dalam format **Base64**. Hal ini memungkinkan server untuk melakukan skalabilitas horizontal dengan mudah.

### 2.2 Komponen Stack Teknologi
| Layer | Komponen | Deskripsi |
| :--- | :--- | :--- |
| **Backend** | **FastAPI (Python 3.10)** | Framework web performa tinggi berbasis ASGI. |
| **PCD Engine** | **OpenCV 4.x & NumPy** | Library utama untuk manipulasi matriks citra dan visi komputer. |
| **ML Engine** | **TensorFlow & Keras** | Digunakan untuk inferensi model CNN Object Recognition. |
| **Frontend** | **Next.js 15 (React 19)** | Framework web untuk rendering sisi server dan klien yang cepat. |
| **Styling** | **Tailwind CSS 4.0** | Framework CSS utility-first untuk desain UI modern (Dark Mode). |
| **Visualisasi** | **Chart.js & React-Chartjs-2** | Untuk rendering histogram distribusi pixel secara real-time. |

---

## 3. SPESIFIKASI TEKNIS 11 MODUL

Berikut adalah rincian teknis dari setiap modul yang diimplementasikan:

### Modul 1: Image Management
- **Fitur**: Load (JPG, PNG, BMP), Save (pilihan format), Reset ke Gambar Awal.
- **Teknis**: Manajemen state gambar menggunakan React `useState`. Perbandingan panel *Before/After* menggunakan layout flexbox responsif.

### Modul 2: Image Enhancement
- **Brightness & Contrast**: Implementasi formula `(pixel * brightness - 0.5) * contrast + 0.5` dengan normalisasi range [0.0 - 1.0].
- **Sharpening**: Menggunakan metode **Unsharp Masking (USM)**. Citra dipertajam dengan mengurangkan versi blur dari citra asli, efektif untuk menonjolkan detail tanpa noise berlebih.
- **Histogram Equalization**: Transformasi intensitas pixel agar distribusinya merata menggunakan `cv2.equalizeHist`. Untuk gambar berwarna, transformasi dilakukan pada channel Y dalam ruang warna YCrCb untuk menjaga integritas warna.

### Modul 3: Geometric Transformation
- **Rotation**: Transformasi Affine menggunakan matriks rotasi 2D. Canvas diperluas secara dinamis untuk menampung seluruh area citra yang diputar agar tidak terpotong.
- **Translation**: Pergeseran posisi citra dengan pengisian border transparan (Alpha Channel).
- **Flip**: Pembalikan citra secara Horizontal (Sumbu Y), Vertikal (Sumbu X), atau Keduanya.
- **Crop & Resize**: Implementasi interpolasi **Lanczos4** untuk menjaga kualitas gambar saat diperbesar atau diperkecil.

### Modul 4: Image Restoration (Noise Reduction)
- **Gaussian Blur**: Smoothing citra menggunakan filter low-pass dengan kernel Gaussian.
- **Median Filter**: Efektif untuk menghilangkan noise **Salt & Pepper** dengan mengambil nilai tengah dari area sekitar piksel.

### Modul 5: Binary & Edge Processing
- **Metode Deteksi Tepi**: Canny, Sobel, Prewitt, Robert, Laplacian, dan LoG (Laplacian of Gaussian).
- **Morfologi**: Implementasi Erosi (pengurangan objek) dan Dilatasi (penebalan objek) menggunakan elemen penstruktur (structuring element) matriks 5x5.

### Modul 6: Color Processing
- **Grayscale**: Konversi ruang warna BGR ke Grayscale.
- **Hue & Saturation**: Manipulasi citra dalam ruang warna **HSV** (Hue, Saturation, Value) untuk mengubah corak warna tanpa merusak intensitas cahaya.
- **Colorize**: Fitur pemberian *tint* warna tertentu dengan mempertahankan luminansi asli gambar.

### Modul 7: Image Segmentation
- **Threshold-based**: Pemisahan objek berdasarkan ambang batas intensitas.
- **Edge-based**: Deteksi tepi Canny diikuti dengan penutupan celah (dilation) dan pengisian kontur untuk ekstraksi objek.
- **K-Means Clustering**: Segmentasi berbasis wilayah dengan mengelompokkan piksel ke dalam K cluster warna yang dominan.

### Modul 8: Image Compression
- **JPEG Simulation**: Menggunakan metode kuantisasi DCT untuk mensimulasikan kompresi. Pengguna dapat mengatur slider kualitas (1-100) dan melihat perbandingan ukuran file (Bytes) secara instan.

### Modul 9: Histogram Analysis
- **Distribusi Intensitas**: Menghitung jumlah piksel untuk setiap nilai intensitas (0-255).
- **Visualisasi**: Histogram ditampilkan secara berdampingan (*Before vs After*) untuk memvalidasi perubahan kontras setelah aplikasi modul enhancement.

### Modul 10: User Interface (GUI)
- **Layout**: Panel kontrol di sisi kiri (Tool Panel) dan area preview di sisi kanan.
- **Interaktivitas**: Slider responsif dengan mekanisme *Debounced Effect* untuk mencegah overload request API saat slider digeser dengan cepat.

### Modul 11: AI Object Recognition (Nilai Tambah)
- **Klasifikasi**: Membedakan antara Manusia (Human) dan Bukan Manusia (Not Human).
- **Inference Pipeline**: Deteksi wajah menggunakan *Haar Cascade* (Frontal & Profile) → Cropping → Normalisasi → Klasifikasi CNN.

---

## 4. ANALISIS MODEL AI (CNN RECOGNITION)

Modul AI menggunakan model **Convolutional Neural Network (CNN)** kustom dengan detail sebagai berikut:

- **Arsitektur Layer**:
  - `InputLayer`: Menerima citra Grayscale ukuran 112x92 piksel.
  - `Conv2D`: 32 & 64 filters untuk ekstraksi fitur spasial.
  - `BatchNormalization`: Untuk stabilitas pelatihan.
  - `Dense Layer`: 128 neurons dengan fungsi aktivasi ReLU.
  - `Dropout (0.5)`: Mencegah *overfitting* pada dataset terbatas.
  - `Output Layer`: 1 neuron dengan fungsi aktivasi **Sigmoid** (Klasifikasi Biner).
- **Threshold Keputusan**: Ditetapkan pada angka **0.7** (Keyakinan tinggi) untuk meminimalisir kesalahan deteksi pada antarmuka perangkat lunak.

---

## 5. STRUKTUR DATA DAN KOMUNIKASI API

### 5.1 Format Komunikasi
Frontend mengirimkan objek JSON berikut ke Backend:
```json
{
  "image": "data:image/png;base64,iVBORw0KGgo...",
  "params": {
    "brightness": 1.2,
    "contrast": 1.5
  }
}
```
Backend memproses dan mengembalikan Base64 gambar hasil olahan beserta metadata histogram atau hasil klasifikasi AI.

### 5.2 Skema Folder (Sisi Teknis)
- `/backend/routers`: Mendefinisikan endpoint API (HTTP POST/GET).
- `/backend/services`: Berisi implementasi algoritma OpenCV murni.
- `/frontend/src/components`: Berisi komponen UI atomik yang dapat digunakan kembali.
- `/frontend/src/lib/api.ts`: Modul pusat untuk semua pemanggilan API menggunakan Axios.

---

## 6. KESIMPULAN
Mini Photoshop berhasil mengintegrasikan 11 modul pengolahan citra digital ke dalam platform web yang fungsional. Penggunaan teknologi modern seperti FastAPI dan Next.js memastikan aplikasi berjalan dengan performa tinggi dan responsif, sementara implementasi AI memberikan nilai tambah yang signifikan pada sistem.

---
*Dokumen ini disusun untuk keperluan dokumentasi akademik Proyek PCD.*
