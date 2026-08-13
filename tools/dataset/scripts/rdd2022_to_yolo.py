import argparse
import logging
from pathlib import Path
import sys
import yaml

sys.path.append(str(Path(__file__).resolve().parent.parent))
from src.parser import parse_pascal_voc
from src.converter import convert_to_yolo

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def load_config():
    config_path = Path(__file__).resolve().parent.parent / "dataset_config.yaml"
    with open(config_path, "r") as f:
        return yaml.safe_load(f)

def main():
    parser = argparse.ArgumentParser(description="Convert filtered RDD2022 to YOLO.")
    parser.add_argument("--input", type=Path, required=True, help="Filtered RDD2022 directory.")
    parser.add_argument("--output", type=Path, required=True, help="Output directory for YOLO format.")
    parser.add_argument("--target-class", type=str, default="D40", help="Class to convert.")
    
    args = parser.parse_args()
    config = load_config()
    
    class_name_map = {"D40": "pothole"}
    civic_class = class_name_map.get(args.target_class)
    if civic_class not in config["classes"]:
        logging.error(f"Class {civic_class} not found in config.")
        sys.exit(1)
        
    class_id = config["classes"][civic_class]
    
    xml_dir = args.input / "annotations" / "xmls"
    if not xml_dir.exists():
        logging.error(f"Annotations directory not found: {xml_dir}")
        sys.exit(1)
        
    out_labels = args.output / "labels"
    out_labels.mkdir(parents=True, exist_ok=True)
    
    processed = 0
    errors = 0
    
    for xml_path in xml_dir.glob("*.xml"):
        result = parse_pascal_voc(xml_path, args.target_class)
        if result:
            w = result["width"]
            h = result["height"]
            
            yolo_lines = []
            for box in result["bboxes"]:
                yolo_coords = convert_to_yolo(box["xmin"], box["ymin"], box["xmax"], box["ymax"], w, h)
                if yolo_coords:
                    yolo_lines.append(f"{class_id} {yolo_coords[0]:.6f} {yolo_coords[1]:.6f} {yolo_coords[2]:.6f} {yolo_coords[3]:.6f}")
                else:
                    errors += 1
                    logging.warning(f"Invalid bounding box in {xml_path.name}")
                    
            if yolo_lines:
                txt_path = out_labels / (xml_path.stem + ".txt")
                with open(txt_path, "w") as f:
                    f.write("\n".join(yolo_lines))
                processed += 1
                
    logging.info(f"Processed {processed} annotations. {errors} invalid boxes dropped.")

if __name__ == "__main__":
    main()
