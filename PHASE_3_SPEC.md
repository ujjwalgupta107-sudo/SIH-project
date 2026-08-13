# CIVICSHIELD AI — PHASE 3 YOLO ENGINEERING SPECIFICATION

## 1. Executive Summary
Phase 3 introduces real computer vision to CivicShield. Moving beyond the Phase 1/2 deterministic development adapter, this phase implements a YOLO-based object detection pipeline capable of identifying civic issues in citizen-uploaded media. This document outlines the end-to-end ML engineering strategy, from Indian-context dataset curation and model training to FastAPI inference integration, ensuring a robust, explainable, and SIH-ready demonstration of AI capability.

## 2. ML Problem Definition
**Approach:** Object Detection (Bounding Boxes + Classification)
**Why YOLO Object Detection?**
While image classification can say "there is a pothole in this image," object detection provides bounding boxes, allowing the system to count instances (e.g., "3 potholes") and verify location/scale. Segmentation is unnecessarily computationally expensive for an MVP where exact pixel boundaries of garbage don't change the civic response. Action/Pose detection is irrelevant for static civic issues.
- **Input:** RGB Image (resized to target dimensions, e.g., 640x640).
- **Output:** List of detections, each containing a bounding box `[x_min, y_min, x_max, y_max]`, an integer `class_id`, and a float `confidence`.

## 3. Model Selection
**Primary Model:** **YOLOv8s (Small) or YOLOv11s**
- **Why:** The 'Small' variant offers the best tradeoff between accuracy (mAP) and inference speed, especially crucial when running on constrained cloud instances or edge devices without high-end GPUs. It is fast enough for real-time or near-real-time HTTP requests.
**Backup Model:** **YOLOv8n (Nano)**
- **Why:** If deployment constraints (e.g., limited RAM on a free-tier cloud host) prohibit the 's' model, the 'n' model can run inference in <100ms on a standard CPU, maintaining API responsiveness at the cost of slight accuracy degradation on smaller objects.

## 4. Dataset Strategy
A model is only as good as its training data. CivicShield requires data representative of Indian civic environments (specific road textures, lighting, vehicles, and debris types).
1. **Public Datasets (Foundation):** RDD2022 (Road Damage Dataset - India subset), TACO (Trash Annotations in Context).
2. **Custom Data (Augmentation):** Images curated from local Indian civic reporting portals (if open) or collected manually.
3. **Merging Strategy:** Standardize all labels to the YOLO format. Unify disparate class names (e.g., 'D00', 'D10' in RDD to 'pothole', 'crack').
4. **Diversity:** Data must span daylight, night (streetlights), dry, and monsoon (wet roads, puddles) conditions.

## 5. Class Design
**Initial MVP Classes (Must Have):**
1. `pothole`: Distinct structural damage to the road surface causing a depression.
2. `garbage_pile`: Aggregated solid waste obstructing pedestrian or vehicle pathways.
3. `waterlogging`: Significant accumulation of standing water on civic infrastructure.

**Should Have (Phase 3.5):**
4. `broken_streetlight`, `fallen_tree`.

**Why combined/separated?** 
We separate `pothole` from generic `road_damage` (like longitudinal cracks) because potholes pose an immediate, severe accident risk for two-wheelers in India, triggering a different department SLA than standard resurfacing.

## 6. Dataset Size
- **Minimum Viable Dataset (MVD):** 500 instances per class.
- **Recommended Dataset:** 1,500 - 2,500 instances per class.
- **Strong Dataset:** 5,000+ instances per class.
**Note on Class Imbalance:** Potholes are abundantly available in public datasets (RDD2022). Waterlogging is scarce. Undersampling abundant classes or aggressively augmenting rare classes will be necessary to prevent the model from becoming biased toward predicting 'pothole' for every anomaly.

## 7. Data Collection
**Indian Context Strategy:**
- Extract the India-specific subset of RDD2022.
- For `garbage_pile` and `waterlogging`, scrape open-source Indian news articles or leverage the SIH team to take field photographs in Lucknow/local cities using various smartphone cameras (budget and flagship).
- Ensure varying angles (from a bike, from a pedestrian viewpoint, from a car dashcam).

## 8. Annotation
**Methodology:**
- **Rules:** Draw bounding boxes tightly around the visible extent of the issue. For waterlogging, box the contiguous area of standing water. If a garbage pile is split by a pole, draw one encompassing box if logically a single pile, or two if distinctly separate.
- **Tools:** Use CVAT or Roboflow for collaborative annotation.
**Format (YOLO):**
Text files corresponding to image names.
Format: `<class_id> <x_center> <y_center> <width> <height>` (normalized 0.0 to 1.0).

## 9. Dataset Structure
```text
civicshield_dataset/
  data.yaml
  images/
    train/
      img_001.jpg
    val/
      img_002.jpg
  labels/
    train/
      img_001.txt
    val/
      img_002.txt
```
**data.yaml:**
```yaml
train: ../images/train
val: ../images/val
nc: 3
names: ['pothole', 'garbage_pile', 'waterlogging']
```

## 10. Split Strategy
**Recommendation:** Grouped/Location-Aware Split.
- **Why:** Random splits cause "data leakage" if sequential frames from a video or burst-photos of the *same* pothole end up in both training and validation sets. The model will memorize the background rather than learning the feature. Split datasets by unique geographical location or distinct capture sessions (80% train, 20% val).

## 11. Data Validation
**Automated Checks Before Training:**
- Verify every `.jpg` has a corresponding `.txt`.
- Flag `.txt` files with bounding box coordinates `< 0` or `> 1`.
- Flag extreme aspect ratios (e.g., a bounding box that is 1px wide and 500px tall).
- Output a class distribution histogram to identify severe imbalances.
**Tools:** Simple Python script using `pandas` and `matplotlib` executed before training kicks off.

## 12. Augmentation
**Realistic Civic Augmentation:**
- **Potholes:** Random rotation (±15°), horizontal flip (roads look similar reversed), brightness/contrast jitter (simulating different times of day).
- **Waterlogging:** DO NOT use aggressive color jitter that changes hue, as water color (muddy vs clear) and reflections are critical features.
- **DO NOT USE:** Vertical flips (cars/roads don't exist upside down). MixUp/Mosaic should be used cautiously; heavy mosaic can create unrealistic floating garbage that confuses the model context.

## 13. Training Strategy
- **Pretrained Weights:** Start with COCO-pretrained weights (e.g., `yolov8s.pt`). Transfer learning is mandatory to converge quickly on a small dataset.
- **Image Size:** 640x640 (standard tradeoff).
- **Epochs:** 100-300 with Early Stopping (patience=50).
- **Batch Size:** 16 or 32 (depending on VRAM).
- **Optimizer:** AdamW or SGD. Let the YOLO framework auto-select based on dataset size, but AdamW is generally preferred for custom fine-tuning.

## 14. Command-Line Workflow
```bash
# 1. Environment Setup
pip install ultralytics roboflow

# 2. Validation (Conceptual custom script)
python validate_dataset.py --data civicshield_dataset/

# 3. Training
yolo task=detect mode=train model=yolov8s.pt data=civicshield_dataset/data.yaml epochs=200 imgsz=640 batch=16 project=civicshield name=run_v1

# 4. Validation (Evaluation)
yolo task=detect mode=val model=civicshield/run_v1/weights/best.pt data=civicshield_dataset/data.yaml

# 5. Export (To ONNX for faster CPU backend inference)
yolo task=detect mode=export model=civicshield/run_v1/weights/best.pt format=onnx
```

## 15. GPU Strategy
**Recommendation:** **Google Colab (T4 / V100)** for training.
- **Why:** Free or extremely low cost ($10/mo for Pro). Sufficient VRAM (16GB) for YOLOv8s batch size 16. Fast experimentation without needing local hardware.
- **Inference/Deployment:** CPU fallback on the FastAPI server using ONNX runtime is highly recommended for the SIH demo to avoid expensive cloud GPU hosting costs.

## 16. Experiment Tracking
**Approach:** YOLO natively integrates with TensorBoard and Weights & Biases (W&B).
- For SIH, **W&B (Free Tier)** is recommended. It provides beautiful, shareable dashboards of training loss, mAP, and validation predictions that look highly professional to judges.

## 17. Evaluation
- **Precision:** When the model predicts a pothole, how often is it actually a pothole?
- **Recall:** Out of all actual potholes, how many did the model find?
- **mAP@50 (Mean Average Precision):** The primary metric. Measures the area under the Precision-Recall curve at a 50% Intersection over Union (IoU) threshold.
- **Confusion Matrix:** Crucial for identifying if the model confuses `waterlogging` with `pothole` (e.g., a pothole filled with water).

## 18. Error Analysis
- **False Positives:** E.g., model detects a manhole cover as a pothole. Action: Add negative examples (images of normal manholes without labels) to the dataset.
- **False Negatives:** Model misses small garbage piles. Action: Tweak augmentation (zoom/crop) or lower confidence thresholds for that specific class.

## 19. Confidence Thresholds
Do NOT use a hardcoded `0.5`.
- **Safety Critical Tradeoff:** For CivicShield, a False Positive (dispatching a worker to a shadow that isn't a pothole) costs municipal money. A False Negative leaves a dangerous pothole unreported.
- Thresholds must be tuned per-class based on the F1-curve generated during validation. E.g., `pothole` might use `0.45` to maximize recall, while `garbage_pile` uses `0.6` to ensure high precision.

## 20. Video Inference
- **Strategy: Frame Sampling.** Do not run inference on 30 FPS (too expensive).
- Extract 1 frame every 1 second (1 FPS).
- Run YOLO inference on sampled frames.
- **Aggregation:** If `pothole` is detected in >= 3 consecutive sampled frames, confidently mark the video as containing a pothole and extract the frame with the highest confidence as the `thumbnail_key` evidence for the Command Center.

## 21. YOLO Output Contract
The FastAPI wrapper around the model should yield:
```json
{
  "model_version": "civicshield-yolov8s-v1.2",
  "inference_time_ms": 142,
  "detections": [
    {
      "class_id": 0,
      "class_name": "pothole",
      "confidence": 0.88,
      "bbox": [120.5, 340.2, 180.0, 410.8]
    }
  ]
}
```
*Note: The vision model outputs bounding boxes and classes. It DOES NOT output "Risk Level: CRITICAL". That is the job of the downstream logic.*

## 22. AI Pipeline
1. **VISION:** YOLO extracts raw visual facts ("I see a pothole with 88% confidence").
2. **RISK (Phase 5):** Evaluates facts + location ("A pothole on a major arterial highway = CRITICAL").
3. **DECISION:** ("Route to PWD within 2 hours").
*Separation ensures that if a routing rule changes, the ML model doesn't need retraining.*

## 23. FastAPI Architecture
**Implementation:**
- Implement `YOLOVisionService` inheriting from the Phase 1 `VisionService` interface.
- **Model Loading:** Load the `.onnx` or `.pt` model **once** globally during FastAPI startup (`@app.on_event("startup")`). Do not load the model inside the request handler.
- **Execution:** Pass image bytes to the globally loaded singleton model.

## 24. Model Versioning
Name weights files semantically: `yolov8s_civic_v1.0.onnx`.
Store the version string in the `AIAssessment` table in the database alongside the payload so historically predictions can be traced back to a specific model version if model drift occurs.

## 25. Model Storage
- **Development/Git:** Add `*.pt` and `*.onnx` to `.gitignore`. Never commit 100MB model files.
- **Artifacts:** Store trained weights in a dedicated Google Drive folder, AWS S3 bucket, or GitHub Releases attached to tags.
- **Deployment:** The Dockerfile or setup script should `wget` or `curl` the specific model weights file during the build process.

## 26. API Design
- **Route:** `POST /api/v1/incidents/{id}/analyze`
- **Execution:** Synchronous for Phase 3 MVP (assuming single images and ONNX CPU inference < 300ms).
- **Error Handling:** If the YOLO model fails to load or throws an out-of-memory error, return `503 Service Unavailable` and fallback to the development deterministic adapter to ensure the app doesn't crash completely during a demo.

## 27. Async Processing
- **Queueing:** For video processing, synchronous HTTP requests will timeout.
- **Recommendation:** Use FastAPI `BackgroundTasks` for the MVP. It is simple, requires no external infrastructure (like Redis/Celery), and works perfectly for SIH demonstration scale. Once the citizen submits, return `202 Accepted` immediately, and run YOLO in the background task.

## 28. Explainability
- **Citizen View:** "AI Analysis Complete: Pothole detected." (Do not show bounding boxes or IoU scores, it confuses users).
- **Command Center View:** Overlay the YOLO bounding boxes directly onto the image in the Intelligence Panel. Show the confidence score. This visually proves to the judge that the AI is actually finding the object in the image space.

## 29. Safety
- **No Detection Fallback:** If YOLO returns `[]` (no detections), the system must transition the incident to `NEEDS HUMAN REVIEW`. Do not auto-close or auto-resolve incidents based on a lack of AI detection, as the citizen may have captured an edge case or rare issue (e.g., a downed power line) not in the model's vocabulary.

## 30. Privacy
- **Redaction:** Civic images contain license plates and faces. In Phase 3, we acknowledge this requirement.
- **Future implementation:** A lightweight Haar Cascade or secondary YOLO class for `face`/`license_plate` should be run, applying a Gaussian blur to those bounding boxes before saving the final evidence image.

## 31. Dataset Licensing
- **RDD2022 (Road Damage Dataset):** Usually licensed under CC BY 4.0 or similar open research licenses. **SAFE TO USE** with proper attribution in the repository README.
- **TACO:** MIT License. **SAFE TO USE**.
- **Scraped Google Images:** Copyrighted. **DO NOT USE** for public open-source releases; use team-captured data instead to ensure a clean IP profile for the hackathon.

## 32. SIH Demo
**The Visual Proof:**
1. Presenter uploads a locally taken picture of a Lucknow street with a garbage pile.
2. The UI shows the analyzing animation.
3. Behind the scenes, the FastAPI endpoint runs `YOLOVisionService`.
4. The Command Center dashboard receives the WebSocket/Polling update.
5. The judge clicks the incident. The image loads with a bright red bounding box tightly wrapping the garbage, labeled `Garbage 92%`.
6. This undeniable visual evidence separates a real ML project from a generic CRUD app.

## 33. Judge Explanation
**30-Second Pitch:** "We trained a custom YOLOv8 object detection model specifically on Indian civic data. Instead of just a generic LLM text response, our system literally sees and bounds the civic issue—whether it's a pothole or garbage—allowing us to guarantee visual evidence before routing it to the command center."

**1-Minute Extension:** "We chose YOLO over segmentation for speed, enabling near-real-time inference on cheap CPU cloud instances via ONNX. We explicitly decoupled the visual detection (the 'what') from the risk assessment (the 'severity') so municipal rules can change without requiring us to retrain the neural network."

## 34. Implementation Plan

- **TASK 1:** Finalize MVP classes (`pothole`, `garbage_pile`, `waterlogging`).
- **TASK 2:** Acquire India-specific RDD2022 and TACO subsets.
- **TASK 3:** Clean and map labels to a unified 0, 1, 2 index.
- **TASK 4:** Annotate 200 custom team-captured images in Roboflow.
- **TASK 5:** Validate dataset via python script (check missing labels).
- **TASK 6:** Generate location-aware 80/20 train/val split.
- **TASK 7:** Train baseline YOLOv8n on Google Colab (100 epochs).
- **TASK 8:** Evaluate mAP@50 and confusion matrix in W&B.
- **TASK 9:** Analyze false positives (e.g., manholes).
- **TASK 10:** Augment dataset and retrain YOLOv8s.
- **TASK 11:** Select best model, export to `.onnx`.
- **TASK 12:** Implement `YOLOVisionService` in FastAPI (Singleton load).
- **TASK 13:** Test inference endpoint via Postman.
- **TASK 14:** Update Command Center UI to render bounding boxes over evidence images.

---

## 35. CODEX PHASE 3 IMPLEMENTATION SPECIFICATION

# CODEX PHASE 3 IMPLEMENTATION SPECIFICATION

**BACKEND INTEGRATION WORK (Codex Focus):**
The ML training will occur off-repository in Colab. Codex is responsible for integrating the resulting model artifact.

**TASK 1: Model Loading Infrastructure**
- **Objective:** Safely load a YOLO/ONNX model at FastAPI startup.
- **Implementation:** Create `backend/app/ml/vision.py`. Implement a class that loads `model.onnx` using `onnxruntime` or `ultralytics`. It must be instantiated once in `main.py` startup events.

**TASK 2: Replace Development Adapter**
- **Objective:** Swap the simulated AI for real inference.
- **Implementation:** Implement `YOLOVisionService(VisionService)`. It takes an image path/bytes, runs inference, parses the bounding boxes, and maps the highest confidence class to the `AIAnalysis` schema. Update `services/ai.py` to use this class if `VITE_AI_MODE=production`.

**TASK 3: AIAssessment Storage Update**
- **Objective:** Store bounding boxes in the database.
- **Implementation:** Ensure the `payload` JSONB column in the `AIAssessment` table receives the full bounding box array from the YOLO output so the frontend can render it later.

**FRONTEND WORK (Codex Focus):**

**TASK 4: Bounding Box Renderer Component**
- **Objective:** Visually prove the ML works in the Command Center.
- **Implementation:** Create `BoundingBoxOverlay.tsx` in `command-center`. It takes the original image URL and the `payload.detections` array. It renders absolute positioned `<div>` borders over the image using percentage-based coordinates calculated from the YOLO normalized outputs.

*Codex Rules:*
- DO NOT train a model. Use a dummy class that returns a hardcoded bounding box array for testing the UI integration until the real `.onnx` file is provided by the ML team.
- DO NOT commit large `.pt` or `.onnx` files to git. Add them to `.gitignore`.

## 36. Definition of Done
- [ ] Dataset classes finalized (pothole, garbage, waterlogging).
- [ ] Dataset licensing verified safe for SIH.
- [ ] Baseline model trained externally (Colab).
- [ ] Error analysis performed and model refined.
- [ ] Final `.onnx` model exported and hosted externally.
- [ ] FastAPI loads the model as a singleton on startup.
- [ ] `POST /analyze` runs actual image inference.
- [ ] YOLO outputs structured JSON containing bounding boxes and classes.
- [ ] Low-confidence detections fallback to "Needs Human Review" status.
- [ ] Command Center UI successfully parses AI payload and draws bounding boxes on evidence images.
- [ ] No hardcoded fake detections in the production execution path.
