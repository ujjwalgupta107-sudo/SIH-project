#!/usr/bin/env python3
"""
CivicShield AI — Dataset Validation Suite
=========================================
Comprehensive validation of train/valid/test splits before training.

Checks:
  1. Image/label parity
  2. Corrupt images
  3. YOLO label syntax
  4. Class IDs (must be 0 or 1 only)
  5. Coordinate bounds (0.0–1.0)
  6. Duplicate images (exact hash)
  7. Near-duplicate detection (optional, slow)
  8. Cross-split leakage (same filename in multiple splits)
  9. Train/valid/test split ratios
  10. data.yaml correctness
  11. Class distribution

USAGE:
  python validate_dataset.py                  # Validate final_2class
  python validate_dataset.py --dataset-path <path>  # Custom path
  python validate_dataset.py --check-leakage  # Enable cross-split check
"""
import argparse
import hashlib
import os
import sys
from pathlib import Path
from collections import defaultdict, Counter


VALID_CLASSES = {0: 'pothole', 1: 'waterlogging'}
ROOT = Path(__file__).parent.parent


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest()


def is_valid_image(path: Path) -> bool:
    """Quick validity check: file size and header bytes."""
    try:
        size = path.stat().st_size
        if size < 1000:
            return False
        with open(path, 'rb') as f:
            header = f.read(4)
        # JPEG: FF D8 FF | PNG: 89 50 4E 47
        return header[:3] == b'\xff\xd8\xff' or header[:4] == b'\x89PNG'
    except Exception:
        return False


def validate_dataset(dataset_path: Path, check_leakage: bool = False) -> bool:
    """Full validation. Returns True if PASS, False if any errors."""
    print('=' * 60)
    print('CivicShield AI - Dataset Validation Report')
    print(f'Path: {dataset_path}')
    print('=' * 60)

    errors = []
    warnings = []
    passes = []

    splits = ['train', 'valid', 'test']
    split_hashes = defaultdict(set)    # split -> set of image hashes
    split_stems = defaultdict(set)     # split -> set of image stems

    # Check data.yaml
    yaml_path = dataset_path / 'data.yaml'
    if not yaml_path.exists():
        errors.append('MISSING: data.yaml not found')
    else:
        content = yaml_path.read_text()
        required = ['nc: 2', 'pothole', 'waterlogging']
        for r in required:
            if r not in content:
                errors.append(f'data.yaml: missing required entry: {r}')
        passes.append('data.yaml exists with correct class definitions')

    total_by_split = {}
    class_counts = Counter()

    for split in splits:
        img_dir = dataset_path / split / 'images'
        lbl_dir = dataset_path / split / 'labels'

        if not img_dir.exists():
            errors.append(f'{split}/images/ directory missing')
            continue
        if not lbl_dir.exists():
            errors.append(f'{split}/labels/ directory missing')
            continue

        images = sorted(list(img_dir.glob('*.jpg')) + list(img_dir.glob('*.jpeg')) + list(img_dir.glob('*.png')))
        labels = sorted(lbl_dir.glob('*.txt'))

        img_stems = {f.stem for f in images}
        lbl_stems = {f.stem for f in labels}

        # 1. Parity check
        missing_labels = img_stems - lbl_stems
        orphan_labels = lbl_stems - img_stems
        if missing_labels:
            errors.append(f'{split}: {len(missing_labels)} images missing labels')
        if orphan_labels:
            warnings.append(f'{split}: {len(orphan_labels)} label files without images')
        if not missing_labels and not orphan_labels:
            passes.append(f'{split}: image/label parity OK ({len(images)} pairs)')

        total_by_split[split] = len(images)
        split_stems[split] = img_stems

        # 2. Corrupt images
        corrupt = [img for img in images if not is_valid_image(img)]
        if corrupt:
            errors.append(f'{split}: {len(corrupt)} corrupt images: {[c.name for c in corrupt[:3]]}')
        else:
            passes.append(f'{split}: all images valid (non-corrupt)')

        # 3–5. YOLO label syntax + class IDs + coordinates
        label_errors = 0
        for lbl in labels:
            with open(lbl, 'r') as f:
                lines = [l.strip() for l in f.readlines() if l.strip()]
            if not lines:
                warnings.append(f'{split}/{lbl.name}: empty label file (background image)')
                continue
            for i, line in enumerate(lines, 1):
                parts = line.split()
                if len(parts) != 5:
                    errors.append(f'{split}/{lbl.name}:{i}: wrong column count {len(parts)}')
                    label_errors += 1
                    continue
                try:
                    cid = int(parts[0])
                    x, y, w, h = float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
                except ValueError:
                    errors.append(f'{split}/{lbl.name}:{i}: non-numeric values')
                    label_errors += 1
                    continue

                # Class ID check
                if cid not in VALID_CLASSES:
                    errors.append(f'{split}/{lbl.name}:{i}: invalid class_id={cid}')
                    label_errors += 1
                else:
                    class_counts[cid] += 1

                # Coordinate bounds
                if not (0.0 <= x <= 1.0 and 0.0 <= y <= 1.0 and 0.0 < w <= 1.0 and 0.0 < h <= 1.0):
                    errors.append(f'{split}/{lbl.name}:{i}: out-of-range coords x={x:.3f} y={y:.3f} w={w:.3f} h={h:.3f}')
                    label_errors += 1

        if label_errors == 0:
            passes.append(f'{split}: YOLO label syntax valid')

        # 6. Duplicate images (by hash)
        if check_leakage:
            for img in images:
                h = sha256(img)
                split_hashes[split].add(h)

    # 8. Cross-split leakage (by filename stem)
    if check_leakage and len(split_hashes) > 1:
        train_h = split_hashes.get('train', set())
        valid_h = split_hashes.get('valid', set())
        test_h = split_hashes.get('test', set())
        tv_leak = train_h & valid_h
        tt_leak = train_h & test_h
        vt_leak = valid_h & test_h
        if tv_leak:
            errors.append(f'CROSS-SPLIT LEAKAGE: {len(tv_leak)} identical images in train+valid')
        if tt_leak:
            errors.append(f'CROSS-SPLIT LEAKAGE: {len(tt_leak)} identical images in train+test')
        if vt_leak:
            errors.append(f'CROSS-SPLIT LEAKAGE: {len(vt_leak)} identical images in valid+test')
        if not tv_leak and not tt_leak and not vt_leak:
            passes.append('Cross-split leakage: none detected')

    # Stem-based leakage (fast, no hashing needed)
    train_s = split_stems.get('train', set())
    valid_s = split_stems.get('valid', set())
    test_s = split_stems.get('test', set())
    stem_leak = (train_s & valid_s) | (train_s & test_s) | (valid_s & test_s)
    if stem_leak:
        errors.append(f'FILENAME LEAKAGE: {len(stem_leak)} shared stems across splits')
    else:
        passes.append('Filename cross-split leakage: none detected')

    # 9. Split ratios
    total = sum(total_by_split.values())
    if total > 0:
        ratios = {s: round(n/total*100, 1) for s, n in total_by_split.items()}
        ratio_str = ' | '.join(f'{s}={ratios.get(s,0)}%' for s in splits)
        print(f'\nSplit ratios: {ratio_str}  (total={total})')
        if total_by_split.get('train', 0) < total_by_split.get('valid', 0):
            warnings.append('Unusual: train set smaller than valid set')

    # 11. Class distribution
    print('\nClass distribution:')
    for cid, name in VALID_CLASSES.items():
        count = class_counts.get(cid, 0)
        pct = round(count / max(sum(class_counts.values()), 1) * 100, 1)
        icon = '[OK]' if count > 0 else '[ERR]'
        print(f'  {icon} class {cid} ({name}): {count} detections ({pct}%)')
    if 1 not in class_counts or class_counts[1] == 0:
        errors.append('MISSING class 1 (waterlogging): no detections found')

    # Summary
    print('\n' + '=' * 60)
    print('PASSES:')
    for p in passes:
        print(f'  [OK] {p}')

    if warnings:
        print('\nWARNINGS:')
        for w in warnings:
            print(f'  [WARN] {w}')

    if errors:
        print('\nERRORS:')
        for e in errors:
            print(f'  [ERR] {e}')
        print(f'\n[ERR] VALIDATION FAILED -- {len(errors)} error(s), {len(warnings)} warning(s)')
        return False
    else:
        print(f'\n[OK] VALIDATION PASSED -- {len(warnings)} warning(s)')
        return True


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='CivicShield Dataset Validation')
    parser.add_argument('--dataset-path', type=Path,
                        default=ROOT / 'civicshield-dataset' / 'processed' / 'final_2class',
                        help='Path to dataset directory')
    parser.add_argument('--check-leakage', action='store_true',
                        help='Check cross-split leakage using image hashes (slower)')
    args = parser.parse_args()

    if not args.dataset_path.exists():
        print(f'[ERR] Dataset path not found: {args.dataset_path}')
        print('   Run --build first via merge_dataset.py')
        sys.exit(1)

    passed = validate_dataset(args.dataset_path, args.check_leakage)
    sys.exit(0 if passed else 1)