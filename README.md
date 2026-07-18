<p align="center">
  <img src="docs/img/mini-photoshop%20(1).png" alt="Mini Photoshop Landing Page" width="800">
</p>

<h1 align="center">Mini Photoshop</h1>
<h3 align="center">Full-Stack Digital Image Processing Web Application</h3>

<p align="center">
  <strong>Pengolahan Citra, Lebih Sederhana</strong><br>
  Aplikasi berbasis <em>Python (FastAPI / OpenCV)</em> dan <em>Next.js (Tailwind CSS)</em> dengan 11 modul pengolahan citra digital dan AI real-time.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.9+-3776AB?style=flat&logo=python" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/OpenCV-4.10-5C3EE8?style=flat&logo=opencv" alt="OpenCV">
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=flat&logo=nextdotjs" alt="Next.js">
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat&logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/TensorFlow-2.14-FF6F00?style=flat&logo=tensorflow" alt="TensorFlow">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

---

## 📋 Daftar Isi

- [Tentang Mini Photoshop](#tentang-mini-photoshop)
- [Fitur & Modul](#fitur--modul)
- [Screenshot](#screenshot)
- [Arsitektur](#arsitektur)
- [Teknologi](#teknologi)
- [Instalasi](#instalasi)
- [Penggunaan](#penggunaan)
- [API Endpoints](#api-endpoints)
- [Lisensi](#lisensi)

---

## 🎯 Tentang Mini Photoshop

**Mini Photoshop** adalah aplikasi full-stack pengolahan citra digital yang menggabungkan kekuatan **Python (FastAPI + OpenCV)** di sisi backend dengan **Next.js + Tailwind CSS** di sisi frontend. Aplikasi ini menyediakan 11 modul pemrosesan gambar — dari enhancement, transformasi geometri, deteksi tepi, segmentasi, hingga pengenalan objek berbasis **CNN TensorFlow MobileNetV2** — semuanya dalam antarmuka web yang responsif dan modern.

Setiap operasi diproses secara stateless melalui REST API dengan format Base64, memungkinkan skalabilitas dan integrasi yang mudah.

---

## ✨ Fitur & Modul

| Modul | Deskripsi |
|---|---|
| **Image Management** | Load, save, dan export gambar dalam berbagai format |
| **Enhancement** | Brightness, contrast, histogram equalization, sharpen, blur |
| **Geometric Transform** | Rotate, flip, crop, resize, translate |
| **Noise Reduction** | Gaussian blur, median filter, salt & pepper noise reduction |
| **Edge Detection** | Canny, Sobel, Prewitt, Robert, Laplacian, LoG, morphology |
| **Color Processing** | Grayscale, channel splitting, hue/saturation adjustment |
| **Segmentation** | Threshold-based, edge-based, K-means region segmentation |
| **Compression** | JPEG quality simulation dengan perbandingan ukuran file real-time |
| **Histogram Analysis** | Visualisasi histogram real-time dengan before/after tracking |
| **AI Object Recognition** | CNN-based object classification (MobileNetV2) — top-5 predictions |
| **User Interface** | Dark UI, sliders, before/after panels, responsive controls |

---

## 🖼️ Screenshot

### Halaman Depan

<p align="center">
  <img src="docs/img/mini-photoshop%20(1).png" alt="Landing Page" width="700">
  <br>
  <em>Landing page — Tagline "Pengolahan Citra, Lebih Sederhana", deskripsi aplikasi full-stack 11 modul dengan AI real-time, tombol "Mulai Editor" & "Jelajahi Fitur", serta statistik: 11 Modul, 6 Metode Tepi, 30+ Operasi, CNN TensorFlow.</em>
</p>

### Editor — Tampilan Awal

<p align="center">
  <img src="docs/img/mini-photoshop%20(2).png" alt="Editor Kosong" width="700">
  <br>
  <em>Editor kosong sebelum upload gambar — area "Drop your image here" (dropzone) dengan tool panel di kiri (Enhancement, Transform, Noise Reduction, dst) dan panel AI Recognition di kanan.</em>
</p>

### Editor — Panel Enhancement

<p align="center">
  <img src="docs/img/mini-photoshop%20(3).png" alt="Panel Enhancement" width="700">
  <br>
  <em>Editor panel Enhancement — gambar Before/After identik (status "Original"), dengan kontrol Brightness, Contrast, Smart Enhance, Hist EQ, Sharpen, Blur.</em>
</p>

### Modal — Advanced Image Cropper

<p align="center">
  <img src="docs/img/mini-photoshop%20(4).png" alt="Advanced Image Cropper" width="700">
  <br>
  <em>Modal "Advanced Image Cropper" — alat crop dengan grid profesional, opsi orientasi (Landscape/Portrait), aspect ratio (Free/1:1/4:3/16:9), menampilkan ukuran asli 1200×1600 px.</em>
</p>

### Editor — Panel Edge & Binary

<p align="center">
  <img src="docs/img/mini-photoshop%20(5).png" alt="Panel Edge & Binary" width="700">
  <br>
  <em>Editor panel Edge & Binary — hasil Deteksi Tepi metode Prewitt (Gradien Simpel), kernel size 5, plus opsi Operasi Biner (Threshold Hitam-Putih). Panel kanan status "Edited" dengan edit history "Prewitt".</em>
</p>

### Editor — Panel Transform

<p align="center">
  <img src="docs/img/mini-photoshop%20(9).png" alt="Panel Transform" width="700">
  <br>
  <em>Editor panel Transform — hasil rotasi gambar 91° (Apply Rotation), opsi H-Flip/V-Flip, Translate X/Y, Scale. Edit history: "Rotate (Angle: 91°)".</em>
</p>

### Editor — Panel Segmentation & AI Recognition

<p align="center">
  <img src="docs/img/mini-photoshop%20(6).png" alt="Panel Segmentation & AI" width="700">
  <br>
  <em>Editor panel Segmentation — metode "K-means regions - color clusters" dengan 3 regions, After gambar tersegmentasi per warna. Panel AI Recognition dengan tombol "Recognize Object" (Human vs Not Human — Binary CNN TensorFlow).</em>
</p>

### Panduan Pengguna

<p align="center">
  <img src="docs/img/mini-photoshop%20(7).png" alt="Panduan Pengguna" width="700">
  <br>
  <em>Halaman "Panduan Pengguna" — dokumentasi manual langkah: 1. Persiapan Awal (backend & frontend), 2. Unggah Gambar, 3. Proses Pengolahan (Tool Panel & slider).</em>
</p>

### Dokumentasi API

<p align="center">
  <img src="docs/img/mini-photoshop%20(8).png" alt="Dokumentasi API" width="700">
  <br>
  <em>Halaman "Dokumentasi Lengkap API" — daftar endpoint untuk 11 modul, seluruhnya HTTP POST dengan base64 encoded image. Contoh: /enhance, /transform, /filter, /edge, /color, /segment, dan lainnya.</em>
</p>

---

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                  │
│                  Tailwind CSS — Dark UI               │
└──────────────────┬──────────────────────────────────┘
                   │        REST API (Base64 JSON)
                   ▼
┌─────────────────────────────────────────────────────┐
│           Backend (FastAPI — Python 3.9+)             │
│  OpenCV │ NumPy │ Pillow │ TensorFlow │ scikit-learn  │
└─────────────────────────────────────────────────────┘
```

- **Komunikasi:** Stateless REST API — seluruh gambar dikirim sebagai Base64 encoded string
- **Backend:** FastAPI dengan router per modul (enhance, transform, filter, edge, color, segment, compress, ml)
- **Frontend:** Next.js App Router dengan komponen React interaktif dan before/after panel

---

## 🛠️ Teknologi

- **Python 3.9+** — Bahasa pemrograman backend
- **FastAPI 0.115** — Framework REST API asinkron
- **OpenCV 4.10** — Pemrosesan citra digital
- **NumPy** — Komputasi numerik
- **Pillow** — Image I/O
- **TensorFlow 2.14+** — CNN MobileNetV2 (AI Object Recognition)
- **scikit-learn** — Algoritma K-means segmentation
- **Next.js 15** — Frontend React framework
- **Tailwind CSS 3** — Utility-first CSS framework

---

## ⚙️ Instalasi

### Prasyarat

- **Node.js & npm** (untuk frontend)
- **Python 3.9+** (untuk backend)
- **TensorFlow** — diperlukan untuk modul AI Object Recognition

### Langkah Instalasi

```bash
# Clone repositori
git clone https://github.com/username/mini-photoshop.git
cd mini-photoshop

# ─── Backend ───────────────────────────────────────
cd backend
python -m venv venv

# Aktivasi virtual environment:
# Windows:
#   venv\Scripts\activate
# Unix/macOS:
#   source venv/bin/activate

pip install -r requirements.txt

# Jalankan server backend (http://localhost:8000)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# ─── Frontend ─────────────────────────────────────
cd ../frontend
npm install
npm run dev
```

Buka **http://localhost:3000** di browser Anda.

---

## 🚀 Penggunaan

1. **Upload gambar** — Seret gambar ke area dropzone atau klik untuk memilih file
2. **Pilih modul** — Klik tool panel di sidebar kiri (Enhancement, Transform, Noise Reduction, Edge Detection, Color Processing, Segmentation, Compression)
3. **Sesuaikan parameter** — Gunakan slider dan kontrol untuk mengatur parameter operasi
4. **Compare** — Gunakan panel Before/After untuk melihat perubahan
5. **AI Recognition** — Klik "Recognize Object" untuk deteksi Human vs Not Human
6. **Export** — Simpan atau download hasil pengolahan

---

## 📡 API Endpoints

Seluruh endpoint menggunakan metode **HTTP POST** dengan body JSON `{"image": "<base64_string>"}`.

| Endpoint | Modul |
|---|---|
| `/api/enhance` | Brightness, contrast, sharpen, blur, histogram equalization |
| `/api/transform` | Rotate, flip, resize, crop, translate |
| `/api/filter` | Noise reduction — Gaussian, median, salt & pepper |
| `/api/edge` | Edge detection — Canny, Sobel, Prewitt, Robert, Laplacian, LoG |
| `/api/color` | Grayscale, channel splitting, hue/saturation |
| `/api/segment` | Threshold-based, edge-based, K-means segmentation |
| `/api/compress` | JPEG quality simulation |
| `/api/histogram` | Histogram data per channel (R, G, B) |
| `/api/ml/predict` | CNN object recognition (MobileNetV2) |

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License**. Lihat file [LICENSE](LICENSE) untuk detail lebih lanjut.

---
