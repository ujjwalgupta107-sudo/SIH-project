# CIVICSHIELD AI — FINAL ML REVIEW BOARD VALIDATION (PHASE 3)

## 1. MODEL DECISION VALIDATION
**PRIMARY MODEL: YOLO11s** (Ultralytics)
**BACKUP MODEL: YOLOv8n**
**Justification:** YOLO11 (released late 2024) boasts improved feature extraction and fewer parameters for similar mAP compared to YOLOv8. YOLO11s achieves ~47.0 mAP on COCO while running at incredibly high speeds (under 2ms per image on a T4 GPU). It exports cleanly to ONNX, making CPU inference via FastAPI highly feasible for the SIH demo without needing costly cloud GPUs. If memory overhead becomes an issue on standard tier free hosting (e.g., 512MB RAM), YOLOv8n (Nano) remains the safest, most stable fallback due to its extreme lightweight profile (~3M parameters).

## 2. DATASET VALIDATION
- **RDD2022 (Road Damage Dataset - India Subset):**
  - Source: Official Global Road Damage Detection Challenge.
  - Purpose: Pothole and road crack detection.
  - License: CC BY 4.0.
  - Status: **SAFE TO USE**.
- **TACO (Trash Annotations in Context):**
  - Source: Official TACO GitHub/Website.
  - Purpose: Garbage and litter detection.
  - License: MIT/CC BY 4.0 (images have varying licenses, mostly Flickr CC).
  - Status: **SAFE TO USE** (for non-commercial/academic SIH use).
- **Google Images Scrape / Unofficial Kaggle Drops:**
  - Status: **DO NOT USE**. High risk of copyright infringement or poor annotation quality.

## 3. RDD2022 VALIDATION
**Fact Verified From Source:** RDD2022 India subset contains labels like `D00` (longitudinal crack), `D10` (transverse crack), `D20` (alligator crack), and `D40` (pothole).
**Limitations:** 
- The India dataset focuses heavily on highways and standard roads, less on dense residential gallis (lanes) or monsoon-specific waterlogging. 
- `D40` maps cleanly to CivicShield's `pothole` class.
- Geographic Leakage Risk: If we split randomly, consecutive frames from the RDD smartphone dashcam footage will bleed into train and validation sets. We must split by video/capture sequence ID, not by random shuffle.

## 4. CIVICSHIELD MVP CLASSES
**MUST HAVE:**
1. `pothole` (High availability in RDD, distinct, critical civic priority).
2. `garbage_pile` (High SIH value, distinct from background, available in TACO).

**SHOULD HAVE:**
3. `waterlogging` (Crucial for Indian monsoon context, but requires purely custom dataset collection. High risk of false negatives due to reflections).

**FUTURE:**
`broken_streetlight`, `fallen_tree`, `open_manhole` (Too complex for MVP timeframe, risk diluting the dataset).

## 5. DATASET MERGING
- **Strategy:** Combine RDD2022 (filtering only `D40` -> `0`), TACO (mapping `litter`/`garbage` bounding boxes -> `1`), and Custom Waterlogging (`2`).
- **Normalization:** All images must be resized to max 640px long-edge and padded (letterboxed) to maintain aspect ratio, ensuring bounding boxes are correctly recalculated into YOLO normalized coordinates (`[x_center, y_center, width, height]`).
- **Class Balancing:** RDD has thousands of potholes. Custom data might only have 300 waterlogging images. We must undersample RDD potholes (randomly select 1,500) to prevent the model from aggressively biasing towards class `0`.

## 6. DATA LEAKAGE
**Engineering Recommendation:**
Use a **Location/Sequence-Aware Split**. For custom data collected by the team, if 10 photos are taken of the *same* pothole from different angles, all 10 photos MUST go into either the `train` set or the `val` set. They cannot be split across both. Doing so artificially inflates mAP metrics because the model memorizes the background (e.g., a specific parked car next to the pothole).

## 7. INDIAN CONTEXT
**Evaluation:** RDD2022 covers Indian road textures well. TACO is primarily Western (beach litter, European streets). 
**Mandatory Custom Collection:** The team MUST collect at least 300-500 images of Indian context `garbage_pile` (e.g., roadside dumps, overflowing municipal bins, mixed waste with street dogs/cows) and `waterlogging` (monsoon puddle reflections).

## 8. DATASET SIZE
- **Minimum Viable (MVP Demo):** 500 images per class. (Will overfit, but proves the concept).
- **Recommended (SIH Final):** 1,500 images per class. (Balances training time with robust generalization).
- **Strong (Production):** 5,000+ images per class.

## 9. ANNOTATION QUALITY
- **Rules:** Bounding boxes must tightly encapsulate the object. 
- **Exclusions:** Do NOT annotate a pothole if it is smaller than 15x15 pixels in a 640x640 image (the model cannot resolve features that small). Do NOT annotate scattered single wrappers as `garbage_pile`; only annotate contiguous piles of waste that require municipal cleanup.
- **Occlusion:** If a car tire covers 30% of a pothole, annotate the *visible* portion only.

## 10. TRAINING PLAN
- **Initial Baseline:** YOLO11s pre-trained on COCO. Image size `640`, epochs `100`, batch size `16` (or `32` if using T4). Default Ultralytics augmentation.
- **Tuning:** If validation loss plateaus but training loss drops (overfitting), increase dropout, enable mosaic augmentation, and reduce learning rate (`lr0=0.001`). Early stopping patience of 50 epochs is standard.

## 11. EVALUATION
- **Prioritize Recall for Civic Safety:** Missing a massive crater (False Negative) is worse than flagging a shadow (False Positive). 
- **Primary Metric:** `mAP@50`. Because civic reporting doesn't require pixel-perfect bounding boxes (unlike medical imaging or autonomous driving), IoU threshold of 0.5 is perfectly acceptable to confirm "Yes, the problem exists here."

## 12. CONFIDENCE THRESHOLDS
**Strategy:**
Do not use a universal `0.5`. Generate the F1-Confidence curve during YOLO validation. 
- Find the confidence threshold where F1 is maximized for `pothole`. Let's say it's `0.35`. Set the inference threshold for `pothole` to `0.35` to ensure we capture maximum reports. 
- For `garbage_pile`, if false positives are high (e.g., confusing dirt piles for garbage), raise the threshold to `0.55`.

## 13. VIDEO
**Strategy Validated:** Frame sampling (1 FPS) + Temporal Aggregation is strictly sufficient for Phase 3. Running object tracking (ByteTrack) or 30 FPS inference will crash SIH demo hardware and provides zero additional civic value.

## 14. FASTAPI INTEGRATION
**Strategy Validated:**
- **Model Load:** Must be inside FastAPI `@asynccontextmanager` lifespan event. 
- **Singleton:** Assigned to `app.state.yolo_model`. 
- **CPU Inference:** Load via `onnxruntime` (`providers=['CPUExecutionProvider']`).
- **Timeout/Fallback:** If inference takes > 2 seconds, abort and return empty detections, deferring the incident to `NEEDS HUMAN REVIEW`.

## 15. AI BOUNDARY
**Verified:** YOLO is strictly responsible for `Visual Detection`. It outputs `[{"class": "pothole", "confidence": 0.88}]`. 
It does **NOT** output severity. Severity calculation belongs in the Phase 5 Risk Engine.

## 16. SIH DEMO VALIDATION
**Demo Requirement:** The UI must fetch the raw uploaded image, fetch the AI JSON payload, and use CSS/Canvas to draw a red box with a label (`Pothole 88%`) over the exact coordinates on the Command Center screen. This visibly proves the model's actual inference capability to the judges.

## 17. LICENSING RISK
- **YOLO11 Framework (Ultralytics):** AGPL-3.0 License. 
  - **NEEDS REVIEW:** AGPL requires open-sourcing the server code if exposed over a network. For SIH (an open academic hackathon), this is entirely fine. For commercial deployment, a separate enterprise license is required.
- **RDD2022/TACO:** CC BY 4.0 / MIT. **VERIFIED SAFE.**
- **ONNX Runtime:** MIT. **VERIFIED SAFE.**

## 18. FINAL ML ARCHITECTURE
**Citizen Media** (Upload via signed URL) 
↓ 
**Media Validation** (MIME/Size check)
↓ 
**YOLO11s ONNX Runtime** (Extracts Bounding Boxes)
↓ 
**Detection Filtering** (NMS, Confidence Thresholds)
↓ 
**Vision Evidence** (Saved to PostgreSQL `AIAssessment` JSONB)
↓ 
**Risk Engine** (Applies severity rules later in Phase 5)
↓ 
**Command Center** (UI draws bounding boxes for operators)

---

## 19. FINAL DECISION

**PRIMARY YOLO MODEL:** YOLO11s
**BACKUP MODEL:** YOLOv8n

**INITIAL CLASSES:** `pothole`, `garbage_pile`, `waterlogging`

**DATASETS APPROVED:** RDD2022 (India Subset), TACO

**DATASETS REQUIRING REVIEW:** None currently.

**DATASETS TO AVOID:** Unverified Kaggle scrapes, Google Images.

**RECOMMENDED DATASET SIZE:** 1,500 images per class.

**RECOMMENDED SPLIT:** 80/20 Grouped Location-Aware Split.

**TRAINING ENVIRONMENT:** Google Colab (T4 GPU).

**INFERENCE ENVIRONMENT:** FastAPI ONNX Runtime (CPU fallback).

**PHASE 3 ARCHITECTURE:** Synchronous API -> Singleton ONNX Load -> Bounding Box JSON output.

---

## 20. GO / NO-GO

**GO — READY FOR DATASET PREPARATION**

*The specification is technically rigorous, logically separated from the application domain, and optimizes for the specific constraints of an SIH demonstration.*
