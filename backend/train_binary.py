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
from sklearn.datasets import fetch_lfw_people
import matplotlib.pyplot as plt

# ─────────────────────────────────────────
# Constants
# ─────────────────────────────────────────
DATASET_DIR = os.path.join(os.path.dirname(__file__), "dataset_binary")
MODEL_PATH   = os.path.join(os.path.dirname(__file__), "routers", "models", "human_classifier_binary.h5")
BEST_MODEL_PATH = os.path.join(os.path.dirname(__file__), "routers", "models", "human_classifier_binary_best.h5")
IMG_SIZE     = (92, 112)   # (Width, Height)
BATCH_SIZE   = 32
EPOCHS       = 60          # EarlyStopping will cut this short if needed


# ─────────────────────────────────────────
# Dataset Download & Preparation
# ─────────────────────────────────────────
def download_datasets():
    os.makedirs(DATASET_DIR, exist_ok=True)
    human_dir     = os.path.join(DATASET_DIR, "human")
    not_human_dir = os.path.join(DATASET_DIR, "not_human")
    os.makedirs(human_dir,     exist_ok=True)
    os.makedirs(not_human_dir, exist_ok=True)

    # ── 1. Human: LFW Faces ──────────────────────────────────────────────────
    if not any(f for f in os.listdir(human_dir) if f.startswith("lfw_")):
        print("[INFO] Fetching LFW Human dataset...")
        lfw_people = fetch_lfw_people(min_faces_per_person=20, resize=1.0)
        n_samples  = min(len(lfw_people.images), 1200)
        for i in range(n_samples):
            img         = (lfw_people.images[i] * 255).astype(np.uint8)
            img_resized = cv2.resize(img, IMG_SIZE)
            cv2.imwrite(os.path.join(human_dir, f"lfw_{i}.jpg"), img_resized)
        print(f"[OK] Saved {n_samples} LFW faces.")
    else:
        print("[INFO] LFW data already exists.")

    # ── 2. Not Human: CIFAR-10 (clean non-human objects) ────────────────────
    # CIFAR-10 classes: airplane(0), automobile(1), bird(2), cat(3), deer(4),
    #                   dog(5), frog(6), horse(7), ship(8), truck(9)
    # We exclude cat(3) & dog(5) to avoid close-up animal-face ambiguity.
    EXCLUDED_CLASSES = {3, 5}  # cat, dog — too "face-like"
    cifar_marker = os.path.join(not_human_dir, "cifar_done.flag")
    if not os.path.exists(cifar_marker):
        print("[INFO] Loading CIFAR-10 as 'Not Human' dataset...")
        (x_train_c, y_train_c), (x_test_c, y_test_c) = tf.keras.datasets.cifar10.load_data()
        all_x = np.concatenate([x_train_c, x_test_c], axis=0)
        all_y = np.concatenate([y_train_c, y_test_c], axis=0).flatten()

        count = 0
        for i, (img_rgb, label) in enumerate(zip(all_x, all_y)):
            if label in EXCLUDED_CLASSES:
                continue
            gray        = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
            img_resized = cv2.resize(gray, IMG_SIZE)
            cv2.imwrite(os.path.join(not_human_dir, f"cifar_{count}.jpg"), img_resized)
            count += 1
            if count >= 1500:
                break

        # Flag so we don't re-download
        open(cifar_marker, 'w').close()
        print(f"[OK] Saved {count} CIFAR-10 images as Not Human.")
    else:
        print("[INFO] CIFAR-10 data already exists.")

    # ── 3. Not Human: Synthetic Digital/UI Noise ─────────────────────────────
    if not any(f for f in os.listdir(not_human_dir) if f.startswith("digital_")):
        print("[INFO] Creating Synthetic Digital/UI Noise for 'Not Human' set...")
        for i in range(800):
            canvas = np.zeros((IMG_SIZE[1], IMG_SIZE[0]), dtype=np.uint8)
            for _ in range(np.random.randint(5, 20)):
                color      = int(np.random.randint(30, 255))
                pt1        = (int(np.random.randint(0, IMG_SIZE[0])), int(np.random.randint(0, IMG_SIZE[1])))
                pt2        = (int(np.random.randint(0, IMG_SIZE[0])), int(np.random.randint(0, IMG_SIZE[1])))
                shape_type = np.random.randint(0, 4)
                if   shape_type == 0:
                    cv2.rectangle(canvas, pt1, pt2, color, -1)
                elif shape_type == 1:
                    cv2.circle(canvas, pt1, int(np.random.randint(2, 40)), color, -1)
                elif shape_type == 2:
                    cv2.line(canvas, pt1, pt2, color, int(np.random.randint(1, 10)))
                else:
                    cv2.putText(canvas, "X", pt1, cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
            noise  = np.clip(np.random.normal(0, 20, canvas.shape), 0, 255).astype(np.uint8)
            canvas = cv2.add(canvas, noise)
            cv2.imwrite(os.path.join(not_human_dir, f"digital_{i}.jpg"), canvas)
        print("[OK] Created 800 digital noise images.")
    else:
        print("[INFO] Digital noise data already exists.")

    # ── 4. Human: Contextual (Face on random background) ─────────────────────
    if not any(f for f in os.listdir(human_dir) if f.startswith("context_")):
        print("[INFO] Creating Contextual Human data (Face in Background)...")
        lfw_files = [f for f in os.listdir(human_dir) if f.startswith("lfw_")]
        obj_files = [f for f in os.listdir(not_human_dir) if f.endswith(".jpg")]
        count = 0
        for i in range(min(500, len(lfw_files))):
            face = cv2.imread(os.path.join(human_dir,     lfw_files[i]),              cv2.IMREAD_GRAYSCALE)
            bg   = cv2.imread(os.path.join(not_human_dir, obj_files[i % len(obj_files)]), cv2.IMREAD_GRAYSCALE)
            if face is None or bg is None:
                continue
            scale     = np.random.uniform(0.3, 0.7)
            fw, fh    = int(IMG_SIZE[0] * scale), int(IMG_SIZE[1] * scale)
            face_small = cv2.resize(face, (fw, fh))
            y_off     = np.random.randint(0, max(1, IMG_SIZE[1] - fh))
            x_off     = np.random.randint(0, max(1, IMG_SIZE[0] - fw))
            combined  = bg.copy()
            combined[y_off:y_off+fh, x_off:x_off+fw] = face_small
            cv2.imwrite(os.path.join(human_dir, f"context_{i}.jpg"), combined)
            count += 1
        print(f"[OK] Created {count} contextual human images.")
    else:
        print("[INFO] Contextual human data already exists.")


# ─────────────────────────────────────────
# Data Loader
# ─────────────────────────────────────────
def load_binary_data():
    X, y = [], []
    classes = {"not_human": 0, "human": 1}

    for class_name, label in classes.items():
        class_dir = os.path.join(DATASET_DIR, class_name)
        files     = [f for f in os.listdir(class_dir) if f.endswith((".jpg", ".pgm", ".png"))]
        print(f"[INFO] Loading {len(files)} images for class '{class_name}'...")
        for filename in files:
            img = cv2.imread(os.path.join(class_dir, filename), cv2.IMREAD_GRAYSCALE)
            if img is not None:
                img = cv2.resize(img, IMG_SIZE)
                img = img.astype('float32') / 255.0
                X.append(img)
                y.append(label)

    X = np.array(X).reshape(-1, IMG_SIZE[1], IMG_SIZE[0], 1)
    y = np.array(y)
    print(f"[INFO] Total: {len(X)} images | Human: {np.sum(y==1)} | Not Human: {np.sum(y==0)}")
    return X, y


# ─────────────────────────────────────────
# Model Architecture (Upgraded: 3 Conv Blocks)
# ─────────────────────────────────────────
def build_binary_model():
    """
    Upgraded CNN:
    - 3 Conv blocks (32 → 64 → 128) for richer feature hierarchy
    - BatchNormalization after every Conv for training stability
    - GlobalAveragePooling2D instead of Flatten → fewer params, less overfitting
    - Dual Dense head with intermediate Dropout
    - Tuned Adam with explicit learning rate
    """
    model = models.Sequential([
        layers.Input(shape=(IMG_SIZE[1], IMG_SIZE[0], 1)),

        # ── Block 1: Low-level features (edges, corners) ──────────────────
        layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),

        # ── Block 2: Mid-level features (shapes, textures) ────────────────
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),

        # ── Block 3: High-level semantic features ─────────────────────────
        layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),

        # ── Head: Flatten -> Dense
        layers.Flatten(),
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(1, activation='sigmoid'),
    ])

    optimizer = tf.keras.optimizers.Adam(learning_rate=0.0005)
    model.compile(
        optimizer=optimizer,
        loss='binary_crossentropy',
        metrics=['accuracy', tf.keras.metrics.AUC(name='auc')]
    )
    return model


# ─────────────────────────────────────────
# Training Plot
# ─────────────────────────────────────────
def plot_history(history, plot_path):
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
    fig.suptitle("Binary CNN Training History", fontsize=14)

    for ax, (train_key, val_key, title) in zip(axes, [
        ('accuracy', 'val_accuracy', 'Accuracy'),
        ('loss',     'val_loss',     'Loss'),
        ('auc',      'val_auc',      'AUC'),
    ]):
        ax.plot(history.history[train_key], label=f'Train {title}')
        ax.plot(history.history[val_key],   label=f'Val {title}')
        ax.set_title(title)
        ax.set_xlabel('Epoch')
        ax.legend()

    plt.tight_layout()
    plt.savefig(plot_path, dpi=150)
    print(f"[OK] Training plots saved to {plot_path}")


# ─────────────────────────────────────────
# Main
# ─────────────────────────────────────────
def main():
    download_datasets()
    X, y = load_binary_data()

    # ── FIX: stratify=y ensures balanced class distribution in split ──────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"[INFO] Train: {len(X_train)} | Test: {len(X_test)}")

    # ── Augmentation: NO horizontal_flip for face tasks ───────────────────
    # Faces are not horizontally symmetric in terms of identity features.
    # We keep conservative augmentations to avoid confusing the model.
    datagen = ImageDataGenerator(
        rotation_range=10,
        width_shift_range=0.08,
        height_shift_range=0.08,
        zoom_range=0.1,
        brightness_range=[0.85, 1.15],
        horizontal_flip=False,   # ✅ FIX: was True — flip creates unrealistic faces
        fill_mode='nearest'
    )

    model = build_binary_model()
    model.summary()

    # ── Callbacks ─────────────────────────────────────────────────────────
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

    callbacks = [
        # Stop training when val_loss stops improving for 8 epochs
        EarlyStopping(
            monitor='val_loss',
            patience=8,
            restore_best_weights=True,
            verbose=1
        ),
        # Halve LR when val_loss plateaus for 4 epochs
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=4,
            min_lr=1e-6,
            verbose=1
        ),
        # Always save the best model (not the last)
        ModelCheckpoint(
            filepath=BEST_MODEL_PATH,
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
    ]

    print("[INFO] Starting optimized Binary CNN training...")
    history = model.fit(
        datagen.flow(X_train, y_train, batch_size=BATCH_SIZE),
        epochs=EPOCHS,
        validation_data=(X_test, y_test),
        callbacks=callbacks
    )

    # ── Plot ──────────────────────────────────────────────────────────────
    plot_path = os.path.join(os.path.dirname(__file__), "routers", "models", "binary_training_history.png")
    plot_history(history, plot_path)

    # ── Evaluation ────────────────────────────────────────────────────────
    print("\n[INFO] Evaluating best model on test set...")
    test_loss, test_acc, test_auc = model.evaluate(X_test, y_test, verbose=2)
    print(f"\n  Test Accuracy : {test_acc:.4f}")
    print(f"  Test AUC      : {test_auc:.4f}")
    print(f"  Test Loss     : {test_loss:.4f}")

    y_pred = (model.predict(X_test) > 0.5).astype(int)
    print("\n[METRICS] Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Not Human", "Human"]))

    print("\n[METRICS] Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # ── Save final model ──────────────────────────────────────────────────
    model.save(MODEL_PATH)
    print(f"[OK] Final model  -> {MODEL_PATH}")
    print(f"[OK] Best model   -> {BEST_MODEL_PATH}")


if __name__ == "__main__":
    main()
