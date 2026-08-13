import argparse
import logging
import json
from pathlib import Path
import sys
import yaml

sys.path.append(str(Path(__file__).resolve().parent.parent))
from src.validator import validate_yolo_label

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def load_config():
    config_path = Path(__file__).resolve().parent.parent / "dataset_config.yaml"
    with open(config_path, "r") as f:
        return yaml.safe_load(f)

def main():
    parser = argparse.ArgumentParser(description="Validate YOLO dataset.")
    parser.add_argument("--dataset", type=Path, required=True, help="Directory containing images/ and labels/ subdirectories.")
    parser.add_argument("--output", type=Path, required=True, help="Output directory for reports.")
    
    args = parser.parse_args()
    config = load_config()
    allowed_classes = set(config["classes"].values())
    
    img_dir = args.dataset / "images"
    lbl_dir = args.dataset / "labels"
    
    if not img_dir.exists() or not lbl_dir.exists():
        logging.error("Dataset must contain 'images' and 'labels' subdirectories.")
        sys.exit(1)
        
    out_dir = args.output / "reports"
    out_dir.mkdir(parents=True, exist_ok=True)
    report_file = out_dir / "validation.json"
    
    report = {
        "status": "PASS",
        "errors": [],
        "warnings": [],
        "stats": {
            "total_images": 0,
            "total_labels": 0
        }
    }
    
    # Check images -> labels
    for img_path in list(img_dir.rglob("*.jpg")) + list(img_dir.rglob("*.png")):
        report["stats"]["total_images"] += 1
        rel_path = img_path.relative_to(img_dir)
        lbl_path = lbl_dir / rel_path.with_suffix(".txt")
        
        if not lbl_path.exists():
            report["errors"].append(f"Missing label for image: {rel_path}")
            
    # Check labels -> images and validate label content
    for lbl_path in lbl_dir.rglob("*.txt"):
        report["stats"]["total_labels"] += 1
        rel_path = lbl_path.relative_to(lbl_dir)
        img_path_jpg = img_dir / rel_path.with_suffix(".jpg")
        img_path_png = img_dir / rel_path.with_suffix(".png")
        
        if not img_path_jpg.exists() and not img_path_png.exists():
            report["errors"].append(f"Missing image for label: {rel_path}")
            
        label_errors = validate_yolo_label(lbl_path, allowed_classes)
        for err in label_errors:
            report["errors"].append(f"{rel_path} - {err}")
            
    if report["errors"]:
        report["status"] = "FAIL"
        logging.error(f"Validation FAILED with {len(report['errors'])} errors.")
        for err in report["errors"][:10]:
            logging.error(err)
        if len(report["errors"]) > 10:
            logging.error(f"...and {len(report['errors']) - 10} more.")
    else:
        logging.info("Validation PASSED.")
        
    with open(report_file, "w") as f:
        json.dump(report, f, indent=2)
        
    logging.info(f"Report written to {report_file}")
    
if __name__ == "__main__":
    main()
