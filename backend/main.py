"""
Mini Photoshop — FastAPI Backend Entry Point
Serves all image processing endpoints for the frontend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import image, enhance, transform, filter, edge, color, segment, compress, ml
from services.histogram_service import calculate_histogram
from utils import decode_image, ensure_3channel
from pydantic import BaseModel

app = FastAPI(
    title="Mini Photoshop API",
    description="Backend API for Mini Photoshop — Digital Image Processing",
    version="1.0.0",
)

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(image.router)
app.include_router(enhance.router)
app.include_router(transform.router)
app.include_router(filter.router)
app.include_router(edge.router)
app.include_router(color.router)
app.include_router(segment.router)
app.include_router(compress.router)
app.include_router(ml.router)


# Histogram endpoint (standalone)
class HistogramRequest(BaseModel):
    image: str  # Base64


@app.post("/api/histogram")
async def histogram_endpoint(req: HistogramRequest):
    """Calculate histogram data for the image."""
    img = decode_image(req.image)
    bgr, _ = ensure_3channel(img)
    histogram_data = calculate_histogram(bgr)
    return histogram_data


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "name": "Mini Photoshop API",
        "version": "1.0.0",
        "modules": [
            "Image Management",
            "Enhancement",
            "Geometric Transform",
            "Noise Reduction",
            "Edge Detection",
            "Color Processing",
            "Segmentation",
            "Compression",
            "Histogram Analysis",
            "CNN Object Recognition"
        ]
    }


@app.on_event("startup")
async def startup_event():
    """Load ML model at startup (if TensorFlow available)."""
    try:
        ml.load_model()
    except Exception as e:
        print(f"[WARN] ML model loading skipped: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
