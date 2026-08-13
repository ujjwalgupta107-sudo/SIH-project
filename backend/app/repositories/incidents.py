from sqlalchemy.orm import Session
from ..models import Incident
from ..schemas import IncidentCreate, IncidentUpdate
class IncidentRepository:
    def list(self,db:Session): return db.query(Incident).order_by(Incident.created_at.desc()).all()
    def get(self,db:Session,id:str): return db.get(Incident,id)
    def create(self,db:Session,data:IncidentCreate):
        ai=data.ai_analysis
        item=Incident(type=data.type,description=data.description,latitude=data.location.latitude,longitude=data.location.longitude,location=f'POINT({data.location.longitude} {data.location.latitude})',address=data.location.address,severity=ai.severity_score if ai else 0,confidence=ai.confidence if ai else 0,risk_level=ai.risk_level if ai else 'LOW',department='Unassigned',status='REPORTED')
        db.add(item); db.commit(); db.refresh(item); return item
    def update(self,db:Session,item:Incident,data:IncidentUpdate):
        for k,v in data.model_dump(exclude_none=True).items(): setattr(item,k,v)
        db.commit(); db.refresh(item); return item
