# PHASE 3D.3B — WATERLOGGING DATASET DEDUPLICATION

## 1. Duplicate Classification
**VERIFIED FACT**: Duplicate pairs identified from the pHash analysis of the 5,738 valid waterlogging images were classified into two categories:
- **EXACT DUPLICATES**: Pairs with a pHash distance of `0`. These are identical copies originating from the three identically packaged nested ZIPs in the source data.
- **NEAR DUPLICATES**: Pairs with a non-zero distance (e.g., `4`). These represent continuous capture sequences (e.g., burst photography or adjacent video frames).

## 2. Exact Duplicates Handling
**AUTOMATED DEDUPLICATION**: 
- Exact duplicates were computationally resolved into 1,764 canonical images using connected-component graph analysis.
- 3,974 redundant duplicate images and labels were safely stripped out of the new candidate set.
- An exact record mapping every removed duplicate to its canonical preserved file was generated: `civicshield-dataset/processed/waterlogging_unique/exact_duplicates_manifest.json`.
- **REMAINING RISK**: None. This is a 100% mathematically lossless deduplication.

## 3. Near-Duplicates Handling
**MANUAL REVIEW REQUIRED**:
- 2 near-duplicate pairs (representing distinct temporal frames) were identified among the canonical images.
- Following strict rules, these were **NOT** automatically deleted.
- A review manifest was created at `civicshield-dataset/processed/waterlogging_unique/near_duplicates_review.json` recommending manual review.

## 4. Capture-Sequence Leakage Prevention
**ENGINEERING DECISION**:
- To prevent data leakage across `train` and `val` splits, near-duplicates were clustered into 2 distinct capture sequence groups.
- This grouping metadata was saved to `civicshield-dataset/processed/waterlogging_unique/sequence_groups.json`. 
- The final group-aware splitter MUST consume this JSON to guarantee these grouped frames are pushed into the exact same dataset split.

## 5. Revalidation
**VERIFIED FACT**: 
- The deduplicated candidate directory (`civicshield-dataset/processed/waterlogging_unique/`) was run through `validate_dataset.py`.
- Validation **PASSED** with strictly 0 errors. No missing label-image mismatch was caused by the deduplication logic.

## 6. Deduplication Statistics
- **Source Image Count (Pre-Dedup)**: 5,738
- **Exact Duplicate Sets**: 1,764
- **Exact Duplicates Removed**: 3,974
- **Near-Duplicate Pairs**: 2
- **Capture Groups Identified**: 2
- **Final Unique Candidate Count**: 1,764
- **Annotation/Object Count**: 17,860 bounding boxes
- **Validation Errors**: 0

==================================================
FINAL STATUS
==================================================
WATER DATASET: READY
VALIDATION: PASSED
EXACT DUPLICATES: 3974
NEAR DUPLICATES: 2
MANUAL REVIEW: REQUIRED
UNIQUE CANDIDATE DATASET: READY
FINAL SPLIT: NOT CREATED
YOLO TRAINING: NOT AUTHORIZED
