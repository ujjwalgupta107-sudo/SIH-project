import os
import io
from PIL import Image
try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None

from ..schemas import PredictResponse, Detection, BBox

CLASS_NAMES = {
    0: 'pothole',
    1: 'garbage_pile',
    2: 'waterlogging'
}

class YoloInferenceService:
    def __init__(self, model_path: str = None):
        self.model = None
        # In a real environment, we would load the trained weights here.
        # If the file doesn't exist, we run in mocked "smoke test" mode.
        if YOLO and model_path and os.path.exists(model_path):
            try:
                self.model = YOLO(model_path)
            except Exception as e:
                print(f"Failed to load YOLO model from {model_path}: {e}")

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
                    class_name = CLASS_NAMES.get(class_id, "unknown")
                    
                    detections.append(Detection(
                        class_id=class_id,
                        class_name=class_name,
                        confidence=conf,
                        bbox=BBox(x1=x1, y1=y1, x2=x2, y2=y2)
                    ))
        else:
            # MOCKED fallback for smoke testing engineering pipeline before Class 1 data is collected
            print("Warning: Running inference with no loaded YOLO model (Smoke test mode).")
            # Always return a mock detection of a pothole for testing UI
            detections.append(Detection(
                class_id=0,
                class_name="pothole",
                confidence=0.95,
                bbox=BBox(x1=10.0, y1=10.0, x2=100.0, y2=100.0)
            ))
            
        return PredictResponse(detections=detections)

# Singleton instance
ml_service = YoloInferenceService('civicshield_models/final_3class_model/weights/best.pt')
