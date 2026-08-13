from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..repositories.incidents import IncidentRepository
from ..schemas import IncidentCreate,IncidentUpdate
from .ai import IncidentAnalysisService
class IncidentService:
    def __init__(self): self.repo=IncidentRepository(); self.analysis=IncidentAnalysisService()
    def create(self,db:Session,data:IncidentCreate):
        return self.repo.create(db,data)
    def get(self,db:Session,id:str):
        item=self.repo.get(db,id)
        if not item: raise HTTPException(404,'Incident not found')
        return item
    def list(self,db:Session): return self.repo.list(db)
    def update(self,db:Session,id:str,data:IncidentUpdate): return self.repo.update(db,self.get(db,id),data)
    def analyze(self,db:Session,id:str):
        incident=self.get(db,id)
        return self.analysis.analyze(incident.id,incident.description)
