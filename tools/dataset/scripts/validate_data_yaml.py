import argparse
import logging
from pathlib import Path
import sys
import yaml

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def main():
    parser = argparse.ArgumentParser(description="Validate data.yaml structure.")
    parser.add_argument("--yaml", type=Path, required=True, help="Path to data.yaml")
    
    args = parser.parse_args()
    
    if not args.yaml.exists():
        logging.error(f"data.yaml not found at {args.yaml}")
        sys.exit(1)
        
    with open(args.yaml, "r") as f:
        data = yaml.safe_load(f)
        
    errors = []
    
    for key in ["train", "val", "nc", "names"]:
        if key not in data:
            errors.append(f"Missing required key: {key}")
            
    if not errors:
        nc = data["nc"]
        names = data["names"]
        
        if not isinstance(names, list):
            errors.append("'names' must be a list.")
        elif len(names) != nc:
            errors.append(f"'nc' ({nc}) does not match length of 'names' ({len(names)}).")
            
        expected_names = ["pothole", "garbage_pile", "waterlogging"]
        if names != expected_names:
            errors.append(f"'names' ordering or content does not match expected: {expected_names}")
            
    if errors:
        logging.error("data.yaml validation FAILED:")
        for err in errors:
            logging.error(err)
        sys.exit(1)
    else:
        logging.info("data.yaml validation PASSED.")
        
if __name__ == "__main__":
    main()
