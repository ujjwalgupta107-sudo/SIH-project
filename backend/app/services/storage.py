import uuid
from pathlib import Path
from ..config import settings

class MediaStorageService:
    def __init__(self):
        self.upload_dir = Path("uploads")
        self.upload_dir.mkdir(exist_ok=True)

    def generate_upload_url(self, mime_type: str, size_bytes: int) -> tuple[str, str, int]:
        """
        Returns (storage_key, upload_url, expires_in)
        """
        ext = mime_type.split("/")[-1]
        storage_key = f"{uuid.uuid4()}.{ext}"
        
        # Local emulator simply generates a fake URL for now.
        # The client will mock the upload by just POSTing to this URL, or just skipping it.
        # Since it's local, we can just use the backend base URL.
        upload_url = f"http://localhost:8000/uploads/{storage_key}"
        return storage_key, upload_url, 3600
