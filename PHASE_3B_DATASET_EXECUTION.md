# CIVICSHIELD AI — PHASE 3B DATASET EXECUTION GUIDE

## 1. APPROVED DATASETS

| Dataset | Official URL | License | CivicShield classes obtained | Images needed | Download method | Required preprocessing | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RDD2022 (India)** | [figshare.com/articles/dataset/RDD2022/21362881](https://figshare.com/articles/dataset/RDD2022/21362881) | CC BY 4.0 | `pothole` | ~1,500 | Direct ZIP download (India subset) | Extract XML, filter D40, convert to YOLO | **APPROVED** |
| **TACO** | [github.com/pedropro/TACO](https://github.com/pedropro/TACO) | MIT (Code) / CC (Images) | `garbage_pile` | ~300-500 | Python script (`download.py`) | Map COCO JSON to YOLO, filter piles | **APPROVED** |
| **Custom Indian Field Data** | Team collected | Open | `garbage_pile`, `waterlogging` | ~600+ | Team smartphone capture | Resize, Roboflow upload, annotate | **APPROVED** |

## 2. RDD2022

**Execution Steps:**
1. **Source:** Download the `India` specific zip files from the official RDD2022 Figshare repository.
2. **Classes to Retain:** ONLY `D40` (Pothole). 
3. **Classes to Discard:** `D00`, `D10`, `D20`, `D43`, `D44`.
4. **Filter & Convert:** Write a Python script to parse the `xml` (PASCAL VOC) files in the `annotations` folder.
   - If an XML file has no `D40` objects, discard the image and the XML.
   - For every `D40` bounding box, extract `(xmin, ymin, xmax, ymax)` and `width`, `height`.
   - Calculate YOLO coordinates: `x_center = ((xmin + xmax) / 2) / width`, `y_center = ((ymin + ymax) / 2) / height`.
   - Save as `.txt` files with the same name as the image.

**Mapping:**
- `D40` → `pothole` → `0`

## 3. TACO / GARBAGE

**Execution Steps:**
TACO contains 60 granular litter classes. Do NOT map individual cigarette butts or single wrappers.
1. Download TACO dataset using their official script.
2. Parse `annotations.json` (COCO format).
3. **Filter:** Keep bounding boxes belonging to `Trash bag`, `Garbage bag`, or overlapping clusters of `Plastic`, `Carton`, `Metal`.
4. **Discard:** Individual isolated small litter (e.g., `Bottle cap`, `Pop tab`).
5. **Mapping:** Convert COCO `[x_min, y_min, width, height]` to YOLO format. Map retained bounding boxes to CivicShield class `1`.
6. **Custom Dependency:** TACO is highly Western-centric. It is NOT sufficient alone. You MUST collect custom Indian street garbage.

## 4. CUSTOM IMAGE COLLECTION

**Checklist & Targets:**
- **`pothole` (Class 0):** Min: 200 | Rec: 500 (Focus on pedestrian/rider angles to supplement RDD2022 dashcams).
- **`garbage_pile` (Class 1):** Min: 300 | Rec: 600.
- **`waterlogging` (Class 2):** Min: 300 | Rec: 600.

**Diversity Checklist:**
- [ ] **Distance:** 1m, 3m, 5m away.
- [ ] **Angle:** Eye-level, downward 45°, side-angle.
- [ ] **Lighting:** Bright sun, overcast, dusk, night (under streetlights).
- [ ] **Background:** Auto-rickshaws, cycles, Indian storefronts, municipal bins.

## 5. INDIAN CONTEXT

**Collect:**
- Dense residential *gallis* (narrow lanes) with interlocking bricks or degraded tarmac.
- Overflowing green/blue municipal bins with scattered waste around the base.
- Monsoon puddles spanning across potholes or blocked roadside drains.

**Do NOT Collect:**
- Perfectly clean foreign highways.
- 100 burst-mode photos of the exact same pothole from the exact same angle. (This causes overfitting).

## 6. CAPTURE SESSION PROTOCOL

**Naming Convention:**
Format: `CITY_CLASS_SESSIONID_DATE`
Example: `LKO_GARBAGE_S001_20260814`

**Protocol:**
When you go out to collect photos, group them into a single folder named after the session.
- **Why this prevents leakage:** If you take 5 photos of a garbage dump in Aminabad, they must all stay in `S001`. Later, the split script will move the *entire* `S001` folder to either `train` or `val`. This guarantees the model doesn't see Aminabad Dump Photo 1 in training and Aminabad Dump Photo 2 in validation.

## 7. VIDEO COLLECTION

**Protocol:**
If you record a 30-second video of a flooded street:
1. **Video ID:** Assign a unique ID (e.g., `LKO_WATER_V001`).
2. **Frame Spacing:** Extract exactly 1 frame per second using FFmpeg:
   `ffmpeg -i video.mp4 -vf fps=1 LKO_WATER_V001_frame_%04d.jpg`
3. **Duplicate Prevention:** Manually delete frames where you stood perfectly still (resulting in identical images).
4. **Leakage Rule:** All frames from `V001` must go to the SAME split (train or val).

## 8. DATASET DIRECTORY

Create this exact structure on your local drive before starting:
```text
civicshield-dataset/
├── raw/
│   ├── rdd2022/
│   ├── taco/
│   └── custom_sessions/
├── processed/
├── images/
│   ├── train/
│   ├── val/
├── labels/
│   ├── train/
│   ├── val/
└── data.yaml
```

## 9. ANNOTATION TOOL

**Verified Recommendation: Roboflow**
1. Create a free public workspace on Roboflow.
2. Create a new Object Detection project: `CivicShield-YOLO11`.
3. Define EXACTLY 3 classes: `pothole`, `garbage_pile`, `waterlogging`.
4. Upload images from your `raw/custom_sessions/` folder.
5. Use the bounding box tool to draw tight boxes around the objects.
6. When done, generate a dataset version (no augmentation step needed yet).
7. Export format: **YOLOv8** (YOLOv8 and YOLO11 share the same PyTorch txt format).

## 10. ANNOTATION RULES

**POTHOLE (0):**
- **Annotate:** The structural depression in the road. Draw the box tightly around the broken edges.
- **Do not annotate:** Flat road patches (repairs), shadows, or manhole covers.
- **Small objects:** Ignore if < 15x15 pixels.

**GARBAGE_PILE (1):**
- **Annotate:** Contiguous piles of solid waste. If a bin is overflowing, box the bin and the spill as one unit.
- **Do not annotate:** Single wrappers, isolated bottles.

**WATERLOGGING (2):**
- **Annotate:** The entire contiguous body of standing water. 
- **Do not annotate:** Damp/dark asphalt that has no standing depth.

## 11. ANNOTATION QA

**Manual Review Process:**
1. **Annotator (Student A):** Draws boxes in Roboflow.
2. **Self-Check:** Quickly scrolls through the batch to catch obvious mistakes (e.g., boxing a shadow).
3. **Reviewer (Student B):** Opens Roboflow, clicks 'Review', and checks 20% of the images.
4. **Correction:** If >10% of the sampled images have bad boxes, Student B rejects the batch. Student A fixes them.
5. **Approval:** Batch is locked and added to the dataset.

## 12. DUPLICATE DETECTION

**Tool:** Python + `ImageHash` library (pHash).
**Workflow:**
1. Write a script that loads all images in `raw/custom_sessions/`.
2. Compute the perceptual hash for each image: `hash = imagehash.phash(Image.open(filepath))`
3. Compare hashes: If the Hamming distance between two images is `< 5`, they are near-duplicates.
4. **Manual Review:** The script moves flagged pairs into a `review/` folder. You manually delete the blurrier or lower-resolution copy.

## 13. DATA LEAKAGE CHECK

**Procedure:**
1. Do not use Roboflow's random auto-split feature for custom data if you took burst photos.
2. Write a Python split script.
3. The script reads the filename prefix (e.g., `LKO_GARBAGE_S001`).
4. The script randomly assigns `S001` to `train` or `val`.
5. It then moves ALL images starting with `LKO_GARBAGE_S001` to that split.

## 14. TRAIN/VAL/TEST

**Split Ratios:**
- **Train:** 80%
- **Validation:** 20%
- **Test:** 0% (Defer test set for SIH MVP; use validation metrics as your benchmark to save data).

**Execution:**
Group by `session_id` as explained in Section 13. Never split a session.

## 15. CLASS BALANCE

**Trigger for Collection:**
- After merging RDD2022, TACO, and Custom, run a count.
- If you have 1,500 potholes but only 200 waterlogging images, you are severely imbalanced.
- **Action:** Cap the RDD2022 ingestion to ~1,000 images randomly selected. Send the team out to collect 300 more waterlogging photos. Do not copy/paste waterlogging photos to fake balance.

## 16. YOLO FORMAT

**Verified Format:**
- You will have `image_01.jpg` and `image_01.txt` in the same directory.
- `image_01.txt` contains one line per bounding box:
  `class_id x_center y_center width height`
- Coordinates must be normalized floats (0.0 to 1.0).
- Example representing a pothole in the center of the image taking up half the width/height:
  `0 0.500000 0.500000 0.500000 0.500000`

## 17. DATA.YAML

Create this exact file in the root of your dataset directory:
```yaml
train: ../images/train
val: ../images/val

nc: 3
names: ['pothole', 'garbage_pile', 'waterlogging']
```
*(Ensure `0=pothole`, `1=garbage_pile`, `2=waterlogging` strictly aligns with your `.txt` files).*

## 18. DATASET VALIDATION

Before zipping the dataset for Colab, run a python script to check:
1. Every `.jpg` in `images/` has a `.txt` in `labels/`.
2. No `.txt` contains a class ID other than `0, 1, 2`.
3. No coordinate is `< 0.0` or `> 1.0`.
4. The `data.yaml` paths correctly resolve.
If the script prints "Pass", you may proceed.

## 19. DATASET REPORT

Generate a simple markdown or text report (via Python script) outputting:
- Total images: (e.g., 2,500)
- Train images: 2,000
- Validation images: 500
- Potholes: 1,500
- Garbage piles: 600
- Waterlogging: 400
Save this as `dataset_report_v1.txt`.

## 20. LICENSING MANIFEST

Keep a `licenses.md` in your dataset root:
- **Source:** RDD2022 India
- **URL:** [Figshare Link]
- **License:** CC BY 4.0
- **Allowed:** Commercial, Modification. (Attribution required in SIH presentation).

## 21. PRIVACY REVIEW

**Manual Action Required:**
Before uploading custom images to Roboflow, review them visually. If a person's face is highly visible and the primary focus, or a vehicle's license plate is completely legible in the foreground, use a basic photo editor to blur it. 

## 22. STORAGE

**Recommendation:** **Google Drive.**
Zip the final, validated `civicshield-dataset/` folder and upload it to Google Drive.
- **Why:** Google Colab can mount Google Drive natively in seconds (`from google.colab import drive; drive.mount('/content/drive')`), allowing lightning-fast data transfer to the GPU instance. Never commit this zip to GitHub.

## 23. EXACT EXECUTION CHECKLIST

Follow this strictly:
1. [ ] Create local dataset directory structure.
2. [ ] Download RDD2022 India subset. Filter to keep only D40.
3. [ ] Download TACO. Filter to keep garbage piles.
4. [ ] Collect custom Indian field photos (grouped in session folders).
5. [ ] Run pHash duplicate detection script on custom photos. Delete duplicates.
6. [ ] Upload custom photos to Roboflow project.
7. [ ] Annotate custom photos manually. QA check them.
8. [ ] Export YOLO format from Roboflow.
9. [ ] Write/Run a Python script to perform the Session-Aware Split (80/20).
10. [ ] Merge the Roboflow export, converted RDD2022, and converted TACO into the final `images/train`, `images/val`, `labels/train`, `labels/val` folders.
11. [ ] Create `data.yaml`.
12. [ ] Run final Python YOLO coordinate/integrity validation script.
13. [ ] Generate dataset report.
14. [ ] Zip folder to `civicshield-dataset-v1.zip`. Upload to Google Drive.
15. [ ] **ONLY THEN** open Colab to train YOLO.

## 24. COMMON MISTAKES

- **FATAL:** Using `sklearn.model_selection.train_test_split` on individual images instead of sessions. (Causes massive data leakage).
- **FATAL:** Forgetting to normalize bounding box coordinates to 0.0-1.0. (YOLO will crash or learn nothing).
- **FATAL:** Uploading the dataset zip to the GitHub repository. (Bloats the repo, breaks git, slows down deployment).
- **DANGEROUS:** Annotating shadows as potholes.
- **DANGEROUS:** Training before running the validation script to check for missing `.txt` files.

## 25. FINAL TRAINING GATE

# YOLO TRAINING AUTHORIZATION

Training is allowed **only** if:

- [ ] approved datasets downloaded
- [ ] licenses recorded
- [ ] custom images collected
- [ ] annotation complete
- [ ] annotation QA passed
- [ ] pHash duplicate scan passed
- [ ] location/session split passed
- [ ] train/val/test created
- [ ] data.yaml validated
- [ ] class distribution reviewed
- [ ] dataset report generated
- [ ] dataset version frozen

**TRAINING STATUS:**
**NOT AUTHORIZED** *(Awaiting manual dataset execution by the team).*
