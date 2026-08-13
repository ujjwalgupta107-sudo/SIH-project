# CIVICSHIELD AI — PHASE 3C DATASET TOOLING SPECIFICATION

## 1. TOOL ARCHITECTURE
The dataset tooling will be isolated from the FastAPI application to keep production dependencies clean.
```text
tools/dataset/
├── README.md
├── requirements.txt
├── dataset_config.yaml
├── src/
│   ├── __init__.py
│   ├── parser.py
│   ├── converter.py
│   ├── validator.py
│   ├── splitter.py
│   └── phash.py
├── scripts/
│   ├── rdd2022_filter.py
│   ├── rdd2022_to_yolo.py
│   ├── find_duplicates.py
│   ├── validate_dataset.py
│   ├── check_leakage.py
│   ├── create_split.py
│   ├── dataset_stats.py
│   ├── validate_data_yaml.py
│   ├── generate_report.py
│   └── authorize_training.py
├── tests/
└── reports/
```

## 2. RDD2022 FILTER
**Design:** `scripts/rdd2022_filter.py`
**Input:** Raw RDD2022 extracted directory.
**Output:** Filtered dataset directory containing only images/XMLs with pothole annotations.
**Behavior:**
- Parse `annotations/xmls/*.xml`.
- Retain only if `<name>D40</name>` is present.
- Discard XMLs without `D40` and their corresponding images to save space.
- Preserve source metadata.
- Report terminal statistics: `Total Processed`, `Total Kept`, `Total Discarded`, `Malformed XMLs`.
**CLI Interface:**
`python scripts/rdd2022_filter.py --input raw/rdd2022 --output processed/rdd2022_filtered --target-class D40`

## 3. RDD2022 → YOLO CONVERTER
**Design:** `scripts/rdd2022_to_yolo.py`
**Behavior:**
- Iterates over XMLs in `processed/rdd2022_filtered`.
- Reads image `width` and `height` from `<size>` tag (fails if missing).
- Extracts `<bndbox>` coordinates `xmin, ymin, xmax, ymax`.
- Applies YOLO normalization:
  - `x_center = ((xmin + xmax) / 2) / width`
  - `y_center = ((ymin + ymax) / 2) / height`
  - `w = (xmax - xmin) / width`
  - `h = (ymax - ymin) / height`
- Maps `D40` to class `0` (configured in `dataset_config.yaml`).
- Writes output to `image_filename.txt`.
- **Invalid box handling:** If `w < 0` or `x_center > 1.0`, log error and drop the box.

## 4. PHASH DUPLICATE DETECTOR
**Design:** `scripts/find_duplicates.py`
**Behavior:**
- Calculates exact byte duplicates via SHA-256 (fast pass).
- Calculates `imagehash.phash()` for perceptual similarity.
- Compares all pairs (O(N^2) or optimized via VP-tree).
- **Threshold:** Configurable via `--threshold 5`. A distance `< 5` flags a near-duplicate (e.g., slightly cropped or compressed).
- **Output:** Writes a CSV `reports/duplicates.csv` grouping similar images.
- **DO NOT** automatically delete. Human review is required to delete the lower-quality duplicate.

## 5. DATASET VALIDATOR
**Design:** `scripts/validate_dataset.py`
**Behavior:**
- **Checks:**
  - `image_exists`: Every `.txt` has a `.jpg`/`.png`.
  - `label_exists`: Every `.jpg` has a `.txt` (unless explicitly flagged as background).
  - `valid_class_ids`: Class IDs exist in `[0, 1, 2]`.
  - `normalized_coords`: All `x, y, w, h` are between 0.0 and 1.0.
  - `valid_bboxes`: `w > 0` and `h > 0`.
- **Output:** Returns `PASS` or `FAIL` and outputs `reports/validation.json`.

## 6. LEAKAGE DETECTOR
**Design:** `scripts/check_leakage.py`
**Behavior:**
- Analyzes `reports/split_manifest.csv`.
- Ensures that a unique `capture_session_id` or `sequence_id` does NOT appear in more than one split (`train`, `val`, `test`).
- Cross-references `duplicates.csv` to ensure a flagged near-duplicate pair does not have one image in `train` and the other in `val`.
- Any crossover results in a hard `FAIL`.

## 7. GROUP-AWARE SPLITTER
**Design:** `scripts/create_split.py`
**Behavior:**
- Operates on GROUPS, not individual images.
- **Priority:** Groups by `capture_session_id`. If `session_id` is null, falls back to `location_group`.
- Calculates cumulative images per group to hit the target `train` (80%), `val` (20%) distribution.
- Employs a greedy algorithm or knapsack approximation to keep the class balance stable while respecting the hard group boundaries.
- **Output:** Copies files to `images/train`, `images/val` and generates `reports/split_manifest.csv`.

## 8. DATASET STATISTICS
**Design:** `scripts/dataset_stats.py`
**Behavior:**
- Parses final split directories.
- Counts total images, empty background images, total objects per class.
- Calculates class distributions across `train`, `val`, and `test`.
- **Output:** Generates `reports/statistics.json` and `reports/statistics.csv`.

## 9. DATASET REPORT
**Design:** `scripts/generate_report.py`
**Behavior:**
- Aggregates `validation.json`, `leakage.json`, and `statistics.json`.
- Outputs a cleanly formatted HTML or Markdown report (`reports/dataset_report.md`).
- Highlights any `WARNING` (e.g., class 2 has 30% fewer images) or `FAIL` (e.g., split leakage detected).
- This report is required before training authorization.

## 10. DATA.YAML VALIDATOR
**Design:** `scripts/validate_data_yaml.py`
**Behavior:**
- Reads `data.yaml`.
- Checks `train` and `val` path existence.
- Checks `nc == len(names)`.
- Checks `names == ['pothole', 'garbage_pile', 'waterlogging']` exactly, preventing silent class-id drift.

## 11. DATASET MANIFEST
**Structure (`manifest.csv`):**
- `image_id`: Unique UUID or clean filename.
- `source`: e.g., 'RDD2022' or 'Team_Capture'.
- `capture_session_id`: e.g., 'S001_Lucknow'. (Required for custom).
- `class_presence`: e.g., '0,2'.
- `phash`: Perceptual hash string.
- *Omitted:* Do not include precise GPS lat/lng in the public manifest to preserve privacy.

## 12. CLI DESIGN
**Architecture:** `python scripts/...`
**Why:** The simplest mental model for a hackathon/student team. Running `python scripts/validate_dataset.py --dataset ./data` is universally understood without requiring pip-installable module structures (`python -m tools.dataset.validate`). All scripts will use `argparse` for standard `--help` support.

## 13. CONFIGURATION
**File:** `tools/dataset/dataset_config.yaml`
```yaml
classes:
  pothole: 0
  garbage_pile: 1
  waterlogging: 2
split:
  train: 0.8
  val: 0.2
  test: 0.0
thresholds:
  phash_distance: 5
```
This centralizes magic numbers, preventing drift between scripts.

## 14. LOGGING
- Use Python's built-in `logging` module.
- `INFO`: Standard progress (e.g., "Processed 500/1500 images").
- `WARNING`: Recoverable issues (e.g., "Image missing metadata, placing in default group").
- `ERROR`: Hard failures (e.g., "Coordinate > 1.0 found").

## 15. FAILURE SAFETY
- Tools MUST fail safely without modifying raw files.
- `create_split.py` copies files to the new directory; it never moves or deletes the raw sources.
- Silent repairs (like blindly clipping a 1.2 coordinate to 1.0) are FORBIDDEN. The script must log an error so the annotator fixes the root cause.

## 16. TESTING
- Provide `pytest` test cases in `tools/dataset/tests/`.
- **Test:** Convert PascalVOC `(xmin=100, ymin=100, xmax=200, ymax=200)` in a 1000x1000 image to YOLO `(x_center=0.15, y_center=0.15, w=0.1, h=0.1)`.
- **Test:** Verify `check_leakage.py` throws an error when a mock manifest puts `S001` in both Train and Val.

## 17. REPRODUCIBILITY
- The `create_split.py` must accept a `--seed` parameter (default `42`).
- Python's `random.seed(args.seed)` must be set before any shuffling to ensure the exact same train/val split is produced if the script is rerun.

## 18. DATASET VERSIONING
- Format: `v{MAJOR}.{MINOR}` (e.g., `v1.0`).
- Record version in `data.yaml` and `reports/dataset_report.md`.
- Major version increments on class additions. Minor increments on new images or corrected labels.

## 19. PERFORMANCE
- `ImageHash` is fast enough for CPU.
- `multiprocessing.Pool` can be utilized in `find_duplicates.py` and `rdd2022_filter.py` if scaling beyond 10,000 images, allowing execution on standard B.Tech laptops within minutes.

## 20. TRAINING AUTHORIZATION
**Design:** `scripts/authorize_training.py`
This is a strict boolean gate script. It reads the outputs in the `reports/` folder.
**Checks:**
- `validation.json` status == PASS.
- `leakage.json` status == PASS.
- `data_yaml_valid` == True.
If ANY critical check fails, it outputs:
```text
TRAINING NOT AUTHORIZED
Blockers:
- Leakage detected in capture session S004.
```
If passing, it outputs `TRAINING AUTHORIZED`.

## 21. OUTPUT ARTIFACTS
```text
tools/dataset/reports/
├── validation.json
├── duplicates.csv
├── leakage.json
├── statistics.json
├── dataset_report.md
├── split_manifest.csv
└── training_authorization.txt
```

## 22. CODE QUALITY
- **Version:** Python 3.11+
- **Type Hints:** Required for all `src/` functions.
- **Linting:** `flake8` or `ruff` compatibility expected.
- **Dependencies:** Minimal (e.g., `pyyaml`, `imagehash`, `pillow`). No massive heavy frameworks like PyTorch needed for just dataset shuffling.

## 23. SECURITY
- Paths provided via CLI args must use `pathlib` and resolve securely.
- Scripts must strictly use `shutil.copy2` instead of `os.replace` to prevent accidental deletion of precious raw field data.

## 24. EXECUTION PIPELINE
1. Import public datasets (Manual).
2. Record licenses (Manual).
3. `python scripts/rdd2022_filter.py`
4. `python scripts/rdd2022_to_yolo.py`
5. Annotate custom images (Manual).
6. `python scripts/find_duplicates.py`
7. Review duplicates (Manual deletion of bad copies).
8. `python scripts/validate_dataset.py`
9. `python scripts/create_split.py --seed 42`
10. `python scripts/check_leakage.py`
11. `python scripts/dataset_stats.py`
12. `python scripts/validate_data_yaml.py`
13. `python scripts/generate_report.py`
14. Freeze dataset version (Manual).
15. `python scripts/authorize_training.py`
16. ONLY THEN train YOLO11s.

---

## 25. CODEX HANDOFF

# CODEX PHASE 3C DATASET TOOLING IMPLEMENTATION SPECIFICATION

**TASK 1: Core Config and Validation**
- File: `tools/dataset/scripts/validate_dataset.py`
- Inputs: `--dataset-dir`
- Outputs: `reports/validation.json`
- CLI: `python validate_dataset.py --dataset ../civicshield-dataset/`
- Algorithm: Iterate `images/`. For each, check `labels/`. Parse `.txt`. Bound check floats 0.0-1.0.

**TASK 2: RDD2022 Conversion Suite**
- Files: `scripts/rdd2022_filter.py`, `scripts/rdd2022_to_yolo.py`
- Algorithm: XML `ElementTree` parsing, discard non-D40, math transform to normalized YOLO center coordinates.

**TASK 3: Group-Aware Splitter & Leakage Check**
- Files: `scripts/create_split.py`, `scripts/check_leakage.py`
- Algorithm: Read file prefixes (e.g., `LKO_S001`). Hash the prefix string to determine the split reliably, ensuring all `S001` files land in the same bucket. Copy files to train/val. Leakage script verifies disjoint sets.

**TASK 4: Duplicate Detection**
- File: `scripts/find_duplicates.py`
- Dependencies: `imagehash`, `Pillow`
- Algorithm: Compute pHash for all `.jpg`. Compare pairwise. Output CSV of pairs with hamming distance < `config.thresholds.phash_distance`.

**TASK 5: Authorization Gate**
- File: `scripts/authorize_training.py`
- Algorithm: Read all generated JSON reports. Assert all statuses are `PASS`. Print ASCII art PASS/FAIL banner.

*Codex Rule:* Do NOT train models. Implement Python utilities only. Do not auto-delete duplicates; output them to a report.

---

## 26. FINAL DECISION

**DATASET TOOLING STATUS:**
**READY FOR IMPLEMENTATION**

**TRAINING STATUS:**
**NOT AUTHORIZED**
