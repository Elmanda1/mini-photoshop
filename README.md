# Mini Photoshop

A full-stack digital image processing web application built with Python (FastAPI/OpenCV) and Next.js (Tailwind CSS).

## Features & Modules
This application includes 11 comprehensive digital image processing modules:
1. **Image Management**: Load, save, and export images in multiple formats.
2. **Enhancement**: Adjust brightness, contrast, apply histogram equalization, sharpen, and blur.
3. **Geometric Transform**: Rotate, flip, crop, resize, and translate images.
4. **Noise Reduction**: Gaussian blur, median filter, and salt & pepper noise reduction.
5. **Edge Detection**: Canny, Sobel, Prewitt, Robert, Laplacian, LoG, and morphology.
6. **Color Processing**: Grayscale conversion, channel splitting, hue/saturation adjustments.
7. **Segmentation**: Threshold-based, edge-based, and K-means region segmentation.
8. **Compression**: JPEG quality simulation with real-time file size comparison.
9. **Histogram Analysis**: Real-time histogram visualization with before/after tracking.
10. **User Interface**: Professional dark UI with sliders, before/after panels, and responsive controls.
11. **AI Object Recognition (Completed)**: CNN-based object classification using MobileNetV2. Provides top-5 predictions with confidence scores.

## Architecture
- **Backend:** Python, FastAPI, OpenCV, NumPy, Pillow, TensorFlow (for ML Module)
- **Frontend:** Next.js (React), Tailwind CSS
- **Communication:** Stateless REST API passing Base64 encoded images.

## Requirements
- Node.js & npm (for frontend)
- Python 3.9+ (for backend)
- TensorFlow (`tensorflow>=2.14.0`) is required to run the AI Object Recognition module.

## Setup & Running

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Activate venv:
# Windows: venv\Scripts\activate
# Unix/macOS: source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
