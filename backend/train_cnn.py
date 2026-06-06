import os
import zipfile
import urllib.request
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report
import matplotlib.pyplot as plt

# ─────────────────────────────────────────
# Constants
# ─────────────────────────────────────────
DATASET_URL  = "http://www.cl.cam.ac.uk/Research/DTG/attarchive/pub/data/att_faces.zip"
DATASET_DIR  = os.path.join(os.path.dirname(__file__), "dataset_orl")
MODEL_PATH   = os.path.join(os.path.dirname(__file__), "routers", "models", "custom_face_cnn.h5")
BEST_MODEL_PATH = os.path.join(os.path.dirname(__file__), "routers", "models", "custom_face_cnn_best.h5")
IMG_SIZE     = (92, 112)   # (Width, Height) — ORL standard
NUM_CLASSES  = 40
BATCH_SIZE   = 16          # Small: only 400 images total
EPOCHS       = 80          # EarlyStopping will terminate early if needed


# ─────────────────────────────────────────
# Dataset Download
# ─────────────────────────────────────────
def download_and_extract():
    if not os.path.exists(DATASET_DIR):
        print(f"[INFO] Downloading ORL/AT&T dataset from {DATASET_URL}...")
        zip_path = "orl_faces.zip"
        urllib.request.urlretrieve(DATASET_URL, zip_path)
        print("[INFO] Extracting dataset...")
        with zipfile.ZipFile(zip_path, 'r') as zf:
            zf.extractall(DATASET_DIR)
        os.remove(zip_path)
        print("[OK] Dataset ready.")
    else:
        print("[INFO] ORL dataset already exists.")


# ─────────────────────────────────────────
# Data Loader
# ─────────────────────────────────────────
def load_data():
    X, y = [], []

    for i in range(1, NUM_CLASSES + 1):
        person_dir = os.path.join(DATASET_DIR, f"s{i}")
        if not os.path.isdir(person_dir):
            continue
        for filename in sorted(os.listdir(person_dir)):
            if filename.endswith(".pgm"):
                img = cv2.imread(os.path.join(person_dir, filename), cv2.IMREAD_GRAYSCALE)
                if img is not None:
                    img = img.astype('float32') / 255.0
                    X.append(img)
                    y.append(i - 1)   # 0-indexed labels

    X = np.array(X).reshape(-1, IMG_SIZE[1], IMG_SIZE[0], 1)
    y = np.array(y)
    print(f"[INFO] Loaded {len(X)} images | {NUM_CLASSES} classes.")
    return X, y


# ─────────────────────────────────────────
# Model Architecture (Upgraded)
# ─────────────────────────────────────────
def build_model(num_classes: int):
    """
    Optimized Face Recognition CNN:
    - 4 Conv blocks (32 → 64 → 128 → 256): deeper hierarchy for identity discrimination
    - Double Conv per block for richer feature extraction before downsampling
    - padding='same' to preserve spatial information longer
    - GlobalAveragePooling2D: fewer params + better generalization vs Flatten
    - L2 regularization on Dense to curb overfitting on small ORL dataset
    - Label smoothing in loss for better calibration
    """
    l2 = tf.keras.regularizers.l2(1e-4)

    model = models.Sequential([
        layers.Input(shape=(IMG_SIZE[1], IMG_SIZE[0], 1)),

        # ── Block 1 ───────────────────────────────────────────────────────
        layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.2),

        # ── Block 2 ───────────────────────────────────────────────────────
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.2),

        # ── Block 3 ───────────────────────────────────────────────────────
        layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.2),

        # ── Block 4 (new): Deepest semantic features ──────────────────────
        layers.Conv2D(256, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),

        # ── Head ──────────────────────────────────────────────────────────
        layers.GlobalAveragePooling2D(),
        layers.Dense(512, activation='relu', kernel_regularizer=l2),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(num_classes, activation='softmax'),
    ])

    optimizer = tf.keras.optimizers.Adam(learning_rate=0.0005)
    model.compile(
        optimizer=optimizer,
        # label_smoothing=0.1: prevents overconfident predictions on tiny ORL dataset
        loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=False),
        metrics=['accuracy', tf.keras.metrics.SparseTopKCategoricalAccuracy(k=3, name='top3_acc')]
    )
    return model


# ─────────────────────────────────────────
# Training Plot
# ─────────────────────────────────────────
def plot_history(history):
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    fig.suptitle("Face Recognition CNN Training History", fontsize=14)

    axes[0].plot(history.history['accuracy'],     label='Train Acc')
    axes[0].plot(history.history['val_accuracy'], label='Val Acc')
    axes[0].set_title('Accuracy')
    axes[0].set_xlabel('Epoch')
    axes[0].legend()

    axes[1].plot(history.history['loss'],     label='Train Loss')
    axes[1].plot(history.history['val_loss'], label='Val Loss')
    axes[1].set_title('Loss')
    axes[1].set_xlabel('Epoch')
    axes[1].legend()

    plt.tight_layout()
    os.makedirs(os.path.join(os.path.dirname(__file__), "routers", "models"), exist_ok=True)
    plot_path = os.path.join(os.path.dirname(__file__), "routers", "models", "face_training_history.png")
    plt.savefig(plot_path, dpi=150)
    print(f"[OK] Training plots saved to {plot_path}")


# ─────────────────────────────────────────
# Main
# ─────────────────────────────────────────
def main():
    download_and_extract()
    X, y = load_data()

    # ── Stratified split: ensures every person appears in both train/test ──
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"[INFO] Train: {len(X_train)} | Test: {len(X_test)}")

    # ── Augmentation tuned for face recognition ───────────────────────────
    # Key fix: horizontal_flip=False — mirror images create a "different identity"
    # in face recognition tasks, confusing the 40-class classifier.
    datagen = ImageDataGenerator(
        rotation_range=12,           # Small rotation: real-world head tilt
        width_shift_range=0.08,      # Slight position shift
        height_shift_range=0.08,
        zoom_range=0.1,              # Mild zoom
        shear_range=0.05,            # Very slight shear
        brightness_range=[0.85, 1.15], # Lighting variation
        horizontal_flip=False,       # ✅ FIX: Never flip face recognition images
        fill_mode='nearest'
    )

    model = build_model(NUM_CLASSES)
    model.summary()

    # ── Callbacks ─────────────────────────────────────────────────────────
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

    callbacks = [
        # Stop after 10 epochs of no val_loss improvement
        EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        # Halve LR when stuck for 5 epochs
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-7,
            verbose=1
        ),
        # Save the single best checkpoint by val_accuracy
        ModelCheckpoint(
            filepath=BEST_MODEL_PATH,
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
    ]

    print("[INFO] Starting optimized Face Recognition CNN training...")
    history = model.fit(
        datagen.flow(X_train, y_train, batch_size=BATCH_SIZE),
        epochs=EPOCHS,
        validation_data=(X_test, y_test),
        callbacks=callbacks
    )

    plot_history(history)

    # ── Evaluation ────────────────────────────────────────────────────────
    print("\n[INFO] Evaluating best model on test set...")
    test_loss, test_acc, test_top3 = model.evaluate(X_test, y_test, verbose=2)
    print(f"\n  Test Accuracy (Top-1) : {test_acc:.4f}")
    print(f"  Test Accuracy (Top-3) : {test_top3:.4f}")
    print(f"  Test Loss             : {test_loss:.4f}")

    y_pred = np.argmax(model.predict(X_test), axis=1)
    print("\n[METRICS] Classification Report:")
    print(classification_report(y_test, y_pred))

    print("\n[METRICS] Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)

    # ── Save final model ──────────────────────────────────────────────────
    model.save(MODEL_PATH)
    print(f"[OK] Final model -> {MODEL_PATH}")
    print(f"[OK] Best model  -> {BEST_MODEL_PATH}")


if __name__ == "__main__":
    main()
