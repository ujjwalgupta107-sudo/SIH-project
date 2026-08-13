# CivicShield Dataset Tooling

This directory contains the automated dataset preprocessing and validation tooling for CivicShield AI Phase 3C.

## Installation

```bash
cd tools/dataset
pip install -r requirements.txt
```

## Execution Order

The dataset tooling is designed to be executed sequentially on a clean dataset:

1. **Filter RDD2022**: Extract `D40` class XMLs.
   ```bash
   python scripts/rdd2022_filter.py --input raw/rdd2022 --output processed/rdd2022
   ```
2. **Convert to YOLO**: Convert XML to YOLO txt format.
   ```bash
   python scripts/rdd2022_to_yolo.py --input processed/rdd2022 --output processed/rdd2022_yolo
   ```
3. **Find Duplicates**: Detect perceptual duplicates (requires manual review).
   ```bash
   python scripts/find_duplicates.py --input processed/custom --output reports
   ```
4. **Validate Dataset**: Ensure label validity and ranges.
   ```bash
   python scripts/validate_dataset.py --dataset processed/merged --output reports
   ```
5. **Create Split**: Group-aware split using session IDs.
   ```bash
   python scripts/create_split.py --input processed/merged --output final_dataset
   ```
6. **Check Leakage**: Verify session disjoint sets.
   ```bash
   python scripts/check_leakage.py --manifest final_dataset/reports/split_manifest.csv --output final_dataset/reports
   ```
7. **Dataset Stats**: Calculate class distribution.
   ```bash
   python scripts/dataset_stats.py --split-dir final_dataset --output final_dataset/reports
   ```
8. **Validate data.yaml**:
   ```bash
   python scripts/validate_data_yaml.py --yaml final_dataset/data.yaml
   ```
9. **Generate Report**:
   ```bash
   python scripts/generate_report.py --reports-dir final_dataset/reports
   ```
10. **Authorize Training**:
    ```bash
    python scripts/authorize_training.py --reports-dir final_dataset/reports --yaml final_dataset/data.yaml
    ```
