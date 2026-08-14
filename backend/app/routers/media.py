from fastapi import APIRouter, Depends, status
from ..schemas import UploadURLRequest, UploadURLResponse
from ..services.auth import require_roles
from ..services.storage import MediaStorageService

router = APIRouter(prefix="/media", tags=["media"])
storage = MediaStorageService()

@router.post("/upload-url", response_model=UploadURLResponse)
def get_upload_url(
    req: UploadURLRequest,
    _user = Depends(require_roles("CITIZEN", "OFFICER", "OPERATOR", "ADMIN"))
):
    storage_key, upload_url, expires_in = storage.generate_upload_url(req.mime_type, req.size_bytes)
    return {"storage_key": storage_key, "upload_url": upload_url, "expires_in": expires_in}
