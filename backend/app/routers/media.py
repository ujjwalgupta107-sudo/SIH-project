from fastapi import APIRouter, Depends, status, UploadFile, File
from fastapi.responses import JSONResponse
from ..schemas import UploadURLRequest, UploadURLResponse, PredictResponse
from ..services.auth import require_roles
from ..services.storage import MediaStorageService
from ..services.ml import ml_service
import uuid, os, shutil

router = APIRouter(prefix="/media", tags=["media"])
storage = MediaStorageService()

ALL_AUTH = ('CITIZEN', 'AUTHORITY', 'OFFICER', 'OPERATOR', 'ADMIN')

@router.post("/upload-url", response_model=UploadURLResponse)
def get_upload_url(
    req: UploadURLRequest,
    _user=Depends(require_roles(*ALL_AUTH))
):
    storage_key, upload_url, expires_in = storage.generate_upload_url(req.mime_type, req.size_bytes)
    return {"storage_key": storage_key, "upload_url": upload_url, "expires_in": expires_in}


@router.post('/upload-image')
def upload_image(
    file: UploadFile = File(...),
    _user=Depends(require_roles(*ALL_AUTH))
):
    """Upload an image file and return a storage key for use in incident creation."""
    ext = os.path.splitext(file.filename or 'upload')[1] or '.jpg'
    storage_key = f"uploads/{uuid.uuid4().hex}{ext}"
    os.makedirs('uploads', exist_ok=True)
    with open(storage_key, 'wb') as f:
        shutil.copyfileobj(file.file, f)
    return JSONResponse({'storage_key': storage_key})


@router.post('/predict', response_model=PredictResponse)
def predict_image(
    file: UploadFile = File(...),
    _user=Depends(require_roles(*ALL_AUTH))
):
    image_bytes = file.file.read()
    return ml_service.predict(image_bytes)


@router.post('/predict-video', response_model=PredictResponse)
def predict_video_endpoint(
    file: UploadFile = File(...),
    _user=Depends(require_roles(*ALL_AUTH))
):
    import tempfile
    import os
    
    # Save the uploaded video to a temporary file for OpenCV to read
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
        temp_video.write(file.file.read())
        temp_video_path = temp_video.name
        
    try:
        results = ml_service.predict_video(temp_video_path, max_frames=10)
    finally:
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)
            
    return results

