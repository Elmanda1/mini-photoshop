import os
import zipfile
import urllib.request
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report
import matplotlib.pyplot as plt

# Constants
DATASET_DIR = os.path.join(os.path.dirname(__file__), "dataset_binary")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "routers", "models", "human_classifier_binary.h5")
IMG_SIZE = (92, 112) # Width, Height

from sklearn.datasets import fetch_lfw_people

def download_datasets():
    os.makedirs(DATASET_DIR, exist_ok=True)
    human_dir = os.path.join(DATASET_DIR, "human")
    not_human_dir = os.path.join(DATASET_DIR, "not_human")
    os.makedirs(human_dir, exist_ok=True)
    os.makedirs(not_human_dir, exist_ok=True)

    # 1. Download Humans (LFW faces)
    if not any(f for f in os.listdir(human_dir) if "lfw" in f):
        print("[INFO] Fetching LFW Human dataset...")
        lfw_people = fetch_lfw_people(min_faces_per_person=20, resize=1.0)
        n_samples = min(len(lfw_people.images), 1000)
        for i in range(n_samples):
            img = (lfw_people.images[i] * 255).astype(np.uint8)
            img_resized = cv2.resize(img, IMG_SIZE)
            cv2.imwrite(os.path.join(human_dir, f"lfw_{i}.jpg"), img_resized)
        print(f"[OK] Saved {n_samples} LFW faces.")

    # 2. Download Not Human (Small sample of natural images)
    if not any(f for f in os.listdir(not_human_dir) if "object" in f):
        print("[INFO] Downloading Not Human dataset (Picsum - small sample)...")
        n_picsum = 200
        for i in range(n_picsum):
            try:
                url = f"https://picsum.photos/92/112?random={i}"
                urllib.request.urlretrieve(url, os.path.join(not_human_dir, f"object_{i}.jpg"))
            except:
                break
        print(f"[OK] Saved Picsum images.")

    # 4. Add Synthetic 'Digital/UI' Noise to Not Human (Mitigate False Positives)
    if not any(f for f in os.listdir(not_human_dir) if "digital" in f):
        print("[INFO] Creating Synthetic Digital/UI Noise for 'Not Human' set...")
        for i in range(800):
            canvas = np.zeros((IMG_SIZE[1], IMG_SIZE[0]), dtype=np.uint8)
            # Draw random geometric shapes (UI-like)
            for _ in range(np.random.randint(5, 20)):
                color = np.random.randint(30, 255)
                pt1 = (np.random.randint(0, IMG_SIZE[0]), np.random.randint(0, IMG_SIZE[1]))
                pt2 = (np.random.randint(0, IMG_SIZE[0]), np.random.randint(0, IMG_SIZE[1]))
                shape_type = np.random.randint(0, 4)
                if shape_type == 0: # Rectangle
                    cv2.rectangle(canvas, pt1, pt2, color, -1)
                elif shape_type == 1: # Circle
                    radius = np.random.randint(2, 40)
                    cv2.circle(canvas, pt1, radius, color, -1)
                elif shape_type == 2: # Line
                    cv2.line(canvas, pt1, pt2, color, np.random.randint(1, 10))
                else: # Text-like noise
                    cv2.putText(canvas, "X", pt1, cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
            
            # Add complex noise patterns
            noise = np.random.normal(0, 20, canvas.shape).astype(np.uint8)
            canvas = cv2.add(canvas, noise)
            cv2.imwrite(os.path.join(not_human_dir, f"digital_noise_{i}.jpg"), canvas)
        print(f"[OK] Created 800 digital noise images.")

    # 3. Create 'Contextual Human' data (Face in random background)
    if not any(f for f in os.listdir(human_dir) if "context" in f):
        print("[INFO] Creating Contextual Human data (Face in Background)...")
        lfw_files = [f for f in os.listdir(human_dir) if "lfw" in f]
        obj_files = [f for f in os.listdir(not_human_dir)]
        for i in range(min(500, len(lfw_files))):
            face = cv2.imread(os.path.join(human_dir, lfw_files[i]), cv2.IMREAD_GRAYSCALE)
            bg = cv2.imread(os.path.join(not_human_dir, obj_files[i % len(obj_files)]), cv2.IMREAD_GRAYSCALE)
            if face is not None and bg is not None:
                # Resize face to be smaller (30-70% of image)
                scale = np.random.uniform(0.3, 0.7)
                fw, fh = int(IMG_SIZE[0]*scale), int(IMG_SIZE[1]*scale)
                face_small = cv2.resize(face, (fw, fh))
                # Paste face onto background at random position
                y_off = np.random.randint(0, IMG_SIZE[1] - fh)
                x_off = np.random.randint(0, IMG_SIZE[0] - fw)
                combined = bg.copy()
                combined[y_off:y_off+fh, x_off:x_off+fw] = face_small
                cv2.imwrite(os.path.join(human_dir, f"context_human_{i}.jpg"), combined)
        print(f"[OK] Created 500 contextual human images.")

import shutil

def load_binary_data():
    X = []
    y = []
    
    # Classes: 0 = Not Human, 1 = Human
    classes = {"not_human": 0, "human": 1}
    
    for class_name, label in classes.items():
        class_dir = os.path.join(DATASET_DIR, class_name)
        for filename in os.listdir(class_dir):
            img_path = os.path.join(class_dir, filename)
            img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
            if img is not None:
                img = cv2.resize(img, IMG_SIZE)
                img = img.astype('float32') / 255.0
                X.append(img)
                y.append(label)
    
    X = np.array(X)
    y = np.array(y)
    X = X.reshape(X.shape[0], IMG_SIZE[1], IMG_SIZE[0], 1)
    return X, y

def build_binary_model():
    model = models.Sequential([
        layers.Input(shape=(IMG_SIZE[1], IMG_SIZE[0], 1)),
        layers.Conv2D(32, (3, 3), activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        
        layers.Flatten(),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(1, activation='sigmoid') # Binary output
    ])
    
    model.compile(optimizer='adam',
                  loss='binary_crossentropy',
                  metrics=['accuracy'])
    return model

def main():
    download_datasets()
    X, y = load_binary_data()
    print(f"[INFO] Dataset loaded. Total images: {len(X)}")
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    datagen = ImageDataGenerator(rotation_range=10, zoom_range=0.1, horizontal_flip=True)
    
    model = build_binary_model()
    print("[INFO] Training Human vs Not Human Classifier...")
    model.fit(datagen.flow(X_train, y_train, batch_size=16), 
              epochs=20, 
              validation_data=(X_test, y_test))
    
    print("\n[INFO] Saving binary model...")
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    model.save(MODEL_PATH)
    print(f"[OK] Model saved to {MODEL_PATH}")

    # Evaluation
    y_pred = (model.predict(X_test) > 0.5).astype(int)
    print("\n[METRICS] Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Not Human", "Human"]))

if __name__ == "__main__":
    main()
