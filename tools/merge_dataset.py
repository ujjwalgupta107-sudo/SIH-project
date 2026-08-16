#!/usr/bin/env python3
"""
CivicShield AI — Final 2-Class Dataset Pipeline
===============================================
Merges pothole + waterlogging datasets into a single
train/valid/test split ready for YOLOv8n training.

Class mapping (FINAL — do NOT change):
  0 = pothole
  1 = waterlogging

USAGE:
  # Validate only (no files copied):
  python merge_dataset.py --validate-only

  # Build dataset:
  python merge_dataset.py --build

  # Check dataset status:
  python merge_dataset.py --status
"""
import argparse
import hashlib
import os
import random
import shutil
import sys
from pathlib import Path
from typing import NamedTuple


# ── Paths ─────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent.parent
PROCESSED = ROOT / 'civicshield-dataset' / 'processed'

# Source datasets with their ORIGINAL class IDs (for validation)
SOURCES_ORIGINAL = {
    'pothole':      (PROCESSED / 'pothole_yolo' / 'images',      PROCESSED / 'pothole_yolo' / 'labels',      0),
    'waterlogging': (PROCESSED / 'waterlogging_unique' / 'images', PROCESSED / 'waterlogging_unique' / 'labels', 2),
}

# Target class IDs for the final dataset (for building)
TARGET_CLASS_IDS = {
    'pothole': 0,
    'waterlogging': 1,
}

OUTPUT = PROCESSED / 'final_2class'

SPLIT_RATIOS = {'train': 0.75, 'valid': 0.15, 'test': 0.10}
SEED = 42


class SourceStats(NamedTuple):
    name: str
    class_id: int
    images: int
    labels: int
    missing_labels: int
    corrupt: int


def count_source(name: str, img_dir: Path, lbl_dir: Path, class_id: int) -> SourceStats:
    images = sorted(img_dir.rglob('*.jpg')) + sorted(img_dir.rglob('*.jpeg')) + sorted(img_dir.rglob('*.png'))
    labels = set(f.stem for f in lbl_dir.rglob('*.txt')) if lbl_dir.exists() else set()
    missing = sum(1 for img in images if img.stem not in labels)
    corrupt = 0
    for img in images[:10]:  # spot-check first 10
        try:
            if img.stat().st_size < 1000:
                corrupt += 1
        except Exception:
            corrupt += 1
    return SourceStats(name, class_id, len(images), len(labels), missing, corrupt)


def status():
    """Print current dataset status without modifying anything."""
    print('=' * 60)
    print('CivicShield AI - Dataset Status Report')
    print('=' * 60)
    ready = True
    for name, (img_dir, lbl_dir, class_id) in SOURCES_ORIGINAL.items():
        s = count_source(name, img_dir, lbl_dir, class_id)
        ok = s.images > 0 and s.labels == s.images and s.missing_labels == 0
        icon = '[OK]' if ok else ('[WARN]' if s.images > 0 else '[ERR]')
        print(f'\n{icon} {name.upper()} (original class_id={class_id}, target class_id={TARGET_CLASS_IDS[name]})')
        print(f'   Images:         {s.images}')
        print(f'   Labels:         {s.labels}')
        print(f'   Missing labels: {s.missing_labels}')
        print(f'   Corrupt (spot): {s.corrupt}')
        if not ok:
            ready = False
    print()
    if ready:
        print('[OK] ALL DATASETS READY -- safe to run --build')
    else:
        print('[ERR] NOT READY')
    print('=' * 60)
    return ready


def validate_labels(lbl_dir: Path, class_id: int, name: str) -> list[str]:
    """Validate all YOLO labels in a directory. Returns list of errors."""
    errors = []
    if not lbl_dir.exists():
        errors.append(f'{name}: labels directory missing: {lbl_dir}')
        return errors
    for lbl in lbl_dir.rglob('*.txt'):
        with open(lbl, 'r') as f:
            lines = f.read().strip().splitlines()
        for i, line in enumerate(lines, 1):
            parts = line.split()
            if len(parts) != 5:
                errors.append(f'{name}/{lbl.name}:{i}: expected 5 values, got {len(parts)}')
                continue
            try:
                cid = int(parts[0])
                x, y, w, h = float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
            except ValueError:
                errors.append(f'{name}/{lbl.name}:{i}: non-numeric values')
                continue
            if cid != class_id:
                errors.append(f'{name}/{lbl.name}:{i}: wrong class_id={cid}, expected {class_id}')
            if not (0 <= x <= 1 and 0 <= y <= 1 and 0 < w <= 1 and 0 < h <= 1):
                errors.append(f'{name}/{lbl.name}:{i}: coords out of range [{x},{y},{w},{h}]')
    return errors


def remap_label_file(src_lbl: Path, dst_lbl: Path, target_class_id: int) -> bool:
    """Read source label, remap class_id to target_class_id, write to destination."""
    try:
        with open(src_lbl, 'r') as f:
            lines = f.read().strip().splitlines()
        if not lines:
            # Empty label file (background image) - copy as-is
            shutil.copy2(src_lbl, dst_lbl)
            return True
        new_lines = []
        for line in lines:
            parts = line.split()
            if len(parts) != 5:
                # Invalid line - copy as-is to preserve for debugging
                new_lines.append(line)
                continue
            # Replace class_id with target
            parts[0] = str(target_class_id)
            new_lines.append(' '.join(parts))
        with open(dst_lbl, 'w') as f:
            f.write('\n'.join(new_lines))
        return True
    except Exception as e:
        print(f'   [ERR] Failed to remap {src_lbl.name}: {e}')
        return False


def build():
    """Build the final 2-class dataset split."""
    print('=' * 60)
    print('CivicShield AI — Building Final 2-Class Dataset')
    print('=' * 60)

    # Validate label syntax (using original class IDs)
    print('\n[...] Validating label syntax...')
    all_errors = []
    for name, (img_dir, lbl_dir, class_id) in SOURCES_ORIGINAL.items():
        errors = validate_labels(lbl_dir, class_id, name)
        all_errors.extend(errors)
        if errors:
            for e in errors[:5]:
                print(f'   [ERR] {e}')
    if all_errors:
        print(f'\n[ERR] {len(all_errors)} label errors found. Fix before building.')
        sys.exit(1)

    # Collect all (image, label) pairs per class
    print('\n[...] Collecting samples...')
    all_samples = []  # (img_path, lbl_path, class_name)
    for name, (img_dir, lbl_dir, orig_class_id) in SOURCES_ORIGINAL.items():
        images = sorted(img_dir.rglob('*.jpg')) + sorted(img_dir.rglob('*.jpeg')) + sorted(img_dir.rglob('*.png'))
        labels = list(lbl_dir.rglob('*.txt')) if lbl_dir.exists() else []
        label_map = {lbl.stem: lbl for lbl in labels}
        
        for img in images:
            if img.stem in label_map:
                all_samples.append((img, label_map[img.stem], name))

    print(f'   Total paired samples: {len(all_samples)}')
    by_class = {}
    for _, _, name in all_samples:
        by_class[name] = by_class.get(name, 0) + 1
    for name, count in by_class.items():
        print(f'   {name}: {count}')

    # Stratified split
    random.seed(SEED)
    random.shuffle(all_samples)
    splits = {'train': [], 'valid': [], 'test': []}
    n = len(all_samples)
    train_end = int(n * SPLIT_RATIOS['train'])
    valid_end = train_end + int(n * SPLIT_RATIOS['valid'])
    splits['train'] = all_samples[:train_end]
    splits['valid'] = all_samples[train_end:valid_end]
    splits['test'] = all_samples[valid_end:]

    print(f'\n   train: {len(splits["train"])} | valid: {len(splits["valid"])} | test: {len(splits["test"])}')

    # Create output directory structure
    for split in splits:
        (OUTPUT / split / 'images').mkdir(parents=True, exist_ok=True)
        (OUTPUT / split / 'labels').mkdir(parents=True, exist_ok=True)

    # Copy files with label remapping
    print('\n[...] Copying files and remapping labels...')
    for split, samples in splits.items():
        for img, lbl, name in samples:
            target_class_id = TARGET_CLASS_IDS[name]
            # Copy image as-is
            shutil.copy2(img, OUTPUT / split / 'images' / img.name)
            # Remap and copy label
            remap_label_file(lbl, OUTPUT / split / 'labels' / lbl.name, target_class_id)
        print(f'   {split}: {len(samples)} samples copied')

    # Write data.yaml
    data_yaml = OUTPUT / 'data.yaml'
    with open(data_yaml, 'w') as f:
        f.write(f"""# CivicShield AI -- Final 2-Class Dataset
# Generated by merge_dataset.py
# DO NOT edit class names or IDs manually

path: {OUTPUT.absolute().as_posix()}
train: train/images
val: valid/images
test: test/images

nc: 2
names:
  0: pothole
  1: waterlogging
""")

    print(f'\n[OK] data.yaml written to: {data_yaml}')
    print(f'[OK] Final 2-class dataset built at: {OUTPUT}')
    print(f'\nNext step: python backend/ml/train_2class.py')
    print('=' * 60)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='CivicShield Dataset Pipeline')
    parser.add_argument('--status', action='store_true', help='Show dataset status (no changes)')
    parser.add_argument('--validate-only', action='store_true', help='Validate labels without building')
    parser.add_argument('--build', action='store_true', help='Build final_2class dataset')
    args = parser.parse_args()

    if args.status or (not args.validate_only and not args.build):
        status()
    elif args.validate_only:
        print('Validating label syntax...')
        all_errors = []
        for name, (img_dir, lbl_dir, class_id) in SOURCES_ORIGINAL.items():
            errors = validate_labels(lbl_dir, class_id, name)
            all_errors.extend(errors)
            print(f'  {name}: {len(list(lbl_dir.rglob("*.txt")) if lbl_dir.exists() else [])} labels, {len(errors)} errors')
        if all_errors:
            for e in all_errors[:20]:
                print(f'  ERROR: {e}')
            sys.exit(1)
        else:
            print('[OK] All labels valid')
    elif args.build:
        build()