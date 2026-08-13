import argparse
import logging
from pathlib import Path
import sys
import yaml
import csv

sys.path.append(str(Path(__file__).resolve().parent.parent))
from src.phash import get_phash, phash_distance

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def load_config():
    config_path = Path(__file__).resolve().parent.parent / "dataset_config.yaml"
    with open(config_path, "r") as f:
        return yaml.safe_load(f)

def main():
    parser = argparse.ArgumentParser(description="Find near-duplicate images using pHash.")
    parser.add_argument("--input", type=Path, required=True, help="Directory containing images.")
    parser.add_argument("--output", type=Path, required=True, help="Output directory for reports.")
    
    args = parser.parse_args()
    config = load_config()
    threshold = config.get("thresholds", {}).get("phash_distance", 5)
    
    if not args.input.exists():
        logging.error(f"Input directory does not exist: {args.input}")
        sys.exit(1)
        
    out_dir = args.output / "reports"
    out_dir.mkdir(parents=True, exist_ok=True)
    report_file = out_dir / "duplicates.csv"
    
    images = list(args.input.rglob("*.jpg")) + list(args.input.rglob("*.png"))
    logging.info(f"Found {len(images)} images. Computing hashes...")
    
    hashes = {}
    for img in images:
        h = get_phash(img)
        if h:
            hashes[img] = h
            
    logging.info("Comparing hashes...")
    duplicates = []
    
    img_list = list(hashes.keys())
    for i in range(len(img_list)):
        for j in range(i + 1, len(img_list)):
            img1, img2 = img_list[i], img_list[j]
            dist = phash_distance(hashes[img1], hashes[img2])
            if dist < threshold:
                duplicates.append({
                    "image1": str(img1.name),
                    "image2": str(img2.name),
                    "distance": dist,
                    "phash1": hashes[img1],
                    "phash2": hashes[img2]
                })
                
    with open(report_file, "w", newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["image1", "image2", "distance", "phash1", "phash2"])
        writer.writeheader()
        writer.writerows(duplicates)
        
    logging.info(f"Found {len(duplicates)} duplicate pairs. Wrote to {report_file}")
    
if __name__ == "__main__":
    main()
