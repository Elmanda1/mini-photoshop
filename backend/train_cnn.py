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
DATASET_URL = "http://www.cl.cam.ac.uk/Research/DTG/attarchive/pub/data/att_faces.zip"
DATASET_DIR = os.path.join(os.path.dirname(__file__), "dataset_orl")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "routers", "models", "custom_face_cnn.h5")
IMG_SIZE = (92, 112) # Original size of ORL images

def download_and_extract():
    if not os.path.exists(DATASET_DIR):
        print(f"[INFO] Downloading dataset from {DATASET_URL}...")
        zip_path = "orl_faces.zip"
        urllib.request.urlretrieve(DATASET_URL, zip_path)
        
        print("[INFO] Extracting dataset...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(DATASET_DIR)
        os.remove(zip_path)
    else:
        print("[INFO] Dataset already exists.")

def load_data():
    X = []
    y = []
    
    # ORL dataset is structured as s1, s2, ..., s40
    for i in range(1, 41):
        person_dir = os.path.join(DATASET_DIR, f"s{i}")
        if not os.path.isdir(person_dir):
            continue
            
        for filename in os.listdir(person_dir):
            if filename.endswith(".pgm"):
                img_path = os.path.join(person_dir, filename)
                # Read as grayscale
                img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
                if img is not None:
                    # Normalize to 0-1
                    img = img.astype('float32') / 255.0
                    X.append(img)
                    y.append(i - 1) # 0-indexed labels
    
    X = np.array(X)
    y = np.array(y)
    
    # Add channel dimension (grayscale has 1 channel)
    X = X.reshape(X.shape[0], IMG_SIZE[1], IMG_SIZE[0], 1)
    
    return X, y

def build_model(num_classes):
    model = models.Sequential([
        layers.Input(shape=(IMG_SIZE[1], IMG_SIZE[0], 1)),
        layers.Conv2D(32, (3, 3), activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        
        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        
        layers.Flatten(),
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.4),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    # Tuning: Lower learning rate for more stable convergence
    optimizer = tf.keras.optimizers.Adam(learning_rate=0.0005)
    model.compile(optimizer=optimizer,
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])
    return model

def plot_history(history):
    plt.figure(figsize=(12, 4))
    
    # Plot Accuracy
    plt.subplot(1, 2, 1)
    plt.plot(history.history['accuracy'], label='Train Accuracy')
    plt.plot(history.history['val_accuracy'], label='Val Accuracy')
    plt.title('Model Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()
    
    # Plot Loss
    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'], label='Train Loss')
    plt.plot(history.history['val_loss'], label='Val Loss')
    plt.title('Model Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    
    os.makedirs(os.path.join(os.path.dirname(__file__), "routers", "models"), exist_ok=True)
    plot_path = os.path.join(os.path.dirname(__file__), "routers", "models", "training_history.png")
    plt.savefig(plot_path)
    print(f"[OK] Training plots saved to {plot_path}")

def main():
    download_and_extract()
    X, y = load_data()
    
    print(f"[INFO] Loaded {len(X)} images from 40 classes.")
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Data Augmentation to "fork" more images
    datagen = ImageDataGenerator(
        rotation_range=15,
        width_shift_range=0.1,
        height_shift_range=0.1,
        shear_range=0.1,
        zoom_range=0.1,
        horizontal_flip=True,
        fill_mode='nearest'
    )
    
    model = build_model(40)
    model.summary()
    
    print("[INFO] Starting training with Data Augmentation...")
    history = model.fit(datagen.flow(X_train, y_train, batch_size=16), 
                        epochs=50, 
                        validation_data=(X_test, y_test))
    
    plot_history(history)
    
    print("[INFO] Evaluating model...")
    test_loss, test_acc = model.evaluate(X_test, y_test, verbose=2)
    print(f"\nTest accuracy: {test_acc:.4f}")
    
    y_pred = np.argmax(model.predict(X_test), axis=1)
    
    print("\n[METRICS] Classification Report:")
    print(classification_report(y_test, y_pred))
    
    print("\n[METRICS] Confusion Matrix (Raw):")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)
    
    print("\n[INFO] Saving model...")
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    model.save(MODEL_PATH)
    print(f"[OK] Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    main()
