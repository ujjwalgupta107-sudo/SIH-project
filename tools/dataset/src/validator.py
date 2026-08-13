from pathlib import Path

def validate_yolo_label(label_path: Path, allowed_classes: set) -> list:
    """
    Validates a YOLO label file.
    Returns a list of error strings, or an empty list if valid.
    """
    errors = []
    if not label_path.exists():
        return ["Label file does not exist."]
        
    try:
        with open(label_path, "r") as f:
            lines = f.readlines()
            
        if not lines:
            return ["Label file is empty."]
            
        for idx, line in enumerate(lines):
            parts = line.strip().split()
            if not parts:
                continue
            if len(parts) != 5:
                errors.append(f"Line {idx+1}: Expected 5 values, got {len(parts)}.")
                continue
                
            try:
                class_id = int(parts[0])
                if class_id not in allowed_classes:
                    errors.append(f"Line {idx+1}: Invalid class ID {class_id}.")
                    
                x, y, w, h = map(float, parts[1:])
                if not (0.0 <= x <= 1.0 and 0.0 <= y <= 1.0):
                    errors.append(f"Line {idx+1}: Coordinates out of bounds.")
                if not (0.0 < w <= 1.0 and 0.0 < h <= 1.0):
                    errors.append(f"Line {idx+1}: Dimensions out of bounds.")
            except ValueError:
                errors.append(f"Line {idx+1}: Non-numeric values found.")
    except Exception as e:
        errors.append(f"Error reading file: {str(e)}")
        
    return errors
