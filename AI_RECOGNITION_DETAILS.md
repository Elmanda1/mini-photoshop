# Dokumentasi Teknis AI Recognition — Mini Photoshop
*(Diperbarui otomatis setelah optimasi penuh — Juni 2026)*

Dokumen ini merinci arsitektur, sumber data, dan logika pemrosesan yang digunakan dalam modul **AI Object Recognition** (Klasifikasi Human vs Not Human) serta modul **Face Recognition CNN** (klasifikasi 40 identitas).

---

## 1. Strategi Data (Dataset Sourcing) — Binary Classifier

Model binary dilatih menggunakan **~3.500+ citra** yang dikategorikan ke dalam dua kelas.

### A. Kelas: Human (Manusia) Tes Fatih
| Sumber | Jumlah | Keterangan |
|--------|--------|------------|
| **LFW (Labeled Faces in the Wild)** | ~1.200 | Foto wajah asli via `sklearn.datasets`. In-the-wild conditions. |
| **Contextual Human Synthesis** | ~500 | Wajah LFW ditempel ke latar belakang acak. Melatih model pada wajah non-close-up. |

### B. Kelas: Not Human (Bukan Manusia)
| Sumber | Jumlah | Keterangan |
|--------|--------|------------|
| **CIFAR-10** *(baru)* | ~1.500 | Dataset benchmark ML: airplane, automobile, bird, deer, frog, horse, ship, truck. Kelas cat & dog dikecualikan (terlalu mirip wajah). Jauh lebih clean dan representatif dari Picsum. |
| **Synthetic Digital/UI Noise** | ~800 | Pola geometris, garis, dan teks acak. Meminimalkan false positive pada screenshot UI/game. |

> **Kenapa mengganti Picsum?** Picsum Photos adalah endpoint gambar acak — berpotensi mengandung foto manusia di kelas "Not Human", mencemari label dataset. CIFAR-10 memiliki label ground-truth yang terverifikasi.

---

## 2. Arsitektur Model Binary CNN (Upgraded: 3 Conv Blocks)

| Layer | Tipe | Konfigurasi | Fungsi |
|:------|:-----|:------------|:-------|
| **Input** | Input | 112×92×1 (Grayscale) | Citra abu-abu untuk fokus pada struktur, bukan warna. |
| **Conv2D_1a/1b** | Convolution ×2 | 32 filters, 3×3, padding=same | Double conv: ekstraksi fitur dasar lebih kaya. |
| **BatchNorm + MaxPool + Dropout(0.25)** | — | — | Stabilisasi & reduksi dimensi. |
| **Conv2D_2a/2b** | Convolution ×2 | 64 filters, 3×3, padding=same | Fitur mid-level: bentuk, tekstur. |
| **BatchNorm + MaxPool + Dropout(0.25)** | — | — | |
| **Conv2D_3** | Convolution | 128 filters, 3×3, padding=same | **(Baru)** Fitur semantik tingkat tinggi. |
| **BatchNorm + MaxPool + Dropout(0.25)** | — | — | |
| **GlobalAveragePooling2D** | Pooling | — | **(Baru)** Menggantikan Flatten: parameter jauh lebih sedikit, generalisasi lebih baik. |
| **Dense(256) + BatchNorm + Dropout(0.5)** | FC | ReLU | Klasifikasi tingkat tinggi dengan regularisasi kuat. |
| **Output** | Dense | 1 neuron, Sigmoid | Probabilitas [0.0 – 1.0]. |

- **Loss:** `binary_crossentropy`
- **Optimizer:** `Adam(lr=0.0005)` *(tuned — sebelumnya default)*
- **Metrics:** Accuracy + AUC

---

## 3. Arsitektur Model Face Recognition CNN (Upgraded: 4 Conv Blocks)

| Layer | Tipe | Konfigurasi | Fungsi |
|:------|:-----|:------------|:-------|
| **Input** | Input | 112×92×1 | Citra ORL grayscale. |
| **Block 1** | Conv ×2 | 32 filters | Low-level (tepi, sudut). |
| **Block 2** | Conv ×2 | 64 filters | Mid-level (bentuk mata, mulut). |
| **Block 3** | Conv ×2 | 128 filters | High-level (pola wajah). |
| **Block 4** | Conv ×1 | 256 filters | **(Baru)** Deep semantic identity features. |
| **GlobalAveragePooling2D** | Pooling | — | **(Baru)** vs Flatten lama. |
| **Dense(512) + L2 + Dropout(0.5)** | FC | ReLU, L2(1e-4) | **(Baru)** L2 regularisasi untuk dataset kecil ORL. |
| **Output** | Dense | 40 neurons, Softmax | Probabilitas per identitas. |

- **Loss:** `SparseCategoricalCrossentropy`
- **Optimizer:** `Adam(lr=0.0005)`
- **Metrics:** Top-1 Accuracy + Top-3 Accuracy

---

## 4. Optimasi Training (Semua Model)

### Callbacks yang Ditambahkan
| Callback | Parameter | Fungsi |
|----------|-----------|--------|
| **EarlyStopping** | patience=8–10, restore_best_weights=True | Hentikan training saat val_loss tidak membaik → cegah overfit & hemat waktu |
| **ReduceLROnPlateau** | factor=0.5, patience=4–5, min_lr=1e-6 | Kurangi learning rate setengah saat plateau → konvergensi lebih halus |
| **ModelCheckpoint** | monitor=val_accuracy, save_best_only=True | Simpan model dengan val_accuracy tertinggi, bukan epoch terakhir |

### Fix Kritis Lainnya
| # | Fix | Dampak |
|---|-----|--------|
| ✅ | `horizontal_flip=False` | Flip wajah menciptakan "identitas palsu" yang membingungkan classifier |
| ✅ | `stratify=y` pada train_test_split | Distribusi kelas merata di train dan test set |
| ✅ | `padding='same'` pada semua Conv | Informasi spasial di tepi gambar tidak hilang |
| ✅ | Inference pakai `_best.h5` | Server memuat checkpoint terbaik, bukan epoch terakhir |
| ✅ | `verbose=0` pada predict | Server log lebih bersih |

---

## 5. Pipeline Inferensi (Tidak Berubah, Tetap Optimal)

1. **Preprocessing:** Grayscale + normalisasi pixel ke [0, 1]
2. **Multi-Cascade Face Detection:**
   - Frontal Face Haar Cascade
   - Profile Face Haar Cascade (fallback)
   - Jika ada wajah: crop + padding 20px
   - Jika tidak ada: gunakan seluruh gambar (contextual inference)
3. **Tuning Klasifikasi:** Threshold **0.7** (model harus >70% yakin untuk label "Human")

---

## 6. Metrik Performa (Historis & Target)

| Model | Sebelum Optimasi | Target Setelah Optimasi |
|-------|-----------------|------------------------|
| Binary (Human/Not Human) | ~94% accuracy | **>96% accuracy, AUC >0.98** |
| Face Recognition (40 kelas) | N/A (baru diukur) | **>85% Top-1, >95% Top-3** |

---
*Dokumen diperbarui otomatis oleh Antigravity IDE — Mini Photoshop v2.0*
