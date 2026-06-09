# Analisis Mendalam - Modul 7: Image Segmentation
## Projek: Mini Photoshop

Dokumen ini berisi analisis teknis terhadap implementasi Modul 7: Image Segmentation, mencakup segmentasi ambang batas (*Threshold*), berbasis tepi (*Edge-based*), dan pengelompokan region (*K-Means Clustering*).

---

## 1. Analisis & Pemetaan Kode

Fungsi untuk memilah gambar ke dalam kelompok objek (Foreground) dan *Background* diletakkan pada:

| Fitur | Layer | Lokasi File | Fungsi Utama |
| :--- | :--- | :--- | :--- |
| **Threshold Segmentation** | Service | `backend/services/segment_service.py` | `threshold_segmentation` |
| **Edge-Based Segmentation**| Service | `backend/services/segment_service.py` | `edge_segmentation` |
| **Region-Based (K-Means)** | Service | `backend/services/segment_service.py` | `region_segmentation` |
| **API Entry Point** | Router | `backend/routers/segment.py` | `segment_endpoint` |

---

## 2. Cara Kerja Klastering & Masking

### A. Threshold-based Masking (Isolasi Piksel)
Teknik paling sederhana untuk membuang background.
1.  Gambar diubah ke Grayscale.
2.  Piksel yang lebih gelap dari `thresh` dibuang menjadi hitam (0), yang lebih terang diputar menjadi putih (255) murni. Ini menciptakan **Masker Biner**.
3.  **Masking (`cv2.bitwise_and`)**: Gambar warna asli dan gambar aslinya lagi dibenturkan melalui pintu Masker Biner tersebut. Bagian di gambar asli yang jatuh pada porsi Masker hitam akan menjadi 0 (Hilang), sehingga meng-isolasi bentuk objeknya saja.

### B. Edge-based Region Extraction
Alih-alih menggunakan kecerahan warna, metode ini mencari batas pinggiran dari objek.
1.  Mendeteksi garis tepi menggunakan detektor **Canny**.
2.  **Penutupan Garis (Dilatasi)**: Garis pinggir Canny terkadang putus-putus. Kode `cv2.dilate` (Line 36) diterapkan untuk menyambung titik bocor menjadi pagar utuh.
3.  **Contour Filling**: Kode menelusuri alur batas melengkung via `cv2.findContours`. Setelah bentuk ruang ditemukan, isinya ditumpahkan cat putih penuh (`cv2.drawContours(mask, ... , 255, -1)`). Ini menciptakan objek siluet padat.
4.  Di-masking layaknya teknik Treshold.

### C. Region-based (K-Means Clustering)
Metode *Machine Learning* tanpa pengawasan (Unsupervised) yang mengelompokkan area dengan tekstur/warna seragam.
1.  Array gambar 3D dilelehkan (*flattened*) menjadi array piksel panjang `(-1, 3)` atau [JumlahPiksel, Tiga_Warna_BGR].
2.  K-Means menghitung jarak Euclid warna setiap piksel. Piksel yang mirip warnanya akan dikerucutkan ke jumlah k-tertentu (misalnya `num_regions = 3` berarti dipaksa menjadi tiga tipe warna unik di seluruh layar).
3.  Setiap piksel akan ditimpa menjadi warna sentroid-pusatnya. Efeknya mirip seperti filter gambar poster "Vector Art" / *Quantization*.

---

## 3. Analisis Potensi Gagal Sistem

1.  **Bayangan & Pencahayaan (*Thresholding & Edge*)**:
    Kedua operasi ini sangat kaku (`hard-coded threshold`). Gambar subjek putih yang difoto dengan latar yang memantulkan bayangan gelap separuh bidang akan menyebabkan bagian gambar yang ada bayangannya dianggap sebagai benda asing. **Ini adalah kelemahan standar pada metode non-AI**.
2.  **Performa K-Means**:
    K-Means adalah operasi matematis berat. Gambar resolusi tinggi (4000px) yang diformat dengan tipe Float32 (`astype(np.float32)`) di Line 52 bisa membuat prosesor bekerja bermenit-menit sebelum selesai. Terdapat parameter pengaman iterasi `TERM_CRITERIA_MAX_ITER` sejumlah 100 putaran yang akan menyelamatkan server dari *infinite loop*, tetapi RAM usage bisa meroket sesaat.

---

## 4. Solusi & Rekomendasi Kode

1.  **Adaptive Thresholding**:
    Dibandingkan *Global Threshold* (satu nilai untuk semua layar), tambahkan dukungan ke `cv2.adaptiveThreshold`. Metode ini memotong kanvas ke beberapa kotak kecil 11x11 piksel dan mencari nilai pemisah yang pas untuk kotak redup dan kotak terang secara mandiri. Ini menyelesaikan masalah pencahayaan kompleks.
2.  **Downscale Sebelum K-Means**:
    Untuk mempercepat proses Region Segmentation, algoritma sebaiknya mengecilkan gambar (misal dibatasi tinggi 800px) sebelum menjalankan `cv2.kmeans`, karena tujuannya hanya untuk menemukan "klaster kelompok warna". Jika diimplementasikan pada dataset besar, ini menghemat *response time* API hingga 80%.
