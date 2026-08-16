from fastapi.testclient import TestClient
from app.main import app
import cv2
import numpy as np
from PIL import Image
import io
import tempfile

client = TestClient(app)

print("=== CivicShield AI Final Audit ===\n")

# Test health endpoint
r = client.get('/health')
print(f'Health check: {r.status_code} - {r.json()}')

# Test login - citizen
r = client.post('/api/v1/auth/login', json={'email': 'citizen@civicshield.ai', 'password': 'citizen123'})
print(f'Citizen Login: {r.status_code}')
if r.status_code == 200:
    token = r.json()['token']
    print(f'Token received: {token[:20]}...')
    
    # Test photo prediction
    import numpy as np
    from PIL import Image
    import io
    img = np.zeros((640, 640, 3), dtype=np.uint8)
    img[:, :] = [100, 150, 200]
    img = Image.fromarray(img)
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    buf.seek(0)
    
    r = client.post('/api/v1/media/predict',
                    files={'file': ('test.jpg', buf, 'image/jpeg')},
                    headers={'Authorization': f'Bearer {token}'})
    print(f'Photo prediction: {r.status_code}')
    if r.status_code == 200:
        print(f'  Detections: {r.json()}')
    
    # Test video prediction
    img_arr = np.zeros((640, 640, 3), dtype=np.uint8)
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp:
        video_path = tmp.name
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(video_path, cv2.VideoWriter_fourcc(*'mp4v'), 30.0, (640, 640))
    img_arr = np.zeros((640, 640, 3), dtype=np.uint8)
    for _ in range(5):
        out.write(img_arr)
    out.release()
    
    with open(video_path, 'rb') as f:
        r = client.post('/api/v1/media/predict-video',
                        files={'file': ('test.mp4', f, 'video/mp4')},
                        headers={'Authorization': f'Bearer {token}'})
    print(f'Video prediction: {r.status_code}')
    if r.status_code == 200:
        print(f'  Detections: {r.json()}')
    
    # Test incident creation with GPS
    r = client.post('/api/v1/incidents',
                    json={
                        'type': 'pothole',
                        'description': 'Test pothole from integration test',
                        'location': {
                            'latitude': 26.8467,
                            'longitude': 80.9462,
                            'address': 'Hazratganj, Lucknow',
                            'accuracy': 10.0
                        },
                        'ml_detections': [
                            {'class_id': 0, 'class_name': 'pothole', 'confidence': 0.85, 'bbox': {'x1': 100, 'y1': 100, 'x2': 300, 'y2': 300}}
                        ]
                    },
                    headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'})
    print(f'Incident creation: {r.status_code}')
    if r.status_code == 201:
        inc = r.json()
        print(f'  Incident ID: {inc["id"]}')
        print(f'  Authority: {inc["authority"]}')
        print(f'  Department: {inc["department"]}')
        print(f'  Severity: {inc["severity"]}')
        print(f'  Risk Level: {inc["risk_level"]}')
    
    # Test citizen history
    r = client.get('/api/v1/incidents/mine', headers={'Authorization': f'Bearer {token}'})
    print(f'History: {r.status_code}')
    if r.status_code == 200:
        print(f'  Incidents: {len(r.json())}')

    # Test authority login
    r = client.post('/api/v1/auth/login', json={'email': 'authority@civicshield.ai', 'password': 'authority123'})
    print(f'\nAuthority Login: {r.status_code}')
    if r.status_code == 200:
        auth_token = r.json()['token']
        print(f'Token received: {auth_token[:20]}...')
        
        # Test command center endpoints
        r = client.get('/api/v1/incidents', headers={'Authorization': f'Bearer {auth_token}'})
        print(f'Command Center - List Incidents: {r.status_code}')
        if r.status_code == 200:
            print(f'  Incidents: {len(r.json())}')
        
        r = client.get('/api/v1/incidents/nearby', params={'lat': 26.8467, 'lng': 80.9462, 'radius': 5000}, headers={'Authorization': f'Bearer {auth_token}'})
        print(f'Command Center - Nearby Incidents: {r.status_code}')
        if r.status_code == 200:
            print(f'  Incidents: {len(r.json())}')

    # Test role-based access - citizen cannot access authority routes
    r = client.get('/api/v1/incidents', headers={'Authorization': f'Bearer {token}'})
    print(f'Citizen accessing authority route: {r.status_code} (should be 403)')

print("\n=== All Automated Tests Completed ===")