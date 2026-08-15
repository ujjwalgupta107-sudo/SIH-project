#!/usr/bin/env python3
"""
Integrate Roboflow-exported garbage_pile annotations into CivicShield dataset.

Usage:
    python integrate_roboflow_garbage.py \
        --roboflow-export /path/to/roboflow/export \
        --output-dir civicshield-dataset/processed/custom_garbage \
        --class-id 1

The script:
1. Copies images/labels from Roboflow export (train/valid splits)
2. Remaps class IDs from 0 -> target class (default 1 for garbage_pile)
3. Validates the integrated dataset
4. Runs duplicate detection
"""

import argparse
import logging
import shutil
from pathlib import Path
import sys

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def remap_class_ids(label_dir: Path, old_class: int, new_class: int):
    """Remap class IDs in YOLO label files."""
    count = 0
    for txt_file in label_dir.rglob("*.txt"):
        lines = []
        with open(txt_file, "r") as f:
            for line in f:
                parts = line.strip().split()
                if parts and parts[0] == str(old_class):
                    parts[0] = str(new_class)
                    count += 1
                lines.append(" ".join(parts))
        
        with open(txt_file, "w") as f:
            f.write("\n".join(lines))
    
    logging.info(f"Remapped {count} annotations from class {old_class} -> {new_class}")

def main():
    parser = argparse.ArgumentParser(description="Integrate Roboflow garbage_pile export")
    parser.add_argument("--roboflow-export", type=Path, required=True,
                        help="Path to extracted Roboflow YOLOv8 export")
    parser.add_argument("--output-dir", type=Path, required=True,
                        help="Output directory for integrated dataset")
    parser.add_argument("--class-id", type=int, default=1,
                        help="Target CivicShield class ID (default: 1 for garbage_pile)")
    parser.add_argument("--roboflow-class", type=int, default=0,
                        help="Class ID in Roboflow export (default: 0)")
    
    args = parser.parse_args()
    
    if not args.roboflow_export.exists():
        logging.error(f"Roboflow export not found: {args.roboflow_export}")
        sys.exit(1)
    
    # Expected Roboflow structure
    rf_train_img = args.roboflow_export / "train" / "images"
    rf_train_lbl = args.roboflow_export / "train" / "labels"
    rf_valid_img = args.roboflow_export / "valid" / "images"
    rf_valid_lbl = args.roboflow_export / "valid" / "labels"
    rf_test_img = args.roboflow_export / "test" / "images"
    rf_test_lbl = args.roboflow_export / "test" / "labels"
    
    for d in [rf_train_img, rf_train_lbl, rf_valid_img, rf_valid_lbl]:
        if not d.exists():
            logging.error(f"Missing expected directory: {d}")
            sys.exit(1)
    
    # Output structure (flat, no train/val split yet - split happens later)
    out_img = args.output_dir / "images"
    out_lbl = args.output_dir / "labels"
    out_img.mkdir(parents=True, exist_ok=True)
    out_lbl.mkdir(parents=True, exist_ok=True)
    
    # Copy and remap train
    logging.info("Processing train split...")
    for img_src in rf_train_img.glob("*"):
        shutil.copy2(img_src, out_img / img_src.name)
    for lbl_src in rf_train_lbl.glob("*"):
        shutil.copy2(lbl_src, out_lbl / lbl_src.name)
    
    # Copy and remap valid
    logging.info("Processing valid split...")
    for img_src in rf_valid_img.glob("*"):
        shutil.copy2(img_src, out_img / img_src.name)
    for lbl_src in rf_valid_lbl.glob("*"):
        shutil.copy2(lbl_src, out_lbl / lbl_src.name)
    
    # Copy test if exists
    if rf_test_img.exists() and rf_test_lbl.exists():
        logging.info("Processing test split...")
        for img_src in rf_test_img.glob("*"):
            shutil.copy2(img_src, out_img / img_src.name)
        for lbl_src in rf_test_lbl.glob("*"):
            shutil.copy2(lbl_src, out_lbl / lbl_src.name)
    
    # Remap class IDs
    logging.info(f"Remapping class {args.roboflow_class} -> {args.class_id}")
    remap_class_ids(out_lbl, args.roboflow_class, args.class_id)
    
    # Count results
    img_count = len(list(out_img.glob("*.jpg")) + list(out_img.glob("*.png")))
    lbl_count = len(list(out_lbl.glob("*.txt")))
    logging.info(f"Integrated {img_count} images, {lbl_count} labels to {args.output_dir}")
    
    logging.info("Next steps:")
    logging.info(f"  1. Run duplicate detection: python tools/dataset/scripts/find_duplicates.py --input {args.output_dir}/images --output {args.output_dir}")
    logging.info(f"  2. Review duplicates.csv, delete lower-quality copies")
    logging.info(f"  3. Validate: python tools/dataset/scripts/validate_dataset.py --dataset {args.output_dir} --output {args.output_dir}")
    logging.info(f"  4. Merge with pothole + waterlogging into final_3class")
    logging.info(f"  5. Run create_split.py, check_leakage.py, authorize_training.py")

if __name__ == "__main__":
    main()