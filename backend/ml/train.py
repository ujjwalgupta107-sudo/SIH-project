import os
from ultralytics import YOLO

def main():
    print("Starting CivicShield 3-class YOLOv8 training pipeline...")
    
    # Path to dataset config
    dataset_path = os.path.join(os.path.dirname(__file__), 'dataset.yaml')
    
    # We use the nano model for faster inference and lower resource usage on edge devices
    model = YOLO('yolov8n.pt') 
    
    # Train the model
    # Note: This will fail currently if the final_3class dataset doesn't exist yet, 
    # which is expected until Class-1 data is collected.
    results = model.train(
        data=dataset_path,
        epochs=50,
        imgsz=640,
        batch=16,
        project='civicshield_models',
        name='final_3class_model',
        exist_ok=True
    )
    
    print("Training complete. Validating...")
    metrics = model.val()
    print(f"mAP50-95: {metrics.box.map}")

if __name__ == '__main__':
    main()
