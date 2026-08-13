import argparse
import logging
import json
from pathlib import Path
import sys

logging.basicConfig(level=logging.INFO, format='%(message)s')

def main():
    parser = argparse.ArgumentParser(description="Final training authorization gate.")
    parser.add_argument("--reports-dir", type=Path, required=True, help="Directory containing JSON reports.")
    parser.add_argument("--yaml", type=Path, required=True, help="Path to data.yaml")
    
    args = parser.parse_args()
    
    # Simple check for data.yaml existence (since validate_data_yaml.py handles deep validation)
    yaml_valid = args.yaml.exists()
    
    val_path = args.reports_dir / "validation.json"
    leakage_path = args.reports_dir / "leakage.json"
    
    blockers = []
    
    if not yaml_valid:
        blockers.append("data.yaml not found.")
        
    if not val_path.exists():
        blockers.append("validation.json not found. Run validate_dataset.py.")
    else:
        with open(val_path, "r") as f:
            val_data = json.load(f)
            if val_data.get("status") != "PASS":
                blockers.append("Dataset validation failed. See validation.json.")
                
    if not leakage_path.exists():
        blockers.append("leakage.json not found. Run check_leakage.py.")
    else:
        with open(leakage_path, "r") as f:
            leak_data = json.load(f)
            if leak_data.get("status") != "PASS":
                blockers.append("Leakage detected. See leakage.json.")
                
    if blockers:
        logging.error("======================================")
        logging.error("      TRAINING NOT AUTHORIZED         ")
        logging.error("======================================")
        logging.error("Blockers:")
        for b in blockers:
            logging.error(f"- {b}")
        sys.exit(1)
    else:
        logging.info("======================================")
        logging.info("        TRAINING AUTHORIZED           ")
        logging.info("======================================")
        logging.info("All automated checks passed.")
        
if __name__ == "__main__":
    main()
