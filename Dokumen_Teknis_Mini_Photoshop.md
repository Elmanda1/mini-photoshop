# Dokumen Teknis: Mini Photoshop

**Proyek:** Mini Photoshop - Aplikasi Pengolahan Citra Digital Berbasis Web  
**Mata Kuliah:** Pengolahan Citra Digital  
**Teknologi:** Python (FastAPI), React (Next.js), OpenCV, TensorFlow  

---

## 1. Pendahuluan

### 1.1 Deskripsi Proyek
Mini Photoshop adalah aplikasi berbasis web yang dirancang untuk melakukan berbagai operasi pengolahan citra digital secara interaktif. Aplikasi ini menyediakan 11 modul utama yang mencakup manipulasi dasar hingga pengenalan objek berbasis kecerdasan buatan (AI).

### 1.2 Tujuan Sistem
- Memberikan antarmuka yang intuitif untuk pengolahan citra tanpa memerlukan perangkat lunak berat.
- Mengimplementasikan konsep-konsep utama pengolahan citra digital seperti enhancement, transformasi geometrik, deteksi tepi, dan segmentasi.
- Mengintegrasikan model Machine Learning untuk fitur nilai tambah berupa pengenalan objek.

---

## 2. Arsitektur Sistem

Sistem ini menggunakan arsitektur **Stateless REST API** dengan pemisahan yang jelas antara Frontend dan Backend.

### 2.1 Diagram Blok Arsitektur
- **Frontend (Client):** Dibangun menggunakan Next.js. Bertanggung jawab atas UI/UX, manajemen state gambar, dan visualisasi histogram.
- **Backend (Server):** Dibangun menggunakan FastAPI. Bertanggung jawab atas logika pemrosesan citra menggunakan OpenCV dan inferensi model AI menggunakan TensorFlow.
- **Komunikasi:** Data gambar dikirim dalam format **Base64** melalui body request JSON.

### 2.2 Stack Teknologi
| Layer | Teknologi |
| :--- | :--- |
| **Backend Framework** | FastAPI (Python 3.9+) |
| **Image Processing** | OpenCV, NumPy, Pillow |
| **Machine Learning** | TensorFlow (CNN Model) |
| **Frontend Framework** | Next.js 15+ (React 19) |
| **Styling** | Tailwind CSS 4 |
| **Data Visualization** | Chart.js (Histogram) |
| **API Client** | Axios |

---

## 3. Spesifikasi Modul (11 Modul)

Aplikasi ini terdiri dari modul-modul berikut:

1.  **Image Management**: Fitur load, save, reset gambar, dan perbandingan panel Before/After.
2.  **Image Enhancement**: Penyesuaian Brightness & Contrast, Histogram Equalization, Sharpening, dan Smoothing (Blur).
3.  **Geometric Transformation**: Rotasi (0–360°), Flip (H/V), Crop (Canvas-based), Resize (Scaling), dan Translasi.
4.  **Image Restoration (Noise Reduction)**: Gaussian Blur, Median Filter, dan penghapusan Salt & Pepper noise.
5.  **Binary & Edge Processing**: Thresholding (Biner), Deteksi Tepi (Canny, Sobel, Prewitt, Robert, Laplacian, LoG), dan Morfologi (Erosi/Dilatasi).
6.  **Color Processing**: Konversi Grayscale, Channel Splitting (R, G, B), serta manipulasi Hue & Saturation.
7.  **Image Segmentation**: Segmentasi berbasis Threshold, Tepi, dan Region-based.
8.  **Image Compression**: Simulasi kompresi JPEG dengan slider kualitas dan perbandingan ukuran file secara real-time.
9.  **Histogram Analysis**: Visualisasi distribusi intensitas pixel (grayscale) secara real-time untuk gambar sebelum dan sesudah diproses.
10. **User Interface (GUI)**: Antarmuka modern dengan Dark Theme, Tool Panel, dan slider parameter yang responsif.
11. **AI Object Recognition**: Pengenalan objek (Manusia vs Bukan Manusia) menggunakan model CNN kustom.

---

## 4. Detail Implementasi AI Object Recognition

Modul AI menggunakan arsitektur **Convolutional Neural Network (CNN)** kustom.

- **Arsitektur Model**:
    - Input: 112x92x1 (Grayscale)
    - Convolutional Layers (32 filters 3x3, 64 filters 3x3)
    - Batch Normalization & Max Pooling
    - Dense Layers (128 neurons, Dropout 0.5)
    - Output: 1 neuron (Sigmoid)
- **Dataset**: LFW (Labeled Faces in the Wild) untuk wajah manusia dan citra acak (Picsum/Synthetic Noise) untuk bukan manusia.
- **Pipeline**: Preprocessing → Multi-Cascade Face Detection → CNN Inference.

---

## 5. Daftar API Endpoint

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| **POST** | `/api/image/load` | Mengunggah gambar ke server. |
| **POST** | `/api/image/save` | Mengunduh hasil olah citra. |
| **POST** | `/api/enhance` | Operasi kecerahan, kontras, dsb. |
| **POST** | `/api/transform` | Operasi rotasi, resize, crop, dsb. |
| **POST** | `/api/filter` | Operasi filter spasial (noise reduction). |
| **POST** | `/api/edge` | Operasi deteksi tepi dan morfologi. |
| **POST** | `/api/color` | Operasi ruang warna dan channel. |
| **POST** | `/api/segment` | Operasi segmentasi citra. |
| **POST** | `/api/compress` | Simulasi kompresi citra. |
| **POST** | `/api/histogram` | Mengambil data histogram citra. |
| **POST** | `/api/ml/recognize` | Inferensi AI untuk pengenalan objek. |

---

## 6. Detail Implementasi Sistem

### 6.1 Backend (FastAPI & OpenCV)
- **Service-Router Pattern**: Setiap modul memiliki router sendiri di `backend/routers/` yang memanggil fungsi logika di `backend/services/`. Hal ini mempermudah maintenance dan debugging.
- **Image Preprocessing**: Semua gambar yang diterima dalam format Base64 didekode menjadi array NumPy (BGR) sebelum diproses. Hasil proses dienkode kembali ke Base64 untuk dikirim ke frontend.
- **Statelessness**: Server tidak menyimpan state gambar. Setiap request mengirimkan data gambar yang akan diproses beserta parameternya.

### 6.2 Frontend (Next.js & React)
- **Canvas-based Rendering**: Gambar ditampilkan menggunakan elemen `<canvas>` melalui komponen `ImageCanvas.tsx` untuk kontrol rendering yang lebih presisi.
- **Modular Tool Panel**: Komponen `ToolPanel.tsx` menyediakan kontrol dinamis (slider, button, dropdown) untuk setiap modul pengolahan citra.
- **Real-time Histogram**: Menggunakan `Chart.js` via `HistogramChart.tsx` untuk menampilkan distribusi pixel secara responsif.
- **State Management**: Menggunakan React Hooks (`useState`, `useEffect`) untuk mengelola state gambar original, gambar hasil olah, dan histori histogram.

---

## 7. Struktur Folder Proyek

```text
mini-photoshop/
├── backend/
│   ├── main.py              # Entry point FastAPI
│   ├── routers/             # Endpoint per modul (REST API)
│   ├── services/            # Logika pemrosesan OpenCV/NumPy
│   └── models/              # File model .h5 dan Haar Cascades
└── frontend/
    ├── src/app/             # Pages & Layout Next.js
    ├── src/components/      # UI Components (Canvas, ToolPanel, dll)
    └── src/lib/api.ts       # Service komunikasi Axios
```

---

## 7. Panduan Instalasi & Menjalankan Sistem

### Backend
1. Masuk ke folder `backend`.
2. Buat Virtual Environment: `python -m venv venv`.
3. Instal dependensi: `pip install -r requirements.txt`.
4. Jalankan server: `uvicorn main:app --reload`.

### Frontend
1. Masuk ke folder `frontend`.
2. Instal dependensi: `npm install`.
3. Jalankan development server: `npm run dev`.
4. Akses aplikasi di `http://localhost:3000`.

---
*Dokumen ini disusun sebagai representasi teknis dari sistem Mini Photoshop.*
