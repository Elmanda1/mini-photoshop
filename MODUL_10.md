# Analisis Mendalam - Modul 10: GUI & ML Object Recognition
## Projek: Mini Photoshop

Dokumen ini berisi analisis teknis terhadap implementasi Modul 10: GUI (User Interface) dan fitur tambahan Pengenalan Objek menggunakan Machine Learning (CNN).

---

## 1. Analisis & Pemetaan Kode

Struktur antarmuka dan integrasi kecerdasan buatan dipetakan sebagai berikut:

| Fitur | Layer | Lokasi File | Komponen/Fungsi Utama |
| :--- | :--- | :--- | :--- |
| **Main UI Layout** | Frontend | `frontend/src/app/editor/page.tsx` | `EditorPage` component |
| **Tool Panel** | Frontend | `frontend/src/components/ToolPanel.tsx` | Manajemen slider dan event |
| **CNN Inference** | Backend | `backend/routers/ml.py` | `recognize_endpoint` |
| **ML Model Loading**| Backend | `backend/routers/ml.py` | `load_model` (TensorFlow/H5) |

---

## 2. Arsitektur Sistem & Integrasi CNN

### A. Framework GUI (Next.js + Tailwind)
Aplikasi menggunakan **React 18** dengan arsitektur komponen modern.
*   **Event Handling**: Setiap pergerakan slider (misal: Brightness) menggunakan *Live Preview System*. Perubahan nilai slider langsung dikirim ke `setLiveFilters` (Frontend) untuk rendering instan, atau ke backend melalui `onApply` dengan mekanisme *debounce* (menunggu user berhenti menggeser sejenak) agar server tidak kewalahan.
*   **State Management**: Menggunakan `useState` dan `useRef` untuk mengelola histori (*Undo/Redo*) gambar dalam bentuk array string Base64.

### B. Pengenalan Objek (CNN Hybrid)
Aplikasi menggunakan pendekatan **Tiered Detection** untuk klasifikasi "Human vs Not Human":
1.  **Tier 1 (ResNet SSD)**: Deteksi wajah menggunakan model Deep Learning SSD (Single Shot Detector) via OpenCV DNN. Ini sangat akurat untuk menemukan keberadaan manusia.
2.  **Tier 2 (Haar Cascade)**: Jika SSD gagal, sistem menggunakan algoritma klasifikasi tradisional untuk mencari pola wajah/mata.
3.  **Tier 3 (Custom CNN)**: Sebagai *last resort*, sistem memuat model TensorFlow `.h5` (arsitektur CNN kustom) untuk melakukan klasifikasi biner pada citra yang sudah di-resize ke 92x112 piksel dan di-normalisasi (Line 183 di `ml.py`).

---

## 3. Analisis Bottleneck & Bug

1.  **Inference Freezing**:
    *   *Analisis*: Backend FastAPI menjalankan inferensi CNN secara asinkron (`async def`). Namun, karena TensorFlow terkadang memblokir CPU saat komputasi berat, GUI frontend mungkin terasa sedikit tersendat selama ~1 detik saat tombol "Recognize" diklik.
    *   *Solusi*: Di backend sudah diantisipasi dengan loading model di awal (`@app.on_event("startup")`) sehingga saat tombol diklik, model sudah siap di memori.
2.  **Dimensi Input Tensor**:
    *   Kode sudah sangat teliti menangani dimensi input: `tensor = normalized.reshape(1, 112, 92, 1)`. Ini sesuai dengan arsitektur CNN yang dilatih (Single channel grayscale).
3.  **Image Dimension Mismatch**: Gambar dari UI bisa berbentuk 4-channel (RGBA). Kode di `ml.py` (Line 156) secara aman mengubahnya menjadi 3-channel (BGR) sebelum masuk ke detektor SSD, mencegah *crash* pada library OpenCV.

---

## 4. Rekomendasi Peningkatan Performa

1.  **Worker Thread (ML)**: Untuk menghindari hambatan pada *Main Thread* backend, proses inferensi TensorFlow dapat dipindahkan ke *Worker Thread* atau *Process Pool* jika traffic user meningkat.
2.  **UI Feedback**: Tambahkan *Skeleton Loader* atau animasi khusus pada panel AI Recognition saat proses `loading` bernilai true, agar user tahu bahwa AI sedang bekerja "berpikir".
3.  **TensorFlow Lite**: Jika ingin dijalankan di laptop dengan spesifikasi rendah, model `.h5` dapat dikonversi ke format `.tflite` untuk mempercepat inferensi hingga 3x lipat.

---
**Status Modul 10:** `TERVERIFIKASI` (GUI profesional dengan tema dark-mode yang elegan, dan integrasi ML yang sangat solid dengan sistem fallback bertingkat).
