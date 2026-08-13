"""Provider-independent Phase 1 analysis seam. This is not ML inference."""
from abc import ABC, abstractmethod
from ..schemas import AIAnalysis, AnalysisResponse, RiskAssessment, DepartmentAssignment, DuplicateInformation
class VisionService(ABC):
    @abstractmethod
    def classify(self, description:str)->AIAnalysis: ...
class DevelopmentVisionService(VisionService):
    def classify(self, description:str)->AIAnalysis:
        keyword='water' if 'water' in description.lower() else 'road_damage'
        return AIAnalysis(classification=keyword,confidence=.86,severity_score=72,risk_level='HIGH',explanation=['Development adapter result — no ML model is connected','Description indicates a potential public-safety issue'])
class RiskService(ABC):
    @abstractmethod
    def assess(self,analysis:AIAnalysis)->RiskAssessment: ...
class DevelopmentRiskService(RiskService):
    def assess(self,analysis:AIAnalysis)->RiskAssessment:return RiskAssessment(score=analysis.severity_score,level=analysis.risk_level,factors=analysis.explanation)
class DuplicateDetectionService(ABC):
    @abstractmethod
    def find(self,incident_id:str)->DuplicateInformation: ...
class DevelopmentDuplicateService(DuplicateDetectionService):
    def find(self,incident_id:str)->DuplicateInformation:return DuplicateInformation(count=0,duplicate_of=None)
class IncidentAnalysisService:
    def __init__(self,vision:VisionService|None=None,risk:RiskService|None=None,duplicates:DuplicateDetectionService|None=None): self.vision=vision or DevelopmentVisionService();self.risk=risk or DevelopmentRiskService();self.duplicates=duplicates or DevelopmentDuplicateService()
    def analyze(self,incident_id:str,description:str)->AnalysisResponse:
        analysis=self.vision.classify(description)
        return AnalysisResponse(mode='development',provider='development-deterministic-adapter',analysis=analysis,risk=self.risk.assess(analysis),assignment=DepartmentAssignment(department='PWD',recommended_action='Inspect and secure the site within the SLA.'),duplicates=self.duplicates.find(incident_id))
