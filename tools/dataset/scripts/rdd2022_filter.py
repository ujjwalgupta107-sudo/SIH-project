import argparse
import logging
from pathlib import Path
import shutil
import sys
import yaml

# Add parent directory to path to import src
sys.path.append(str(Path(__file__).resolve().parent.parent))
from src.parser import parse_pascal_voc

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def main():
    parser = argparse.ArgumentParser(description="Filter RDD2022 dataset for a specific class.")
    parser.add_argument("--input", type=Path, required=True, help="Raw RDD2022 directory (should contain 'annotations' and 'images').")
    parser.add_argument("--output", type=Path, required=True, help="Output directory for filtered dataset.")
    parser.add_argument("--target-class", type=str, default="D40", help="Class to retain (default: D40).")
    
    args = parser.parse_args()
    
    if not args.input.exists():
        logging.error(f"Input directory does not exist: {args.input}")
        sys.exit(1)
        
    xml_dir = args.input / "annotations" / "xmls"
    img_dir = args.input / "images"
    
    if not xml_dir.exists() or not img_dir.exists():
        logging.error("Input directory must contain 'annotations/xmls' and 'images' subdirectories.")
        sys.exit(1)
        
    out_xml_dir = args.output / "annotations" / "xmls"
    out_img_dir = args.output / "images"
    
    out_xml_dir.mkdir(parents=True, exist_ok=True)
    out_img_dir.mkdir(parents=True, exist_ok=True)
    
    processed = 0
    kept = 0
    discarded = 0
    malformed = 0
    
    for xml_path in xml_dir.glob("*.xml"):
        processed += 1
        result = parse_pascal_voc(xml_path, args.target_class)
        
        if result is None:
            discarded += 1
            continue
            
        # If valid, copy xml and image
        img_name = xml_path.stem + ".jpg"
        img_path = img_dir / img_name
        
        if img_path.exists():
            shutil.copy2(xml_path, out_xml_dir / xml_path.name)
            shutil.copy2(img_path, out_img_dir / img_name)
            kept += 1
        else:
            logging.warning(f"Image not found for valid annotation: {img_name}")
            malformed += 1
            
    logging.info(f"Total Processed: {processed}")
    logging.info(f"Total Kept: {kept}")
    logging.info(f"Total Discarded: {discarded}")
    logging.info(f"Malformed/Missing Images: {malformed}")

if __name__ == "__main__":
    main()
