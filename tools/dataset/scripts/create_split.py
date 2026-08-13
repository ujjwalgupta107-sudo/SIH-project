import argparse
import logging
import csv
from pathlib import Path
import shutil
import sys
import yaml
import re

sys.path.append(str(Path(__file__).resolve().parent.parent))
from src.splitter import determine_split

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def load_config():
    config_path = Path(__file__).resolve().parent.parent / "dataset_config.yaml"
    with open(config_path, "r") as f:
        return yaml.safe_load(f)

def extract_group_id(filename: str) -> str:
    """Extracts session prefix. Expects format like LKO_GARBAGE_S001_xxxx.jpg"""
    # Simple fallback: use the first 3 components split by underscore, or the whole name if no underscores
    parts = filename.split("_")
    if len(parts) >= 3:
        return "_".join(parts[:3])
    return filename

def main():
    parser = argparse.ArgumentParser(description="Create group-aware dataset split.")
    parser.add_argument("--input", type=Path, required=True, help="Raw processed dataset directory (must have images/ labels/).")
    parser.add_argument("--output", type=Path, required=True, help="Output split directory.")
    
    args = parser.parse_args()
    config = load_config()
    split_conf = config.get("split", {})
    train_ratio = split_conf.get("train", 0.8)
    val_ratio = split_conf.get("val", 0.2)
    seed = split_conf.get("seed", 42)
    
    img_dir = args.input / "images"
    lbl_dir = args.input / "labels"
    
    if not img_dir.exists() or not lbl_dir.exists():
        logging.error("Input must contain images and labels directories.")
        sys.exit(1)
        
    out_dir = args.output
    for split in ["train", "val", "test"]:
        if split_conf.get(split, 0) > 0:
            (out_dir / "images" / split).mkdir(parents=True, exist_ok=True)
            (out_dir / "labels" / split).mkdir(parents=True, exist_ok=True)
            
    reports_dir = out_dir / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)
    manifest_file = reports_dir / "split_manifest.csv"
    
    manifest_data = []
    
    images = list(img_dir.glob("*.jpg")) + list(img_dir.glob("*.png"))
    for img_path in images:
        group_id = extract_group_id(img_path.stem)
        split = determine_split(group_id, train_ratio, val_ratio, seed)
        
        if split_conf.get(split, 0) == 0:
            # Fallback if a split is set to 0.0 but deterministic hash lands there
            split = "train" 
            
        lbl_path = lbl_dir / (img_path.stem + ".txt")
        
        # Copy to new location
        shutil.copy2(img_path, out_dir / "images" / split / img_path.name)
        if lbl_path.exists():
            shutil.copy2(lbl_path, out_dir / "labels" / split / lbl_path.name)
            
        manifest_data.append({
            "image_id": img_path.name,
            "group_id": group_id,
            "split": split
        })
        
    with open(manifest_file, "w", newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["image_id", "group_id", "split"])
        writer.writeheader()
        writer.writerows(manifest_data)
        
    logging.info(f"Split {len(images)} images into {out_dir}. Manifest saved to {manifest_file}")

if __name__ == "__main__":
    main()
