from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Literal, Optional

Risk = Literal['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
Status = Literal['REPORTED', 'ASSESSED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'AWAITING_VERIFICATION']
NotificationStatus = Literal['PENDING', 'SENT', 'FAILED', 'SKIPPED']

# ── Auth ─────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str

class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    role: str
    display_name: Optional[str] = None

class LoginResponse(BaseModel):
    token: str
    user: UserRead

class TokenPayload(BaseModel):
    sub: str
    role: Literal['CITIZEN', 'AUTHORITY', 'OFFICER', 'OPERATOR', 'ADMIN']

# ── ML ────────────────────────────────────────────────────────────────────────
class BBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float

class Detection(BaseModel):
    class_id: int
    class_name: str
    confidence: float
    bbox: BBox

class PredictResponse(BaseModel):
    detections: list[Detection]

# ── Core Schemas ─────────────────────────────────────────────────────────────
class Location(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    address: str = Field(min_length=2, max_length=500)
    accuracy: float | None = None

class AIAnalysis(BaseModel):
    classification: str
    confidence: float = Field(ge=0, le=1)
    severity_score: int = Field(ge=0, le=100)
    risk_level: Risk
    duplicate_of: str | None = None
    explanation: list[str] = []

class RiskAssessment(BaseModel):
    score: int = Field(ge=0, le=100)
    level: Risk
    factors: list[str]

class DepartmentAssignment(BaseModel):
    department: str
    recommended_action: str

class DuplicateInformation(BaseModel):
    count: int = Field(ge=0)
    duplicate_of: str | None = None

class AnalysisResponse(BaseModel):
    mode: Literal['development', 'production']
    provider: str
    analysis: AIAnalysis
    risk: RiskAssessment
    assignment: DepartmentAssignment
    duplicates: DuplicateInformation

# ── Media ─────────────────────────────────────────────────────────────────────
class UploadURLRequest(BaseModel):
    mime_type: str
    size_bytes: int

class UploadURLResponse(BaseModel):
    storage_key: str
    upload_url: str
    expires_in: int

class IncidentMediaCreate(BaseModel):
    storage_key: str
    type: str = Field(default='BEFORE')

# ── Incidents ─────────────────────────────────────────────────────────────────
class IncidentCreate(BaseModel):
    type: str = Field(min_length=2, max_length=100)
    description: str = Field(min_length=3, max_length=4000)
    location: Location
    media: list[IncidentMediaCreate] = []
    ai_analysis: AIAnalysis | None = None
    ml_detections: list[Detection] | None = None

class IncidentUpdate(BaseModel):
    status: Status | None = None
    department: str | None = None
    severity: int | None = Field(default=None, ge=0, le=100)
    notification_status: NotificationStatus | None = None

class IncidentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    type: str
    description: str
    latitude: float
    longitude: float
    address: str
    city: Optional[str] = None
    authority: Optional[str] = None
    severity: int
    confidence: float
    risk_level: Risk
    department: str
    status: Status
    notification_status: str = 'PENDING'
    citizen_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class DepartmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    code: str
