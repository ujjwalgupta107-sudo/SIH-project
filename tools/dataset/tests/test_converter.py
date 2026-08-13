import pytest
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parent.parent))
from src.converter import convert_to_yolo

def test_convert_valid_coordinates():
    # 100x100 image, box from 10,10 to 50,50
    # center is 30,30. w=40, h=40
    # normalized: 0.3, 0.3, 0.4, 0.4
    res = convert_to_yolo(10.0, 10.0, 50.0, 50.0, 100.0, 100.0)
    assert res is not None
    x, y, w, h = res
    assert pytest.approx(x) == 0.3
    assert pytest.approx(y) == 0.3
    assert pytest.approx(w) == 0.4
    assert pytest.approx(h) == 0.4

def test_convert_invalid_image_size():
    res = convert_to_yolo(10.0, 10.0, 50.0, 50.0, 0, 0)
    assert res is None

def test_convert_out_of_bounds():
    # xmax > image_width
    res = convert_to_yolo(10.0, 10.0, 150.0, 50.0, 100.0, 100.0)
    assert res is None
    
def test_convert_negative_width():
    # xmin > xmax
    res = convert_to_yolo(50.0, 10.0, 10.0, 50.0, 100.0, 100.0)
    assert res is None
