from typing import Tuple, Optional

def convert_to_yolo(xmin: float, ymin: float, xmax: float, ymax: float, image_width: float, image_height: float) -> Optional[Tuple[float, float, float, float]]:
    """
    Converts Pascal VOC absolute bounding box coordinates to normalized YOLO coordinates.
    Returns None if the coordinates are invalid.
    """
    if image_width <= 0 or image_height <= 0:
        return None
        
    # YOLO normalizes coordinates by image dimensions
    x_center = ((xmin + xmax) / 2.0) / image_width
    y_center = ((ymin + ymax) / 2.0) / image_height
    w = (xmax - xmin) / image_width
    h = (ymax - ymin) / image_height
    
    # Validation checks
    if w <= 0 or h <= 0:
        return None
    if x_center < 0.0 or x_center > 1.0 or y_center < 0.0 or y_center > 1.0:
        return None
    if w > 1.0 or h > 1.0:
        return None
        
    return (x_center, y_center, w, h)
