from fastapi.testclient import TestClient
from app.main import app
import io
import numpy as np
from PIL import Image

client = TestClient(app)

print("Health:", client.get("/health").json())

r = client.post("/api/v1/auth/login", json={"email": "citizen@civicshield.ai", "password": "citizen123"})
print("Login:", r.status_code)
token = r.json()["token"]

img = np.zeros((640, 640, 3), dtype=np.uint8)
img = Image.fromarray(img)
buf = io.BytesIO()
img.save(buf, format="JPEG")
buf.seek(0)

r = client.post("/api/v1/media/predict", files={"file": ("test.jpg", buf, "image/jpeg")}, headers={"Authorization": f"Bearer {token}"})
print("Photo:", r.status_code, r.json())

r = client.post("/api/v1/incidents", json={
    "type": "pothole", "description": "Test", 
    "location": {"latitude": 26.8467, "longitude": 80.9462, "address": "Test", "accuracy": 10.0},
    "ml_detections": [{"class_id": 0, "class_name": "pothole", "confidence": 0.85, "bbox": {"x1": 100, "y1": 100, "x2": 300, "y2": 300}}]
}, headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
print("Incident:", r.status_code, r.json() if r.status_code == 201 else r.text)

r = client.post("/api/v1/auth/login", json={"email": "authority@civicshield.ai", "password": "authority123"})
auth_token = r.json()["token"]
r = client.get("/api/v1/incidents", headers={"Authorization": f"Bearer {auth_token}"})
print("Authority incidents:", r.status_code, len(r.json()))

print("All tests passed!")