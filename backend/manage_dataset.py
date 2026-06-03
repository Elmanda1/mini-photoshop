import os
import cv2
import shutil

DATASET_DIR = "dataset_binary"
IMG_SIZE = (92, 112) # Width, Height

def add_image_to_dataset(image_path, label):
    """
    Automated script to add a new image to the binary dataset.
    label: 'human' or 'not_human'
    """
    if label not in ["human", "not_human"]:
        print(f"[ERROR] Invalid label: {label}. Must be 'human' or 'not_human'.")
        return

    if not os.path.exists(image_path):
        print(f"[ERROR] Image not found: {image_path}")
        return

    target_folder = os.path.join(os.path.dirname(__file__), DATASET_DIR, label)
    os.makedirs(target_folder, exist_ok=True)

    # Generate new filename (find next index)
    existing_files = [f for f in os.listdir(target_folder) if f.endswith(".jpg") or f.endswith(".pgm")]
    next_index = len(existing_files)
    prefix = "human" if label == "human" else "object"
    new_filename = f"{prefix}_{next_index}.jpg"
    dest_path = os.path.join(target_folder, new_filename)

    try:
        # Load, convert to grayscale, and resize
        img = cv2.imread(image_path)
        if img is None:
            print(f"[ERROR] Could not read image: {image_path}")
            return
            
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        resized = cv2.resize(gray, IMG_SIZE)
        
        # Save as JPG
        cv2.imwrite(dest_path, resized)
        print(f"[OK] Added image to {label} as {new_filename}")
        print(f"[INFO] Path: {dest_path}")
    except Exception as e:
        print(f"[ERROR] Failed to process image: {e}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python manage_dataset.py <image_path> <label>")
        print("Example: python manage_dataset.py my_face.jpg human")
    else:
        add_image_to_dataset(sys.argv[1], sys.argv[2])
