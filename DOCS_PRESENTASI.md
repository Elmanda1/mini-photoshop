# Script Presentasi Detail: Walkthrough Mini Photoshop
**Mata Kuliah:** Pengolahan Citra Digital

---

## 🎬 PEMBUKAAN: Landing Page
*(Tampilan: Website Landing Page Modern dengan tombol "Get Started")*

**Presenter 1:**
"Selamat pagi semuanya. Inilah **Mini Photoshop**. Kita mulai dari halaman utama. Aplikasi ini dirancang dengan antarmuka modern menggunakan Next.js. Di sini pengguna bisa melihat ringkasan fitur utama sebelum masuk ke inti aplikasi."

**Presenter 2:**
"Langsung saja, kita klik tombol **'Get Started'** untuk masuk ke editor utama."

---

## 🛠️ PHASE 1: Data Entry & Management (Modul 1)
*(Tampilan: Editor Kosong, lalu muncul dialog upload)*

**Presenter 1:**
"Langkah pertama adalah **Image Management**. Saya akan mengunggah sebuah foto. Sistem mendukung format JPG dan PNG. Perhatikan di panel kiri, gambar asli tetap dipertahankan sebagai referensi (*Before*), sementara kanvas utama menjadi area kerja kita (*After*)."

---

## 📐 PHASE 2: Spasial & Kualitas (Modul 2 & 3)
*(Tampilan: Memainkan slider Brightness dan melakukan Rotasi)*

**Presenter 1:**
"Sekarang, saya akan melakukan **Image Enhancement**. Saya geser slider *Brightness* dan *Contrast* ke kanan. Lihat bagaimana histogram di bawah berubah secara dinamis mengikuti sebaran intensitas piksel baru."

"Lalu, mari kita coba **Geometric Transformation**. Saya klik icon *Rotate*. Perhatikan teknik **Matriks Affine** yang kami gunakan: kanvas otomatis melebar agar sudut-sudut foto tidak terpotong. Saya juga akan melakukan **Crop** secara interaktif menggunakan *drag-area* untuk mengambil fokus objek tertentu."

---

## 🌫️ PHASE 3: Restorasi & Filter Lanjut (Modul 4 & 5)
*(Tampilan: Memilih menu Filter, gambar menjadi blur lalu tajam)*

**Presenter 2:**
"Masuk ke bagian saya. Jika gambar memiliki noise, kita gunakan **Image Restoration**. Saya terapkan **Median Filter**. Teknik konvolusi kernel ini secara efektif 'membuang' piksel pencilan seperti *salt & pepper*. Hasilnya, gambar menjadi jauh lebih bersih."

"Selanjutnya, **Edge Detection**. Saya akan memilih algoritma **Canny**. Sistem secara otomatis mengubah citra ke biner dan melakukan deteksi tepi yang sangat tajam. Ini adalah dasar dari segmentasi objek yang akan kita lihat nanti."

---

## 🎨 PHASE 4: Color & Segmentation (Modul 6 & 7)
*(Tampilan: Mengubah gambar ke Grayscale, lalu Split RGB)*

**Presenter 2:**
"Untuk manipulasi warna, saya klik **Channel Splitting**. Di sini kita bisa melihat komponen Red, Green, dan Blue secara terpisah. Ini membuktikan bahwa setiap citra digital hanyalah tumpukan matriks array 3 dimensi."

"Kita juga bisa melakukan **Segmentation** berbasis thresholding. Saya atur slider threshold-nya, dan kita bisa memisahkan objek utama dari latar belakangnya secara instan."

---

## 🤖 PHASE 5: The Showstopper - AI Recognition (Modul 11)
*(Tampilan: Menekan tombol "Run AI Recognition", muncul kotak di wajah)*

**Presenter 2:**
"Terakhir, fitur paling canggih: **Object Recognition dengan CNN**. Saya tekan tombol 'AI Recognition'. Sistem mengirim data ke backend Python, di mana model CNN dengan 4 blok konvolusi yang kami latih akan bekerja."

"Lihat hasilnya! Sistem berhasil mendeteksi wajah manusia dan memberikan label identitas secara akurat. Model ini memproses ribuan fitur dari dataset ORL yang sudah kami integrasikan."

---

## 💾 PENUTUP: Saving & Export (Modul 8)
*(Tampilan: Klik Save, memilih kualitas)*

**Presenter 1:**
"Terakhir, kita simpan hasilnya. Kami menyediakan **Image Compression**. Pengguna bisa mengatur kualitas kompresi untuk menyeimbangkan antara ukuran file dan detail gambar."

**Presenter 2:**
"Demikian alur kerja Mini Photoshop, dari citra mentah hingga menjadi data yang siap guna. Terima kasih!"
