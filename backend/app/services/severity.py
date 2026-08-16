"""Real severity calculation based on ML detections and civic criteria."""
from typing import List
from ..schemas import Detection, Risk


def calculate_severity(detections: List[Detection], image_width: int = 640, image_height: int = 640) -> int:
    """
    Calculate severity score (0-100) based on ML detections.
    
    Factors:
    - Class type (pothole=higher base, waterlogging=high)
    - Detection confidence (higher = more certain issue exists)
    - Bounding box area relative to image (larger = more severe)
    - Number of detections (multiple = more severe)
    """
    if not detections:
        return 0
    
    # Base severity per class (civic priority)
    CLASS_BASE_SEVERITY = {
        "pothole": 60,       # Structural road damage - high civic risk
        "waterlogging": 70,  # Flooding risk - high civic risk
    }
    
    total_score = 0
    max_single_score = 0
    
    for det in detections:
        base = CLASS_BASE_SEVERITY.get(det.class_name, 40)
        
        # Confidence factor (0.5 to 1.5 multiplier)
        conf_factor = 0.5 + det.confidence
        
        # Bounding box area factor
        bbox_area = (det.bbox.x2 - det.bbox.x1) * (det.bbox.y2 - det.bbox.y1)
        image_area = image_width * image_height
        area_ratio = bbox_area / image_area if image_area > 0 else 0
        # Area factor: 0.5 to 1.5 based on relative size
        area_factor = 0.5 + min(area_ratio * 2, 1.0)
        
        detection_score = base * conf_factor * area_factor
        total_score += detection_score
        max_single_score = max(max_single_score, detection_score)
    
    # Bonus for multiple detections
    multi_bonus = min(len(detections) * 5, 20)
    
    # Weighted combination: 70% total + 30% max single + bonus
    combined = 0.7 * total_score + 0.3 * max_single_score
    final_score = min(int(round(combined + multi_bonus)), 100)
    
    return final_score


def classify_risk_level(severity_score: int) -> Risk:
    """Classify risk level based on severity score."""
    if severity_score >= 80:
        return "CRITICAL"
    elif severity_score >= 60:
        return "HIGH"
    elif severity_score >= 35:
        return "MEDIUM"
    else:
        return "LOW"


def assign_department(class_name: str) -> str:
    """Assign department based on detected issue class."""
    DEPARTMENT_MAP = {
        "pothole": "Road Maintenance / PWD",
        "waterlogging": "Drainage / Municipal Corporation",
    }
    return DEPARTMENT_MAP.get(class_name, "Municipal Corporation")


def get_primary_class(detections: List[Detection]) -> str:
    """Get the highest confidence detection class."""
    if not detections:
        return "unknown"
    return max(detections, key=lambda d: d.confidence).class_name


def build_ai_analysis(detections: List[Detection], image_width: int = 640, image_height: int = 640):
    """Build AIAnalysis from ML detections with real severity."""
    from ..schemas import AIAnalysis, Risk
    
    if not detections:
        return AIAnalysis(
            classification="none",
            confidence=0.0,
            severity_score=0,
            risk_level="LOW",
            explanation=["No civic issues detected in the image."]
        )
    
    primary_class = get_primary_class(detections)
    severity = calculate_severity(detections, image_width, image_height)
    risk_level = classify_risk_level(severity)
    max_conf = max(d.confidence for d in detections)
    
    # Build explanation
    class_counts = {}
    for d in detections:
        class_counts[d.class_name] = class_counts.get(d.class_name, 0) + 1
    
    explanation_parts = []
    for cls, count in class_counts.items():
        if count == 1:
            explanation_parts.append(f"1 {cls} detected")
        else:
            explanation_parts.append(f"{count} {cls}s detected")
    
    explanation = [
        f"ML inference found: {', '.join(explanation_parts)}.",
        f"Primary concern: {primary_class} (confidence: {max_conf:.0%}).",
        f"Severity score: {severity}/100 ({risk_level})."
    ]
    
    return AIAnalysis(
        classification=primary_class,
        confidence=round(max_conf, 2),
        severity_score=severity,
        risk_level=risk_level,
        explanation=explanation
    )