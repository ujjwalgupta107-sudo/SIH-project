from fastapi.testclient import TestClient
from app.main import app
import io
from PIL import Image

client = TestClient(app)

def create_test_image():
    # Create a 100x100 dummy image
    image = Image.new('RGB', (100, 100), color = 'red')
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='JPEG')
    return img_byte_arr.getvalue()

def test_predict_endpoint_unauthorized():
    # Attempting to call without auth should fail with 401/403
    img_bytes = create_test_image()
    response = client.post(
        "/api/v1/media/predict",
        files={"file": ("test.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 401

def test_predict_endpoint_with_mock_auth(monkeypatch):
    # Mock the auth dependency
    from app.services.auth import current_user
    from app.schemas import TokenPayload
    
    # We bypass auth by patching FastAPI dependency overrides for current_user
    app.dependency_overrides[current_user] = lambda: TokenPayload(sub="test", role="CITIZEN")
    
    img_bytes = create_test_image()
    
    response = client.post(
        "/api/v1/media/predict",
        files={"file": ("test.jpg", img_bytes, "image/jpeg")},
        headers={"Authorization": "Bearer MOCK"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "detections" in data
    
    # In smoke test mode (or real), it should return detections
    # The smoke test currently hardcodes 1 detection
    detections = data["detections"]
    if len(detections) > 0:
        det = detections[0]
        assert "class_id" in det
        assert "class_name" in det
        assert "confidence" in det
        assert "bbox" in det
        assert "x1" in det["bbox"]
        
    app.dependency_overrides = {}
