# CivicShield AI - QR4Change Dataset Audit Report

## 1. Dataset Identity and Location
- **Dataset Name**: QR4Change: A Smart QR-Based Civic Grievance Reporting System
- **Path**: `C:\Users\Ujjwal\Downloads\QR4Change A Smart QR-Based Civic Grievance Reporti\QR4Change A Smart QR-Based Civic Grievance Reporti`

## 2. Image and Folder Counts
- **Total Files**: 4,945 files (mostly `.jpg` and `.jpeg`) across `garbage` and `pothole` classes.
- **Garbage Images (Positive)**: 712 garbage images located in `garbage/yes`.
- **Garbage Images (Negative)**: 1,259 non-garbage images located in `garbage/no`.

## 3. Semantic Suitability for `garbage_pile`
**Status: PARTIAL MATCH**
While some images contain mixed debris and scattered litter, many examples (e.g., `IMG (10).jpg`) consist of isolated objects like a few plastic bottles. This is a partial match at best, and does not reliably represent the "aggregated municipal/public waste accumulation" strictly defined by CivicShield.

## 4. Indian Context Verification
**Status: FAILED / NOT VERIFIED**
The dataset documentation claims the images were collected from Pune, India. However, the negative dataset includes clear examples of street scenes from **Japan** (e.g., `IMG (1).jpg` showing Japanese signage and workers). Therefore, the dataset is an unverified amalgamation rather than an authentic collection from Pune.

## 5. Annotation Availability
**Status: FAILED (None Found)**
There are absolutely no bounding box or polygon annotations (`.txt`, `.json`, `.xml`, `.csv`) available for any of the images in the dataset.

## 6. Duplication and Data Leakage
- **Exact Duplicates**: The `find_duplicates.py` tool found 1 exact duplicate pair.
- **Data Leakage Risk**: **HIGH**. Visual inspection confirms that many images (e.g., `IMG (100).jpg` and `IMG (101).jpg`) are burst-shot captures of the exact same scene with slight panning. Because there is no session or sequence grouping metadata provided, splitting this dataset randomly into train/val will cause extreme data leakage and overfitting.

## 7. Privacy Review
**Status: REVIEW REQUIRED**
The dataset consists of raw, unredacted smartphone captures. Identifiable information, such as people and vehicle license plates, is visible in the images.

---

## Final CivicShield Decision: REJECTED

The QR4Change dataset is officially **REJECTED** as a candidate for the `garbage_pile` class because:
1. It contains absolutely no bounding box annotations.
2. It suffers from high data leakage due to undocumented burst captures of the same scenes.
3. It falsely claims a 100% Indian context, yet contains images from Japan.
4. It does not strictly adhere to the `garbage_pile` semantic definition.

## Impact on Phase Completion
- **Phase 3B**: Remains **BLOCKED**. This dataset cannot be merged.
- **Phase 3D**: Remains **BLOCKED**.
- **Phase 3E**: We must now proceed with the **approved custom Indian field collection** for the `garbage_pile` class. Do NOT use this dataset.
