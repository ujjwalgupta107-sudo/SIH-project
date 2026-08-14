from fastapi import APIRouter,Depends,status,Header
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import IncidentCreate,IncidentRead,IncidentUpdate,AnalysisResponse
from ..services.auth import require_roles
from ..services.incidents import IncidentService
router=APIRouter(prefix='/incidents',tags=['incidents']); service=IncidentService()
@router.post('',response_model=IncidentRead,status_code=status.HTTP_201_CREATED)
def create(data:IncidentCreate,db:Session=Depends(get_db),idempotency_key:str|None=Header(default=None),user=Depends(require_roles('CITIZEN','OFFICER','OPERATOR','ADMIN'))): return service.create(db,data,user,idempotency_key)
@router.get('/nearby',response_model=list[IncidentRead])
def get_nearby(lat:float,lng:float,radius:float=500,db:Session=Depends(get_db)): return service.get_nearby(db,lat,lng,radius)
@router.get('',response_model=list[IncidentRead])
def list_all(db:Session=Depends(get_db),_user=Depends(require_roles('OFFICER','OPERATOR','ADMIN'))): return service.list(db)
@router.get('/{incident_id}',response_model=IncidentRead)
def get_one(incident_id:str,db:Session=Depends(get_db),user=Depends(require_roles('CITIZEN','OFFICER','OPERATOR','ADMIN'))): return service.get(db,incident_id,user)
@router.post('/{incident_id}/analyze',response_model=AnalysisResponse)
def analyze(incident_id:str,db:Session=Depends(get_db),_user=Depends(require_roles('CITIZEN','OFFICER','OPERATOR','ADMIN'))): return service.analyze(db,incident_id)
@router.patch('/{incident_id}',response_model=IncidentRead)
def update(incident_id:str,data:IncidentUpdate,db:Session=Depends(get_db),user=Depends(require_roles('OFFICER','OPERATOR','ADMIN'))): return service.update(db,incident_id,data,user)
