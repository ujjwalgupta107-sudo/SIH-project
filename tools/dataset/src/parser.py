import xml.etree.ElementTree as ET
from pathlib import Path
from typing import List, Dict, Any, Optional

def parse_pascal_voc(xml_path: Path, target_class: str) -> Optional[Dict[str, Any]]:
    """
    Parses a PASCAL VOC XML file and extracts bounding boxes matching target_class.
    Returns None if no matching class is found or if the XML is malformed.
    """
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()
        
        size = root.find("size")
        if size is None:
            return None
        
        width_elem = size.find("width")
        height_elem = size.find("height")
        
        if width_elem is None or height_elem is None:
            return None
            
        width = int(width_elem.text)
        height = int(height_elem.text)
        
        if width <= 0 or height <= 0:
            return None
            
        bboxes = []
        for obj in root.findall("object"):
            name = obj.find("name")
            if name is None or name.text != target_class:
                continue
                
            bndbox = obj.find("bndbox")
            if bndbox is None:
                continue
                
            try:
                xmin = float(bndbox.find("xmin").text)
                ymin = float(bndbox.find("ymin").text)
                xmax = float(bndbox.find("xmax").text)
                ymax = float(bndbox.find("ymax").text)
                bboxes.append({
                    "xmin": xmin,
                    "ymin": ymin,
                    "xmax": xmax,
                    "ymax": ymax
                })
            except (ValueError, AttributeError, TypeError):
                continue
                
        if not bboxes:
            return None
            
        return {
            "width": width,
            "height": height,
            "bboxes": bboxes
        }
        
    except ET.ParseError:
        return None
    except Exception:
        return None
