import pytest
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))
from src.phash import phash_distance

def test_phash_distance_identical():
    h1 = "e3c1"
    h2 = "e3c1"
    assert phash_distance(h1, h2) == 0

def test_phash_distance_different():
    h1 = "ffff"
    h2 = "0000"
    dist = phash_distance(h1, h2)
    assert dist > 0

def test_phash_distance_invalid():
    assert phash_distance("", "e3c1") == float('inf')
    assert phash_distance(None, "e3c1") == float('inf')
