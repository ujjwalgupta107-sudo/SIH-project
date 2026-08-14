from sqlalchemy.orm import Session
from ..models import Incident, IncidentMedia
from ..schemas import IncidentCreate, IncidentUpdate
class IncidentRepository:
    def list(self,db:Session): return db.query(Incident).order_by(Incident.created_at.desc()).all()
    def get(self,db:Session,id:str): return db.get(Incident,id)
    def create(self,db:Session,data:IncidentCreate,citizen_id:str=None,idempotency_key:str=None):
        if idempotency_key:
            existing=db.query(Incident).filter(Incident.idempotency_key==idempotency_key).first()
            if existing: return existing
        ai=data.ai_analysis
        item=Incident(citizen_id=citizen_id,type=data.type,description=data.description,latitude=data.location.latitude,longitude=data.location.longitude,location=f'POINT({data.location.longitude} {data.location.latitude})',location_accuracy=data.location.accuracy,address=data.location.address,severity=ai.severity_score if ai else 0,confidence=ai.confidence if ai else 0,risk_level=ai.risk_level if ai else 'LOW',department='Unassigned',status='REPORTED',idempotency_key=idempotency_key)
        db.add(item); db.commit(); db.refresh(item)
        for m in data.media:
            db.add(IncidentMedia(incident_id=item.id, storage_key=m.storage_key, mime_type='image/jpeg', size_bytes=0, stage=m.type))
        db.commit()
        return item
    def get_nearby(self,db:Session,lat:float,lng:float,radius_m:float=500):
        from geoalchemy2.functions import ST_DWithin
        from sqlalchemy import cast
        from geoalchemy2 import Geography
        point = f'POINT({lng} {lat})'
        return db.query(Incident).filter(ST_DWithin(Incident.location, cast(point, Geography), radius_m)).all()
    def update(self,db:Session,item:Incident,data:IncidentUpdate):
        for k,v in data.model_dump(exclude_none=True).items(): setattr(item,k,v)
        db.commit(); db.refresh(item); return item
