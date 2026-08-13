import pytest
import sys
import tempfile
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))
from src.validator import validate_yolo_label

def test_validate_valid_label():
    with tempfile.TemporaryDirectory() as tmpdir:
        lbl_path = Path(tmpdir) / "test.txt"
        with open(lbl_path, "w") as f:
            f.write("0 0.5 0.5 0.2 0.2\n")
            
        errors = validate_yolo_label(lbl_path, {0, 1, 2})
        assert len(errors) == 0

def test_validate_invalid_class():
    with tempfile.TemporaryDirectory() as tmpdir:
        lbl_path = Path(tmpdir) / "test.txt"
        with open(lbl_path, "w") as f:
            f.write("3 0.5 0.5 0.2 0.2\n") # class 3 not in {0,1,2}
            
        errors = validate_yolo_label(lbl_path, {0, 1, 2})
        assert len(errors) == 1
        assert "Invalid class ID 3" in errors[0]

def test_validate_out_of_bounds():
    with tempfile.TemporaryDirectory() as tmpdir:
        lbl_path = Path(tmpdir) / "test.txt"
        with open(lbl_path, "w") as f:
            f.write("0 1.5 0.5 0.2 0.2\n")
            
        errors = validate_yolo_label(lbl_path, {0, 1, 2})
        assert len(errors) == 1
        assert "Coordinates out of bounds" in errors[0]
