import argparse
import logging
import json
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def load_json(path: Path) -> dict:
    if path.exists():
        with open(path, "r") as f:
            return json.load(f)
    return {}

def main():
    parser = argparse.ArgumentParser(description="Generate comprehensive Markdown report.")
    parser.add_argument("--reports-dir", type=Path, required=True, help="Directory containing JSON reports.")
    parser.add_argument("--version", type=str, default="v1.0", help="Dataset version.")
    
    args = parser.parse_args()
    
    val_data = load_json(args.reports_dir / "validation.json")
    leakage_data = load_json(args.reports_dir / "leakage.json")
    stats_data = load_json(args.reports_dir / "statistics.json")
    
    report_path = args.reports_dir / "dataset_report.md"
    
    with open(report_path, "w") as f:
        f.write(f"# CivicShield Dataset Report ({args.version})\n\n")
        
        f.write("## Validation\n")
        status = val_data.get("status", "UNKNOWN")
        f.write(f"- Status: **{status}**\n")
        if status == "FAIL":
            f.write("### Errors\n")
            for err in val_data.get("errors", [])[:10]:
                f.write(f"- {err}\n")
                
        f.write("\n## Leakage\n")
        l_status = leakage_data.get("status", "UNKNOWN")
        f.write(f"- Status: **{l_status}**\n")
        if l_status == "FAIL":
            for leak in leakage_data.get("leakages", []):
                f.write(f"- {leak}\n")
                
        f.write("\n## Statistics\n")
        f.write(f"- Total Images: {stats_data.get('total_images', 0)}\n")
        f.write(f"- Total Objects: {stats_data.get('total_objects', 0)}\n\n")
        
        for split, data in stats_data.get("splits", {}).items():
            f.write(f"### {split.capitalize()}\n")
            f.write(f"- Images: {data.get('images', 0)}\n")
            f.write(f"- Objects: {data.get('objects', 0)}\n")
            
    logging.info(f"Report generated: {report_path}")

if __name__ == "__main__":
    main()
