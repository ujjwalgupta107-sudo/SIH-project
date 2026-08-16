import uvicorn
from app.main import app
import threading
import time
import requests
import cv2
import numpy as np
from PIL import Image
import io
import tempfile
import os

def run_server():
    uvicorn.run(app, host='127.0.0.1', port=8000, log_level='error')

server_thread = threading.Thread(target=run_server, daemon=True)
server_thread.start()
time.sleep(3)  # Wait for server to start

# Test health endpoint
try:
    r = requests.get('http://127.0.0.1:8000/health', timeout=5)
    print(f'Health check: {r.status_code} - {r.json()}')
except Exception as e:
    print(f'Health check failed: {e}')

# Test login
try:
    r = requests.post('http://127.0.0.1:8000/api/v1/auth/login', 
                      json={'email': 'citizen@civicshield.ai', 'password': 'citizen123'}, timeout=5)
    print(f'Login: {r.status_code}')
    if r.status_code == 200:
        token = r.json()['token']
        print(f'Token received: {token[:20]}...')
        
        # Test photo prediction
        img = np.zeros((640, 640, 3), dtype=np.uint8)
        img[:, :] = [100, 150, 200]
        img = Image.fromarray(img)
        buf = io.BytesIO()
        img.save(buf, format='JPEG')
        buf.seek(0)
        
        r = requests.post('http://127.0.0.1:8000/api/v1/media/predict',
                          files={'file': ('test.jpg', buf, 'image/jpeg')},
                          headers={'Authorization': f'Bearer {token}'}, timeout=10)
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
            r = requests.post('http://127.0.0.1:8000/api/v1/media/predict-video',
                              files={'file': ('test.mp4', f, 'video/mp4')},
                              headers={'Authorization': f'Bearer {token}'}, timeout=15)
        print(f'Video prediction: {r.status_code}')
        if r.status_code == 200:
            print(f'  Detections: {r.json()}')
        
        # Test incident creation with GPS
        r = requests.post('http://127.0.0.1:8000/api/v1/incidents',
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
                          headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}, timeout=10)
        print(f'Incident creation: {r.status_code}')
        if r.status_code == 201:
            inc = r.json()
            print(f'  Incident ID: {inc["id"]}')
            print(f'  Authority: {inc["authority"]}')
            print(f'  Department: {inc["department"]}')
            print(f'  Severity: {inc["severity"]}')
            print(f'  Risk Level: {inc["risk_level"]}')
        
        # Test citizen history
        r = requests.get('http://127.0.0.1:8000/api/v1/incidents/mine',
                         headers={'Authorization': f'Bearer {token}'}, timeout=5)
        print(f'History: {r.status_code}')
        if r.status_code == 200:
            print(f'  Incidents: {len(r.json())}')
            
except Exception as e:
    print(f'Error: {e}')