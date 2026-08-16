# Garbage Dataset Audit Report

**Audit Date:** 2026-08-16  
**Source Directory:** `civicshield-dataset/raw/custom/garbage/`  
**Total Files Found:** 105 JPG files

---

## Summary

| Metric | Count |
|--------|-------|
| Total JPG files | 105 |
| Valid/Readable images | 105 |
| Corrupt/Unreadable images | 0 |
| Exact duplicates (SHA-256) | 1 pair (2 files) |
| Near-duplicates (pHash distance=0) | 8 pairs (12 unique files involved) |
| Unique images after dedup | ~94 |
| Annotated (YOLO labels exist) | 0 |
| Semantic suitability concerns | Multiple (see below) |

---

## File-by-File Analysis

| Filename | Size (bytes) | Resolution | Valid | Duplicate Status | Semantic Notes |
|----------|--------------|------------|-------|------------------|----------------|
| 1500x900_garbage-in-public-places.jpg | 3,355,636 | 1500x900 | ✅ | Near-dup of `images (15).jpg` (pHash=0) | High-res stock photo, clear garbage piles |
| 4CE458C200000578-5802189-image-a-49_1528118838560.jpg | 298,608 | 962x1319 | ✅ | Unique | News/media photo, garbage in street |
| garbage-being-dumped-and-stored-in-a-vacant-downtown-city-lot-in-varanasi-india-which-raises-issues-of-waste-management-and-public-health-2A1CT23.jpg | 299,072 | 1300x956 | ✅ | Unique | Clear garbage dump scene, Varanasi |
| images.jpg | 40,158 | 570x350 | ✅ | Unique | Generic garbage pile |
| images (1).jpg | 80,105 | 437x702 | ✅ | Unique | Garbage bags on street |
| images (2).jpg | 68,430 | 548x364 | ✅ | **Exact/near-dup of `images (5).jpg`** (pHash=0) | Similar composition |
| images (3).jpg | 69,709 | 678x452 | ✅ | Unique | Garbage on roadside |
| images (4).jpg | 76,225 | 710x432 | ✅ | Near-dup of `images (29).jpg` (pHash=0) | Similar scene |
| images (5).jpg | 57,804 | 500x333 | ✅ | **Near-dup of `images (2).jpg`** (pHash=0) | Different resolution, same content |
| images (6).jpg | 64,024 | 738x384 | ✅ | Unique | Garbage pile |
| images (7).jpg | 93,113 | 686x446 | ✅ | Unique | Street garbage |
| images (8).jpg | 59,132 | 480x318 | ✅ | Unique | Garbage bags |
| images (9).jpg | 66,984 | 554x554 | ✅ | Unique | Dump site |
| images (10).jpg | 22,028 | 400x224 | ✅ | Unique | Low resolution, garbage |
| images (11).jpg | 28,272 | 462x280 | ✅ | Unique | Street litter |
| images (12).jpg | 67,717 | 692x443 | ✅ | Unique | Garbage pile |
| images (13).jpg | 73,631 | 678x452 | ✅ | Unique | Roadside waste |
| images (14).jpg | 56,500 | 335x597 | ✅ | Unique | Vertical composition |
| images (15).jpg | 68,794 | 713x429 | ✅ | **Near-dup of `1500x900_garbage-in-public-places.jpg`** (pHash=0) | Downsampled version |
| images (16).jpg | 97,235 | 678x452 | ✅ | **Near-dup of `images (96).jpg`** (pHash=0) | Same content, slightly different size |
| images (17).jpg | 93,666 | 638x480 | ✅ | Unique | Garbage heap |
| images (18).jpg | 65,107 | 738x414 | ✅ | Unique | Street waste |
| images (19).jpg | 70,715 | 738x414 | ✅ | Unique | Similar to 18 but different |
| images (20).jpg | 59,280 | 630x353 | ✅ | Unique | Garbage bags |
| images (21).jpg | 85,645 | 640x359 | ✅ | **Near-dup of `images (70).jpg`** (pHash=0) | Different resolution |
| images (22).jpg | 91,716 | 738x414 | ✅ | Unique | Large garbage pile |
| images (23).jpg | 104,668 | 738x414 | ✅ | Unique | Dump site |
| images (24).jpg | 74,568 | 679x450 | ✅ | Unique | Roadside garbage |
| images (25).jpg | 82,306 | 638x480 | ✅ | Unique | Waste pile |
| images (26).jpg | 73,005 | 738x384 | ✅ | Unique | Street litter |
| images (27).jpg | 60,516 | 552x362 | ✅ | Unique | Garbage bags |
| images (28).jpg | 77,782 | 738x387 | ✅ | Unique | Dump area |
| images (29).jpg | 87,730 | 708x432 | ✅ | **Near-dup of `images (4).jpg`** (pHash=0) | Same scene |
| images (30).jpg | 69,129 | 549x364 | ✅ | Unique | Garbage on road |
| images (31).jpg | 44,004 | 554x361 | ✅ | Unique | Street waste |
| images (32).jpg | 84,302 | 738x414 | ✅ | Unique | Large pile |
| images (33).jpg | 34,515 | 400x224 | ✅ | Unique | Low resolution |
| images (34).jpg | 60,098 | 399x501 | ✅ | Unique | Vertical garbage |
| images (35).jpg | 19,796 | 349x196 | ✅ | Unique | Very low resolution |
| images (36).jpg | 61,216 | 547x365 | ✅ | Unique | Garbage pile |
| images (37).jpg | 25,051 | 346x280 | ✅ | Unique | Small garbage |
| images (38).jpg | 50,349 | 638x480 | ✅ | Unique | Roadside waste |
| images (39).jpg | 59,685 | 714x430 | ✅ | Unique | Street garbage |
| images (40).jpg | 56,492 | 499x375 | ✅ | Unique | Dump site |
| images (41).jpg | 68,823 | 738x414 | ✅ | Unique | Garbage heap |
| images (42).jpg | 28,274 | 400x224 | ✅ | Unique | Low res garbage |
| images (43).jpg | 18,460 | 346x280 | ✅ | Unique | Very small |
| images (44).jpg | 55,534 | 437x702 | ✅ | Unique | Vertical composition |
| images (45).jpg | 67,334 | 646x475 | ✅ | Unique | Waste pile |
| images (46).jpg | 83,459 | 645x475 | ✅ | Unique | Similar to 45 |
| images (47).jpg | 73,233 | 646x475 | ✅ | Unique | Similar to 45, 46 |
| images (48).jpg | 30,991 | 398x225 | ✅ | Unique | Low resolution |
| images (49).jpg | 85,480 | 672x456 | ✅ | Unique | Garbage pile |
| images (50).jpg | 84,451 | 738x414 | ✅ | **Exact/near-dup of `images (63).jpg`** (SHA-256 match), near-dup of `images (61).jpg` (pHash=0) | Triplicate group |
| images (51).jpg | 63,771 | 480x320 | ✅ | Unique | Street garbage |
| images (52).jpg | 68,357 | 679x450 | ✅ | Unique | Roadside waste |
| images (53).jpg | 47,483 | 640x393 | ✅ | Unique | Garbage bags |
| images (54).jpg | 88,086 | 738x411 | ✅ | Unique | Large dump |
| images (55).jpg | 40,674 | 480x299 | ✅ | Unique | Street litter |
| images (56).jpg | 65,187 | 738x414 | ✅ | Unique | Garbage heap |
| images (57).jpg | 90,477 | 738x414 | ✅ | Unique | Dump site |
| images (58).jpg | 53,258 | 549x364 | ✅ | Unique | Roadside garbage |
| images (59).jpg | 38,022 | 480x267 | ✅ | Unique | Small pile |
| images (60).jpg | 65,125 | 576x378 | ✅ | Unique | Waste bags |
| images (61).jpg | 56,785 | 576x321 | ✅ | **Near-dup of `images (50).jpg`/`images (63).jpg`** (pHash=0) | Same content, different resolution |
| images (62).jpg | 28,689 | 396x225 | ✅ | Unique | Low resolution |
| images (63).jpg | 84,451 | 738x414 | ✅ | **Exact duplicate of `images (50).jpg`** (SHA-256 match) | Byte-for-byte identical |
| images (64).jpg | 59,273 | 738x414 | ✅ | Unique | Similar composition |
| images (65).jpg | 91,937 | 738x414 | ✅ | Unique | Large garbage pile |
| images (66).jpg | 72,571 | 738x414 | ✅ | Unique | Street waste |
| images (67).jpg | 64,171 | 738x414 | ✅ | Unique | Garbage heap |
| images (68).jpg | 44,132 | 399x501 | ✅ | Unique | Vertical garbage |
| images (69).jpg | 85,732 | 376x750 | ✅ | Unique | Vertical composition |
| images (70).jpg | 69,277 | 738x414 | ✅ | **Near-dup of `images (21).jpg`** (pHash=0) | Same content |
| images (71).jpg | 69,578 | 479x640 | ✅ | Unique | Vertical garbage |
| images (72).jpg | 38,556 | 515x388 | ✅ | Unique | Street garbage |
| images (73).jpg | 38,018 | 480x269 | ✅ | Unique | Small pile |
| images (74).jpg | 101,176 | 592x517 | ✅ | Unique | Square composition |
| images (75).jpg | 26,466 | 450x254 | ✅ | Unique | Low resolution |
| images (76).jpg | 75,002 | 738x381 | ✅ | Unique | Roadside dump |
| images (77).jpg | 62,578 | 599x472 | ✅ | Unique | Garbage bags |
| images (78).jpg | 26,396 | 412x260 | ✅ | Unique | Small waste |
| images (79).jpg | 119,617 | 679x450 | ✅ | Unique | Large pile |
| images (80).jpg | 61,678 | 738x414 | ✅ | Unique | Street garbage |
| images (81).jpg | 102,535 | 738x414 | ✅ | Unique | Dump site |
| images (82).jpg | 91,416 | 629x435 | ✅ | Unique | Waste heap |
| images (83).jpg | 68,890 | 645x475 | ✅ | Unique | Similar to 45-47 |
| images (84).jpg | 77,770 | 738x330 | ✅ | Unique | Wide garbage |
| images (85).jpg | 96,482 | 738x414 | ✅ | Unique | Large dump |
| images (86).jpg | 46,559 | 600x315 | ✅ | Unique | Roadside waste |
| images (87).jpg | 67,584 | 646x475 | ✅ | Unique | Similar to 45-47, 83 |
| images (88).jpg | 99,232 | 692x442 | ✅ | Unique | Garbage pile |
| images (89).jpg | 43,707 | 500x333 | ✅ | Unique | Street litter |
| images (90).jpg | 58,100 | 736x416 | ✅ | Unique | Dump area |
| images (91).jpg | 65,123 | 640x359 | ✅ | Unique | Garbage bags |
| images (92).jpg | 109,566 | 738x414 | ✅ | Unique | Large pile |
| images (93).jpg | 76,335 | 738x414 | ✅ | Unique | Street waste |
| images (94).jpg | 55,457 | 640x359 | ✅ | Unique | Similar to 91 |
| images (95).jpg | 115,536 | 638x480 | ✅ | Unique | Garbage heap |
| images (96).jpg | 96,440 | 678x452 | ✅ | **Near-dup of `images (16).jpg`** (pHash=0) | Same content |
| images (97).jpg | 107,063 | 723x423 | ✅ | Unique | Dump site |
| images (98).jpg | 75,873 | 738x411 | ✅ | Unique | Roadside garbage |
| images (99).jpg | 101,448 | 658x412 | ✅ | Unique | Waste pile |
| images (100).jpg | 76,214 | 691x444 | ✅ | Unique | Garbage on street |
| this-is-what-our-roads-have-come-to-piles-of-garbage-zero-v0-12zmhd9az06f1.jpg | 2,457,720 | 3024x4032 | ✅ | Unique | Very high-res, clear garbage piles |

---

## Duplicate Analysis

### Exact Duplicates (SHA-256 match)
| File 1 | File 2 | Notes |
|--------|--------|-------|
| `images (50).jpg` | `images (63).jpg` | Byte-for-byte identical (84,451 bytes, 738x414) |

### Near-Duplicates (pHash distance = 0)
These are visually identical but different resolutions/compressions:

| Group | Files | Notes |
|-------|-------|-------|
| 1 | `1500x900_garbage-in-public-places.jpg`, `images (15).jpg` | Original high-res + downsampled version |
| 2 | `images (16).jpg`, `images (96).jpg` | Same content, 678x452 vs 678x452 (slight size diff) |
| 3 | `images (2).jpg`, `images (5).jpg` | 548x364 vs 500x333 |
| 4 | `images (21).jpg`, `images (70).jpg` | 640x359 vs 738x414 |
| 5 | `images (29).jpg`, `images (4).jpg` | 708x432 vs 710x432 |
| 6 | `images (50).jpg`, `images (61).jpg`, `images (63).jpg` | Triplicate group - same visual content |

**Total unique visual content: ~94 images** (105 - 11 duplicates = 94)

---

## Semantic Suitability Assessment

### ✅ Clearly Suitable (Garbage Piles / Waste Visible)
- `1500x900_garbage-in-public-places.jpg` - Clear garbage piles in public area
- `4CE458C200000578-5802189-image-a-49_1528118838560.jpg` - Street garbage
- `garbage-being-dumped-and-stored-in-a-vacant-downtown-city-lot-in-varanasi-india-which-raises-issues-of-waste-management-and-public-health-2A1CT23.jpg` - Clear dump site
- `images (1).jpg`, `(3).jpg`, `(6).jpg`, `(7).jpg`, `(8).jpg`, `(9).jpg`, `(10).jpg`, `(11).jpg`, `(12).jpg`, `(13).jpg`, `(14).jpg`, `(17).jpg`, `(18).jpg`, `(19).jpg`, `(20).jpg`, `(22).jpg`, `(23).jpg`, `(24).jpg`, `(25).jpg`, `(26).jpg`, `(27).jpg`, `(28).jpg`, `(30).jpg`, `(31).jpg`, `(32).jpg`, `(34).jpg`, `(36).jpg`, `(38).jpg`, `(39).jpg`, `(40).jpg`, `(41).jpg`, `(44).jpg`, `(45).jpg`, `(46).jpg`, `(47).jpg`, `(49).jpg`, `(51).jpg`, `(52).jpg`, `(53).jpg`, `(54).jpg`, `(55).jpg`, `(56).jpg`, `(57).jpg`, `(58).jpg`, `(59).jpg`, `(60).jpg`, `(64).jpg`, `(65).jpg`, `(66).jpg`, `(67).jpg`, `(68).jpg`, `(69).jpg`, `(71).jpg`, `(72).jpg`, `(73).jpg`, `(74).jpg`, `(76).jpg`, `(77).jpg`, `(78).jpg`, `(79).jpg`, `(80).jpg`, `(81).jpg`, `(82).jpg`, `(84).jpg`, `(85).jpg`, `(86).jpg`, `(88).jpg`, `(89).jpg`, `(90).jpg`, `(91).jpg`, `(92).jpg`, `(93).jpg`, `(94).jpg`, `(95).jpg`, `(97).jpg`, `(98).jpg`, `(99).jpg`, `(100).jpg`, `this-is-what-our-roads-have-come-to-piles-of-garbage-zero-v0-12zmhd9az06f1.jpg`

**Count: ~85 clearly suitable**

### ⚠️ Marginal / Low Quality
- `images (33).jpg` (400x224) - Very low resolution
- `images (35).jpg` (349x196) - Very low resolution
- `images (37).jpg` (346x280) - Low resolution
- `images (42).jpg` (400x224) - Low resolution
- `images (43).jpg` (346x280) - Very low resolution
- `images (48).jpg` (398x225) - Low resolution
- `images (62).jpg` (396x225) - Low resolution
- `images (75).jpg` (450x254) - Low resolution

**Count: 8 marginal (low resolution, may not train well)**

### ❌ Potential Concerns
- **Source provenance unknown** - Many files named `images (N).jpg` suggest bulk download from search engines
- **Possible copyright/license issues** - Web-sourced images may not be licensed for ML training
- **Geographic bias** - Several images appear to be from India (Varanasi filename), may not generalize
- **Class consistency** - All appear to be "garbage pile" but some show scattered litter vs. consolidated piles

---

## Annotation Status

| Status | Count |
|--------|-------|
| Annotated (YOLO .txt labels exist) | **0** |
| Ready for annotation (valid, unique, suitable) | ~85 |
| Need review (marginal quality) | 8 |
| Duplicates (should be excluded) | 12 |

---

## Recommendations

1. **Remove exact duplicate**: Delete `images (63).jpg` (keep `images (50).jpg`)
2. **Remove near-duplicates**: Keep highest resolution from each group:
   - Keep `1500x900_garbage-in-public-places.jpg` (1500x900), remove `images (15).jpg`
   - Keep `images (16).jpg` (678x452), remove `images (96).jpg`
   - Keep `images (2).jpg` (548x364), remove `images (5).jpg`
   - Keep `images (21).jpg` (640x359), remove `images (70).jpg`
   - Keep `images (29).jpg` (708x432), remove `images (4).jpg`
   - From triplicate: keep `images (50).jpg` (738x414), remove `images (61).jpg` and `images (63).jpg`
3. **Review low-resolution images**: Consider excluding 8 marginal images (< 400px min dimension)
4. **Manual annotation required**: All ~85 suitable images need YOLO format labels (class_id=1)
5. **License verification**: Verify usage rights for web-sourced images before training

---

## Proposed Final Dataset Structure

```
civicshield-dataset/processed/garbage_yolo/
├── images/
│   ├── train/
│   ├── val/
│   └── test/
└── labels/
    ├── train/
    ├── val/
    └── test/
```

Class mapping: `garbage_pile` → class_id = 1