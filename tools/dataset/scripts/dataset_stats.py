import argparse
import logging
import json
import csv
from pathlib import Path
import sys

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def count_labels(lbl_dir: Path) -> dict:
    counts = {}
    total_objects = 0
    if lbl_dir.exists():
        for txt_file in lbl_dir.glob("*.txt"):
            with open(txt_file, "r") as f:
                for line in f:
                    parts = line.strip().split()
                    if parts:
                        cls = parts[0]
                        counts[cls] = counts.get(cls, 0) + 1
                        total_objects += 1
    return counts, total_objects

def main():
    parser = argparse.ArgumentParser(description="Generate dataset statistics.")
    parser.add_argument("--split-dir", type=Path, required=True, help="Directory containing train/val/test splits.")
    parser.add_argument("--output", type=Path, required=True, help="Output directory for reports.")
    
    args = parser.parse_args()
    
    out_dir = args.output / "reports"
    out_dir.mkdir(parents=True, exist_ok=True)
    json_report = out_dir / "statistics.json"
    csv_report = out_dir / "statistics.csv"
    
    stats = {
        "total_images": 0,
        "total_objects": 0,
        "splits": {}
    }
    
    for split in ["train", "val", "test"]:
        img_dir = args.split_dir / "images" / split
        lbl_dir = args.split_dir / "labels" / split
        
        split_images = len(list(img_dir.glob("*.jpg")) + list(img_dir.glob("*.png"))) if img_dir.exists() else 0
        class_counts, split_objects = count_labels(lbl_dir)
        
        stats["splits"][split] = {
            "images": split_images,
            "objects": split_objects,
            "classes": class_counts
        }
        
        stats["total_images"] += split_images
        stats["total_objects"] += split_objects
        
    with open(json_report, "w") as f:
        json.dump(stats, f, indent=2)
        
    with open(csv_report, "w", newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["split", "images", "objects", "classes"])
        for split, data in stats["splits"].items():
            writer.writerow([split, data["images"], data["objects"], json.dumps(data["classes"])])
            
    logging.info(f"Statistics generated: {stats['total_images']} images, {stats['total_objects']} objects.")
    
if __name__ == "__main__":
    main()
