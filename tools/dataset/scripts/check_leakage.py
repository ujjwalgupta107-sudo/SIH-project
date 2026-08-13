import argparse
import logging
import csv
import json
from pathlib import Path
import sys

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def main():
    parser = argparse.ArgumentParser(description="Check for data leakage between splits.")
    parser.add_argument("--manifest", type=Path, required=True, help="Path to split_manifest.csv")
    parser.add_argument("--output", type=Path, required=True, help="Output directory for reports")
    
    args = parser.parse_args()
    
    if not args.manifest.exists():
        logging.error(f"Manifest file not found: {args.manifest}")
        sys.exit(1)
        
    out_dir = args.output / "reports"
    out_dir.mkdir(parents=True, exist_ok=True)
    report_file = out_dir / "leakage.json"
    
    report = {
        "status": "PASS",
        "leakages": []
    }
    
    group_splits = {}
    with open(args.manifest, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            group_id = row["group_id"]
            split = row["split"]
            if group_id not in group_splits:
                group_splits[group_id] = set()
            group_splits[group_id].add(split)
            
    for group_id, splits in group_splits.items():
        if len(splits) > 1:
            report["leakages"].append(f"Group {group_id} appears in multiple splits: {splits}")
            
    if report["leakages"]:
        report["status"] = "FAIL"
        logging.error(f"HARD FAILURE: Found {len(report['leakages'])} leakage(s) across splits.")
        for leak in report["leakages"]:
            logging.error(leak)
    else:
        logging.info("No leakage detected across splits. PASS.")
        
    with open(report_file, "w") as f:
        json.dump(report, f, indent=2)

if __name__ == "__main__":
    main()
