import os
import io
import tempfile
import cv2
from PIL import Image
try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None

from ..schemas import PredictResponse, Detection, BBox

CLASS_NAMES = {
    0: 'pothole',
    1: 'waterlogging'
}

class YoloInferenceService:
    def __init__(self, model_path: str = None):
        self.model = None
        self.class_names = CLASS_NAMES
        
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        
        candidate_paths = [
            os.path.join(base_dir, '..', 'civicshield_models', 'final_2class_model', 'weights', 'best.pt'),
            os.path.join(base_dir, '..', 'ml', 'civicshield_models', 'final_2class_model', 'weights', 'best.pt'),
            os.path.join(base_dir, '..', 'ml', 'runs', 'detect', 'civicshield_models', 'final_2class_model', 'weights', 'best.pt'),
            os.path.join(base_dir, '..', 'civicshield_models', 'interim_2class_model', 'weights', 'best.pt'),
            os.path.join(base_dir, '..', 'ml', 'civicshield_models', 'interim_2class_model', 'weights', 'best.pt'),
            os.path.join(base_dir, '..', 'ml', 'runs', 'detect', 'civicshield_models', 'interim_2class_model', 'weights', 'best.pt'),
        ]
        
        if model_path:
            if os.path.isabs(model_path):
                candidate_paths.insert(0, model_path)
            else:
                candidate_paths.insert(0, os.path.join(base_dir, model_path))
                
        resolved_path = None
        for path in candidate_paths:
            if os.path.exists(path):
                resolved_path = path
                break
                
        if YOLO and resolved_path:
            try:
                print(f"Loading YOLO model from {resolved_path}")
                self.model = YOLO(resolved_path)
                if hasattr(self.model, 'names') and self.model.names:
                    self.class_names = self.model.names
                    print(f"Loaded dynamic class names from model: {self.class_names}")
            except Exception as e:
                print(f"Failed to load YOLO model from {resolved_path}: e")

    def predict(self, image_bytes: bytes) -> PredictResponse:
        detections = []
        
        if self.model:
            # Run real YOLO inference
            image = Image.open(io.BytesIO(image_bytes))
            results = self.model(image)
            
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    conf = float(box.conf[0])
                    class_id = int(box.cls[0])
                    class_name = self.class_names.get(class_id, "unknown")
                    
                    detections.append(Detection(
                        class_id=class_id,
                        class_name=class_name,
                        confidence=conf,
                        bbox=BBox(x1=x1, y1=y1, x2=x2, y2=y2)
                    ))
        else:
            # MOCKED fallback for smoke testing engineering pipeline
            print("Warning: Running inference with no loaded YOLO model (Smoke test mode).")
            # Return a mock detection of a pothole for testing UI
            detections.append(Detection(
                class_id=0,
                class_name="pothole",
                confidence=0.95,
                bbox=BBox(x1=10.0, y1=10.0, x2=100.0, y2=100.0)
            ))
            
        return PredictResponse(detections=detections)

    def predict_video(self, video_path: str, max_frames: int = 10) -> PredictResponse:
        """Sample up to max_frames evenly from a video and aggregate detections."""
        detections = []
        if not self.model:
            print("Warning: Running video inference with no loaded YOLO model (Smoke test mode).")
            detections.append(Detection(
                class_id=0,
                class_name="pothole",
                confidence=0.95,
                bbox=BBox(x1=10.0, y1=10.0, x2=100.0, y2=100.0)
            ))
            return PredictResponse(detections=detections)
            
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise Exception(f"Could not open video {video_path}")
            
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames <= 0:
            total_frames = max_frames
            
        step = max(1, total_frames // max_frames)
        frame_idx = 0
        frames_processed = 0
        
        while frames_processed < max_frames:
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
            ret, frame = cap.read()
            if not ret:
                break
                
            # Convert BGR to RGB for PIL
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image = Image.fromarray(frame_rgb)
            
            results = self.model(image, verbose=False)
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    conf = float(box.conf[0])
                    class_id = int(box.cls[0])
                    class_name = self.class_names.get(class_id, "unknown")
                    
                    detections.append(Detection(
                        class_id=class_id,
                        class_name=class_name,
                        confidence=conf,
                        bbox=BBox(x1=x1, y1=y1, x2=x2, y2=y2)
                    ))
            
            frame_idx += step
            frames_processed += 1
            
        cap.release()
        
        # Deduplicate or just return highest confidence per class for aggregation simplicity
        best_detections = {}
        for d in detections:
            if d.class_id not in best_detections or d.confidence > best_detections[d.class_id].confidence:
                best_detections[d.class_id] = d
                
        return PredictResponse(detections=list(best_detections.values()))


# Singleton instance
ml_service = YoloInferenceService('civicshield_models/final_2class_model/weights/best.pt')