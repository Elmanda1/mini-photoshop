# Analisis Mendalam - Modul 6: Color Processing
## Projek: Mini Photoshop

Dokumen ini berisi analisis teknis terhadap implementasi Modul 6: Color Processing, mencakup pengubahan ke Grayscale, memisahkan channel R-G-B, dan manipulasi Hue/Saturation.

---

## 1. Analisis & Pemetaan Kode

Pemrosesan warna gambar (manipulasi Color Space) terpusat pada file:

| Fitur | Layer | Lokasi File | Fungsi Utama |
| :--- | :--- | :--- | :--- |
| **Grayscale** | Service | `backend/services/color_service.py` | `to_grayscale` |
| **Channel Split** | Service | `backend/services/color_service.py` | `split_channel` |
| **Hue/Saturation**| Service | `backend/services/color_service.py` | `adjust_hue_saturation` |
| **Colorize (Tint)**| Service | `backend/services/color_service.py` | `colorize` |
| **API Entry Point**| Router | `backend/routers/color.py` | `color_endpoint` |

---

## 2. Bedah Teknis Manipulasi Warna

### A. Konversi Ruang Warna RGB -> Grayscale
Proyek ini mengandalkan fungsi `cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)`. OpenCV tidak menggunakan rata-rata lurus $(R+G+B)/3$ melainkan **bobot luminans** persepsi mata manusia:
$$ Gray = 0.114 \times B + 0.587 \times G + 0.299 \times R $$
Ini memastikan warna hijau muda terlihat lebih terang dalam skala abu-abu dibandingkan warna biru gelap. Agar frontend tidak rusak (mengingat format standar di aplikasi ini adalah array 3-lapis), hasil Grayscale ini lalu ditimpa (di-stack) kembali menjadi BGR buatan: `cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)`.

### B. Channel Splitting (Slicing Array NumPy)
Sistem NumPy memungkinkan akses seksi array dengan sangat mudah. Gambar RGB berbentuk kubus matriks $[Tinggi, Lebar, Warna]$.
Pada fungsi `split_channel`, developer sengaja membuat kanvas hitam raksasa:
`result = np.zeros_like(img)`
Lalu *copy-paste* tepat hanya satu indeks lapis dari gambar asli:
`result[:, :, 2] = img[:, :, 2]` (Menyalin layer indeks-2, yakni warna Merah pada BGR).
Karena layer hijau dan biru dibiarkan 0, maka hasil *channel split* akan **tampil sebagai gambar berwarna Merah gelap/terang**.

### C. Ruang Warna HSV (Hue, Saturation, Value)
Untuk memanipulasi warna yang sesungguhnya tanpa mengubah tingkat gelap-terang bayangan pada gambar, algoritma melakukan konversi ke **HSV**.
*   **H (Hue)**: Jenis Warna, merupakan sebuah lingkaran roda (0 - 180 derajat pada OpenCV).
    Kode menggunakan aritmatika modulus (Sisa Bagi): `(hsv[:, :, 0] + hue_shift) % 180` agar jika pergeseran warna melebihi batas batas ungu/merah, nilainya melingkar kembali ke awal.
*   **S (Saturation)**: Ketebalan/Kepudaran Warna. Dikalikan secara linier `hsv[:, :, 1] * saturation_scale`.
*   **V (Value)**: Tingkat penerangan, sengaja tidak disentuh dalam operasi modul ini.

---

## 3. Temuan Kelemahan Kode & Edge Cases

1.  **Format BGR vs RGB**: OpenCV membaca warna sebagai Blue-Green-Red (BGR). Web dan standar umum adalah RGB. Jika array ini tidak diterjemahkan saat di encode dengan Base64, gambar akan tampak dengan muka alien (biru jadi merah).
    *   *Analisis Kode*: Gambar tetap berada di ranah OpenCV secara penuh (mulai dari `decode` sampai ke proses pemotongan matriks `split_channel` dihitung pada BGR). Proses `imencode` milik OpenCV secara *default* memang mengubah susunan dari memori BGR langsung ke header standar PNG/JPG yang men-display RGB. **TIDAK ADA ERROR**. Urutan channel ditangani OpenCV dengan sempurna.
2.  **Saturasi Overflow**: Pada fungsi `adjust_hue_saturation` (Line 48), hasil kali array HSV dapat melebihi nilai byte. Developer **telah menggunakan `np.clip`** sehingga batas nilai 0-255 aman terkunci.

---

## 4. Rekomendasi Penyempurnaan

1.  **Channel Splitting Visibilitas**: Beberapa software lain lebih suka menampilkan hasil Channel Splitting dalam warna Abu-Abu yang mendeskripsikan intensitas, bukan sebagai warna murni. (Misal: Channel R dipresentasikan sebagai gambar Grayscale dimana bagian paling terang mengindikasikan komponen merah terkuat). Namun, pendekatan visual berwarna Merah-murni yang sekarang ada, sudah memenuhi kebutuhan spesifikasi dasar.
2.  **Blend Intensity di Colorize**: Pada line 88, fungsi `colorize` membenturkan transparansi hasil modifikasi via `cv2.addWeighted`. Sangat elegan karena mempertahankan saturasi orisinil sebagian dan mengkawinkannya secara natural tanpa menghasilkan *color banding*.
