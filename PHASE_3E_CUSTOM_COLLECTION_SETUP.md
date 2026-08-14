# PHASE 3E — CUSTOM INDIAN DATASET COLLECTION SETUP

## 1. Current Dataset Status
- **RDD2022**: SUCCESS — pothole data ready for merging
- **Garbage**: CUSTOM COLLECTION REQUIRED
- **Waterlogging**: CUSTOM COLLECTION REQUIRED
- **Final Split**: NOT CREATED
- **YOLO Training**: NOT AUTHORIZED

## 2. Required Custom Classes
1. `garbage_pile`
2. `waterlogging`

## 3. Collection Targets
These are engineering targets for data gathering, NOT accuracy guarantees. Diversity over repetitive photography is highly recommended.
- **`garbage_pile`**: 300–500 images
- **`waterlogging`**: 300–500 images

## 4. Session ID Format
Each session must represent one physical collection session/location context. Images from the same session must never be split across train and validation later.
- **Format**: `[CITY]_[CLASS]_[SESSION_NUMBER]`
- **Examples**: `LUCKNOW_GARBAGE_001`, `LUCKNOW_WATERLOGGING_001`

## 5. Metadata Schema
Every image must be accompanied by metadata in `civicshield-dataset/metadata/collection_template.csv`. Required fields:
- `image_id`
- `capture_session_id`
- `sequence_id`
- `class`
- `city`
- `area_type`
- `weather`
- `time_of_day`
- `camera_source`
- `capture_timestamp`
*(Precise GPS coordinates are NOT required in public metadata to avoid storing unnecessary personal information).*

## 6. Garbage Collection Strategy
Capture variations in small/medium/large piles, roadside piles, overflowing bins, market/residential areas, mixed waste, occluded piles, camera distances, viewpoints, and lighting.

## 7. Waterlogging Collection Strategy
Capture variations in shallow/deep water, road intersections, residential/major roads, drainage overflow, standing water, vehicles near water, viewpoints, lighting, and weather conditions. The dataset must represent realistic Indian urban environments.

## 8. Privacy Workflow
1. **RAW IMAGE** captured
2. **Privacy Review** to identify faces, vehicle number plates, children, private/sensitive information
3. **Redaction if required** (blurring sensitive areas)
4. **Approved Working Image** generated
5. **Metadata** filled in the tracking template
6. **Annotation** phase begins
*(Raw originals must be preserved separately. Do not automatically publish sensitive images).*

## 9. Image Quality Rules
Images will be rejected if they are: severely blurred, completely dark, have unusable framing, are duplicates/near duplicates, lack a visible target object, have a target too small to annotate reliably, or present a privacy issue that cannot be safely handled. Do not reject legitimate difficult examples just because they are challenging for the model.

## 10. Annotation Status
**NOT STARTED.** Images must not be annotated automatically or via LLMs. Annotation will happen only after collection and privacy review are complete.

## 11. Exact Manual Actions Required
- Review `civicshield-dataset/metadata/CUSTOM_COLLECTION_GUIDE.md` with the field team.
- Collect the target 300-500 images per class across Indian urban environments.
- Fill in `civicshield-dataset/metadata/collection_template.csv` for the gathered images.
- Execute the Privacy Workflow on raw images before placing them in the working set.
- Annotate the approved images manually after privacy clearance.

==================================================
FINAL STATUS
==================================================
CUSTOM COLLECTION SETUP: READY
GARBAGE COLLECTION: REQUIRED
WATERLOGGING COLLECTION: REQUIRED
ANNOTATION: NOT STARTED
FINAL SPLIT: NOT CREATED
YOLO TRAINING: NOT AUTHORIZED
