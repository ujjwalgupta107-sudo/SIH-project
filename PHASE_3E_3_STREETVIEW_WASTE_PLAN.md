# PHASE 3E.3 — STREETVIEW-WASTE DATASET PROCESSING PLAN

## 1. Local Dataset Inspection
**WARNING**: The downloaded dataset files were not found in the local workspace (`C:\Users\Ujjwal\...`). The following assessment and processing plan is based on the official StreetView-Waste dataset specification (WACV 2026). Please ensure the files are placed in `civicshield-dataset/raw/garbage/streetview/` before executing this plan.

## 2. Dataset Specifications
- **Total Images**: 36,478 (Fisheye imagery from 180° vehicle-mounted cameras).
- **Tasks & Annotations**: Contains bounding boxes for containers and **instance segmentation masks** for amorphous, unstructured litter/overflow near containers.
- **Image Format**: Typically JPG/PNG, fisheye perspective.
- **Annotation Format**: Segmentation masks (likely COCO polygons or bitmap masks).

## 3. CivicShield Class Mapping Analysis
**VERIFIED FACT**: The StreetView-Waste dataset specifically targets "amorphous, unstructured litter/overflow near containers."
**GARBAGE_PILE MAPPING: VERIFIED**. Unlike TACO, which focuses on single items, this dataset explicitly annotates aggregated accumulations and overflow waste. This aligns perfectly with CivicShield's definition of `garbage_pile` (aggregated municipal/public garbage accumulation).

## 4. Licensing
**NEEDS REVIEW**: Access to StreetView-Waste is governed by a data license agreement designed for GDPR-compliant academic use. We must verify that our specific use-case and combination with custom Indian datasets complies with this agreement.

## 5. YOLO Conversion Plan (YOLO CONVERSION: POSSIBLE)
Segmentation masks can be deterministically converted into YOLO bounding boxes.
**Steps**:
1. **Mask to Bounding Box**: For each segmentation mask representing "overflow/litter", calculate the `min_x`, `max_x`, `min_y`, and `max_y` coordinates.
2. **Normalization**: Convert absolute coordinates to YOLO's normalized `[center_x, center_y, width, height]` format.
3. **Class Assignment**: Assign all overflow masks to CivicShield Class `1` (`garbage_pile`). Discard container bounding boxes (unless we decide to track them separately).

## 6. Dataset Integration & Limitations
- **Geographic Limitations**: The dataset is European/Western (collected in Portugal/Spain based on UBI affiliation). It is a strong foundation but must still be merged with our Custom Indian Garbage dataset to ensure contextual relevance.
- **Train/Test Leakage Risk**: Because the images are extracted from continuous video sequences on a moving vehicle, adjacent frames will contain the exact same garbage pile from slightly different angles. We **MUST** extract or generate sequence IDs and use a Group-Aware Splitter to ensure sequences are never split across `train` and `val`.

## 7. Next Steps
1. Place the downloaded dataset into `civicshield-dataset/raw/garbage/streetview/`.
2. Verify the data license agreement.
3. Execute a Python script to convert the segmentation masks to YOLO bounding boxes.
4. Run duplicate/sequence detection to prevent leakage.
