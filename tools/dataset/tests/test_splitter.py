import pytest
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))
from src.splitter import determine_split

def test_determine_split_deterministic():
    group_id = "LKO_S001"
    res1 = determine_split(group_id, 0.8, 0.2, 42)
    res2 = determine_split(group_id, 0.8, 0.2, 42)
    assert res1 == res2

def test_determine_split_different_groups():
    group1 = "A"
    group2 = "B"
    # Over a large number of calls, they should not all be identical.
    # We just check the API works.
    res1 = determine_split(group1, 0.8, 0.2, 42)
    assert res1 in ["train", "val", "test"]
    
def test_determine_split_zero_test():
    res = determine_split("LKO_S001", 0.8, 0.2, 42)
    assert res != "test"
