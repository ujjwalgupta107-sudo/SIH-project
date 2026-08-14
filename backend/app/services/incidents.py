from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..repositories.incidents import IncidentRepository
from ..schemas import IncidentCreate,IncidentUpdate
from .ai import IncidentAnalysisService
class IncidentService:
    def __init__(self): self.repo=IncidentRepository(); self.analysis=IncidentAnalysisService()
    def create(self,db:Session,data:IncidentCreate,user=None,idempotency_key:str=None):
        return self.repo.create(db,data,citizen_id=user.sub if user else None,idempotency_key=idempotency_key)
    def get(self,db:Session,id:str,user=None):
        item=self.repo.get(db,id)
        if not item: raise HTTPException(404,'Incident not found')
        if user and user.role == 'CITIZEN' and item.citizen_id != user.sub: raise HTTPException(403,'Not authorized to view this incident')
        return item
    def list(self,db:Session): return self.repo.list(db)
    def get_nearby(self,db:Session,lat:float,lng:float,radius:float=500): return self.repo.get_nearby(db,lat,lng,radius)
    def update(self,db:Session,id:str,data:IncidentUpdate,user=None): return self.repo.update(db,self.get(db,id,user=user),data)
    def analyze(self,db:Session,id:str):
        incident=self.get(db,id)
        return self.analysis.analyze(incident.id,incident.description)
