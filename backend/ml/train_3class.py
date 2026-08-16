#!/usr/bin/env python3
"""
CivicShield AI — YOLOv8n 3-Class Training Script
=================================================
Trains a YOLOv8n model on the final 3-class civic incident dataset.

Classes:
  0 = pothole
  1 = garbage_pile
  2 = waterlogging

PREREQUISITES:
  1. Garbage images must be annotated (labels/ not empty)
  2. Run: python tools/merge_dataset.py --build
  3. Run: python tools/validate_dataset.py
  4. CUDA recommended (PyTorch+CUDA build required for GPU)

USAGE:
  python backend/ml/train_3class.py            # normal training
  python backend/ml/train_3class.py --resume   # resume interrupted run
  python backend/ml/train_3class.py --dry-run  # check setup only

OUTPUT:
  civicshield_models/final_3class_model/
    weights/best.pt    <- Use this for inference
    weights/last.pt
    results.csv
    results.png
"""
import argparse
import sys
import os
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent
DATASET_YAML = ROOT / 'civicshield-dataset' / 'processed' / 'final_3class' / 'data.yaml'
WEIGHTS_BASE = Path(__file__).parent / 'yolov8n.pt'
OUTPUT_DIR = ROOT / 'civicshield_models'


def preflight_check() -> bool:
    """Verify everything is in place before training starts."""
    ok = True
    print('Pre-flight checks...')

    # 1. Dataset YAML exists
    if not DATASET_YAML.exists():
        print(f'  [ERR] dataset not found: {DATASET_YAML}')
        print('     Run: python tools/merge_dataset.py --build')
        ok = False
    else:
        print(f'  [OK] dataset.yaml: {DATASET_YAML}')

    # 2. Garbage labels exist
    garbage_lbl = ROOT / 'civicshield-dataset' / 'processed' / 'garbage_yolo' / 'labels'
    label_count = len(list(garbage_lbl.glob('*.txt'))) if garbage_lbl.exists() else 0
    if label_count == 0:
        print(f'  [ERR] garbage_pile: 0 annotation files in {garbage_lbl}')
        print('     Annotate images first (see tools/merge_dataset.py --status)')
        ok = False
    else:
        print(f'  [OK] garbage_pile: {label_count} annotation files')

    # 3. PyTorch available
    try:
        import torch
        print(f'  [OK] PyTorch: {torch.__version__}')

        if torch.cuda.is_available():
            gpu = torch.cuda.get_device_name(0)
            vram = round(torch.cuda.get_device_properties(0).total_memory / 1e9, 1)
            print(f'  [OK] GPU: {gpu} ({vram} GB VRAM)')
            device = '0'
        else:
            print('  [WARN] CUDA unavailable -- training on CPU (will be slow)')
            print('     For GPU: reinstall PyTorch with CUDA support')
            print('     Command: pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121')
            device = 'cpu'
    except ImportError:
        print('  [ERR] PyTorch not installed')
        ok = False
        device = 'cpu'

    # 4. Ultralytics YOLO
    try:
        from ultralytics import YOLO
        import ultralytics
        print(f'  [OK] Ultralytics: {ultralytics.__version__}')
    except ImportError:
        print('  [ERR] Ultralytics not installed: pip install ultralytics')
        ok = False

    # 5. Base weights
    if WEIGHTS_BASE.exists():
        print(f'  [OK] Base weights: {WEIGHTS_BASE.name}')
    else:
        print(f'  [WARN] {WEIGHTS_BASE.name} not found -- will be auto-downloaded')

    return ok, device


def train(resume: bool = False, epochs: int = 50, batch: int = -1, device: str = '0'):
    """Run training."""
    from ultralytics import YOLO

    model_path = str(WEIGHTS_BASE) if WEIGHTS_BASE.exists() else 'yolov8n.pt'

    if resume:
        # Look for last.pt to resume from
        last_pt = OUTPUT_DIR / 'final_3class_model' / 'weights' / 'last.pt'
        if last_pt.exists():
            model_path = str(last_pt)
            print(f'Resuming from: {last_pt}')
        else:
            print(f'[WARN] last.pt not found at {last_pt}, starting fresh')

    model = YOLO(model_path)

    # Auto batch size on GPU, manual on CPU
    if batch == -1:
        import torch
        batch = -1 if torch.cuda.is_available() else 8

    print(f'\nStarting training:')
    print(f'  Dataset: {DATASET_YAML}')
    print(f'  Model:   {model_path}')
    print(f'  Epochs:  {epochs}')
    print(f'  Batch:   {"auto" if batch == -1 else batch}')
    print(f'  Device:  {device}')
    print(f'  Output:  {OUTPUT_DIR}/final_3class_model/')
    print()

    results = model.train(
        data=str(DATASET_YAML),
        epochs=epochs,
        imgsz=640,
        batch=batch,
        device=device,
        project=str(OUTPUT_DIR),
        name='final_3class_model',
        exist_ok=True,
        resume=resume,
        patience=15,      # early stopping
        save=True,
        cache=False,       # set True if RAM available
        verbose=True,
    )

    # Verify output
    best_pt = OUTPUT_DIR / 'final_3class_model' / 'weights' / 'best.pt'
    if best_pt.exists():
        print(f'\n[OK] Training complete.')
        print(f'   best.pt: {best_pt}')
        print(f'\nVerifying model...')
        verify_model(best_pt)
    else:
        print(f'\n[ERR] Training may have failed -- best.pt not found at {best_pt}')

    return results


def verify_model(model_path: Path):
    """Load and do a quick sanity-check inference on the trained model."""
    import numpy as np
    from ultralytics import YOLO

    model = YOLO(str(model_path))
    dummy = np.zeros((640, 640, 3), dtype=np.uint8)
    results = model(dummy, verbose=False)
    print(f'  [OK] Model loaded and ran inference (classes: {model.names})')
    expected_names = {0: 'pothole', 1: 'garbage_pile', 2: 'waterlogging'}
    for cid, name in expected_names.items():
        actual = model.names.get(cid)
        if actual != name:
            print(f'  [ERR] Class {cid} mismatch: expected {name}, got {actual}')
        else:
            print(f'  [OK] Class {cid}: {name}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='CivicShield YOLOv8n Training')
    parser.add_argument('--resume', action='store_true', help='Resume from last checkpoint')
    parser.add_argument('--dry-run', action='store_true', help='Check setup only, do not train')
    parser.add_argument('--epochs', type=int, default=50)
    parser.add_argument('--batch', type=int, default=-1, help='-1 = auto')
    parser.add_argument('--device', type=str, default='auto', help='0, cpu, or auto')
    args = parser.parse_args()

    ok, detected_device = preflight_check()
    device = detected_device if args.device == 'auto' else args.device

    if args.dry_run:
        print('\n[DRY RUN] Pre-flight only -- no training started')
        sys.exit(0 if ok else 1)

    if not ok:
        print('\n[ERR] Pre-flight failed. Fix errors above before training.')
        sys.exit(1)

    print(f'\n[OK] Pre-flight passed. Starting training on device={device}...\n')
    train(resume=args.resume, epochs=args.epochs, batch=args.batch, device=device)
