import imagehash
from PIL import Image
from pathlib import Path
import hashlib

def get_exact_hash(image_path: Path) -> str:
    """Computes SHA-256 hash for exact duplicate detection."""
    sha256 = hashlib.sha256()
    with open(image_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha256.update(chunk)
    return sha256.hexdigest()

def get_phash(image_path: Path) -> str:
    """Computes perceptual hash for near-duplicate detection."""
    try:
        with Image.open(image_path) as img:
            return str(imagehash.phash(img))
    except Exception:
        return ""

def phash_distance(hash1: str, hash2: str) -> int:
    """Calculates hamming distance between two phash strings."""
    if not hash1 or not hash2:
        return float('inf') # Return high distance if invalid
    try:
        h1 = imagehash.hex_to_hash(hash1)
        h2 = imagehash.hex_to_hash(hash2)
        return h1 - h2
    except ValueError:
        return float('inf')
