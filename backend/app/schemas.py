from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Literal
Risk=Literal['LOW','MEDIUM','HIGH','CRITICAL']; Status=Literal['REPORTED','ASSESSED','ASSIGNED','IN_PROGRESS','RESOLVED','AWAITING_VERIFICATION']
class Location(BaseModel): latitude:float=Field(ge=-90,le=90); longitude:float=Field(ge=-180,le=180); address:str=Field(min_length=2,max_length=500); accuracy:float|None=None
class AIAnalysis(BaseModel): classification:str; confidence:float=Field(ge=0,le=1); severity_score:int=Field(ge=0,le=100); risk_level:Risk; duplicate_of:str|None=None; explanation:list[str]=[]
class RiskAssessment(BaseModel): score:int=Field(ge=0,le=100); level:Risk; factors:list[str]
class DepartmentAssignment(BaseModel): department:str; recommended_action:str
class DuplicateInformation(BaseModel): count:int=Field(ge=0); duplicate_of:str|None=None
class AnalysisResponse(BaseModel): mode:Literal['development','production']; provider:str; analysis:AIAnalysis; risk:RiskAssessment; assignment:DepartmentAssignment; duplicates:DuplicateInformation
class UploadURLRequest(BaseModel): mime_type:str; size_bytes:int
class UploadURLResponse(BaseModel): storage_key:str; upload_url:str; expires_in:int
class IncidentMediaCreate(BaseModel): storage_key:str; type:str=Field(default='BEFORE')
class IncidentCreate(BaseModel): type:str=Field(min_length=2,max_length=100); description:str=Field(min_length=3,max_length=4000); location:Location; media:list[IncidentMediaCreate]=[]; ai_analysis:AIAnalysis|None=None
class IncidentUpdate(BaseModel): status:Status|None=None; department:str|None=None; severity:int|None=Field(default=None,ge=0,le=100)
class IncidentRead(BaseModel):
    model_config=ConfigDict(from_attributes=True); id:str; type:str; description:str; latitude:float; longitude:float; address:str; severity:int; confidence:float; risk_level:Risk; department:str; status:Status; created_at:datetime; updated_at:datetime
class DepartmentRead(BaseModel): model_config=ConfigDict(from_attributes=True); id:str; name:str; code:str
class TokenPayload(BaseModel): sub:str; role:Literal['CITIZEN','OFFICER','OPERATOR','ADMIN']
