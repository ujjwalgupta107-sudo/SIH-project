import os
from ultralytics import YOLO

def main():
    print("Starting CivicShield 2-class interim YOLOv8 training...")
    
    dataset_path = os.path.join(os.path.dirname(__file__), 'dataset.yaml')
    
    model = YOLO('yolov8n.pt')
    
    # Train for 1 epoch for interim model (optimized for fast CPU verification)
    results = model.train(
        data=dataset_path,
        epochs=1,
        imgsz=160,
        batch=32,
        project='civicshield_models',
        name='interim_2class_model',
        exist_ok=True
    )
    
    print("Training complete. Validating...")
    metrics = model.val()
    print(f"mAP50-95: {metrics.box.map}")
    print(f"mAP50: {metrics.box.map50}")
    
    print("\nPer-class metrics:")
    for i, c in enumerate(metrics.box.maps):
        print(f"  Class {i}: mAP50-95 = {c:.4f}")

if __name__ == '__main__':
    main()