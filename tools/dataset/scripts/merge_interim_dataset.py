#!/usr/bin/env python3
"""
Merge Class 0 (pothole) and Class 2 (waterlogging)
into interim_2class dataset structure for training.

Usage:
    python merge_interim_dataset.py \
        --pothole civicshield-dataset/processed/pothole_yolo \
        --waterlogging civicshield-dataset/processed/waterlogging_unique \
        --output civicshield-dataset/processed/interim_2class
"""

import argparse
import logging
import shutil
from pathlib import Path
import sys

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def copy_with_prefix(src_img: Path, src_lbl: Path, dst_img: Path, dst_lbl: Path, prefix: str):
    """Copy images and labels with prefix to avoid conflicts."""
    dst_img.mkdir(parents=True, exist_ok=True)
    dst_lbl.mkdir(parents=True, exist_ok=True)
    
    img_count = 0
    lbl_count = 0
    
    for img_file in src_img.glob("*"):
        new_name = f"{prefix}_{img_file.name}"
        shutil.copy2(img_file, dst_img / new_name)
        img_count += 1
    
    for lbl_file in src_lbl.glob("*"):
        new_name = f"{prefix}_{lbl_file.name}"
        shutil.copy2(lbl_file, dst_lbl / new_name)
        lbl_count += 1
    
    logging.info(f"  {prefix}: {img_count} images, {lbl_count} labels")
    return img_count, lbl_count

def main():
    parser = argparse.ArgumentParser(description="Merge 2-class datasets for interim training")
    parser.add_argument("--pothole", type=Path, required=True, help="Pothole dataset (class 0)")
    parser.add_argument("--waterlogging", type=Path, required=True, help="Waterlogging dataset (class 2)")
    parser.add_argument("--output", type=Path, required=True, help="Output interim_2class directory")
    
    args = parser.parse_args()
    
    # Verify inputs
    for name, path in [("pothole", args.pothole), ("waterlogging", args.waterlogging)]:
        img_dir = path / "images"
        lbl_dir = path / "labels"
        if not img_dir.exists() or not lbl_dir.exists():
            logging.error(f"{name}: missing images/ or labels/ in {path}")
            sys.exit(1)
    
    # Output structure
    out_train_img = args.output / "images" / "train"
    out_train_lbl = args.output / "labels" / "train"
    out_val_img = args.output / "images" / "val"
    out_val_lbl = args.output / "labels" / "val"
    
    # Remove existing
    if args.output.exists():
        logging.info(f"Removing existing {args.output}")
        shutil.rmtree(args.output)
    
    # Pothole (class 0) - has train/ subdir
    pothole_train_img = args.pothole / "images" / "train"
    pothole_train_lbl = args.pothole / "labels" / "train"
    pothole_val_img = args.pothole / "images" / "val" if (args.pothole / "images" / "val").exists() else None
    pothole_val_lbl = args.pothole / "labels" / "val" if (args.pothole / "labels" / "val").exists() else None
    
    # Waterlogging (class 2) - has train/ subdir
    water_train_img = args.waterlogging / "images" / "train"
    water_train_lbl = args.waterlogging / "labels" / "train"
    water_val_img = args.waterlogging / "images" / "val" if (args.waterlogging / "images" / "val").exists() else None
    water_val_lbl = args.waterlogging / "labels" / "val" if (args.waterlogging / "labels" / "val").exists() else None
    
    total_train_img = 0
    total_train_lbl = 0
    total_val_img = 0
    total_val_lbl = 0
    
    # Copy train splits
    logging.info("Copying train splits...")
    for prefix, src_img, src_lbl in [
        ("pothole", pothole_train_img, pothole_train_lbl),
        ("water", water_train_img, water_train_lbl),
    ]:
        if src_img.exists() and src_lbl.exists():
            ci, cl = copy_with_prefix(src_img, src_lbl, args.output / "images" / "train", args.output / "labels" / "train", prefix)
            total_train_img += ci
            total_train_lbl += cl
        else:
            logging.warning(f"Missing train split for {prefix}: {src_img} or {src_lbl}")
    
    # Copy val splits
    logging.info("Copying val splits...")
    for prefix, src_img, src_lbl in [
        ("pothole", pothole_val_img, pothole_val_lbl),
        ("water", water_val_img, water_val_lbl),
    ]:
        if src_img and src_lbl and src_img.exists() and src_lbl.exists():
            ci, cl = copy_with_prefix(src_img, src_lbl, args.output / "images" / "val", args.output / "labels" / "val", prefix)
            total_val_img += ci
            total_val_lbl += cl
        else:
            logging.warning(f"Missing val split for {prefix}")
    
    logging.info(f"Total train: {total_train_img} images, {total_train_lbl} labels")
    logging.info(f"Total val: {total_val_img} images, {total_val_lbl} labels")
    
    # Verify counts match
    if total_train_img != total_train_lbl:
        logging.warning(f"Train count mismatch: {total_train_img} images vs {total_train_lbl} labels")
    if total_val_img != total_val_lbl:
        logging.warning(f"Val count mismatch: {total_val_img} images vs {total_val_lbl} labels")
    
    # Create data.yaml for 2-class
    data_yaml = args.output / "data.yaml"
    with open(data_yaml, "w") as f:
        f.write(f"""path: {args.output.absolute()}
train: images/train
val: images/val
test: images/test

# Classes
nc: 2
names:
  0: pothole
  2: waterlogging
""")
    logging.info(f"Created {data_yaml}")
    
    logging.info("Next steps:")
    logging.info(f"  1. Validate: python tools/dataset/scripts/validate_dataset.py --dataset {args.output} --output {args.output}")
    logging.info(f"  2. Split: python tools/dataset/scripts/create_split.py --input {args.output} --output {args.output}_split")
    logging.info(f"  3. Check leakage: python tools/dataset/scripts/check_leakage.py --manifest {args.output}_split/reports/split_manifest.csv --output {args.output}_split")
    logging.info(f"  4. Authorize: python tools/dataset/scripts/authorize_training.py --reports-dir {args.output}_split/reports --yaml {args.output}/data.yaml")

if __name__ == "__main__":
    main()