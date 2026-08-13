import hashlib
import random
from typing import List, Dict

def determine_split(group_id: str, train_ratio: float, val_ratio: float, seed: int) -> str:
    """
    Deterministically assigns a group to a split based on a hash of the group ID and a seed.
    """
    random.seed(f"{seed}_{group_id}")
    val = random.random()
    if val < train_ratio:
        return "train"
    elif val < train_ratio + val_ratio:
        return "val"
    else:
        return "test"

def group_items(items: List[Dict], group_key: str) -> Dict[str, List[Dict]]:
    """Groups a list of dictionaries by a specific key."""
    grouped = {}
    for item in items:
        gid = item.get(group_key)
        if gid not in grouped:
            grouped[gid] = []
        grouped[gid].append(item)
    return grouped
