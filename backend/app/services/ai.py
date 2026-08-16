"""AI Analysis Service - Provider-independent analysis seam.

Supports both development mode (text-based) and production mode (ML-based).
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from ..schemas import AIAnalysis, AnalysisResponse, RiskAssessment, DepartmentAssignment, DuplicateInformation, Detection
from .severity import calculate_severity, classify_risk_level, assign_department, get_primary_class, build_ai_analysis


class VisionService(ABC):
    @abstractmethod
    def classify(self, description: str, detections: Optional[List[Detection]] = None, image_width: int = 640, image_height: int = 640) -> AIAnalysis:
        ...


class DevelopmentVisionService(VisionService):
    """Fallback for development - uses text description only."""
    def classify(self, description: str, detections: Optional[List[Detection]] = None, image_width: int = 640, image_height: int = 640) -> AIAnalysis:
        # If we have real ML detections, use them even in development
        if detections:
            return build_ai_analysis(detections, image_width, image_height)
        
        # Fallback to text-based heuristic
        keyword = 'water' if 'water' in description.lower() else 'pothole'
        return AIAnalysis(
            classification=keyword,
            confidence=0.86,
            severity_score=72,
            risk_level='HIGH',
            explanation=['Development adapter result — no ML model is connected', 'Description indicates a potential public-safety issue']
        )


class ProductionVisionService(VisionService):
    """Production vision service using real ML detections."""
    def classify(self, description: str, detections: Optional[List[Detection]] = None, image_width: int = 640, image_height: int = 640) -> AIAnalysis:
        if detections:
            return build_ai_analysis(detections, image_width, image_height)
        
        # Fallback if no detections provided
        return AIAnalysis(
            classification="none",
            confidence=0.0,
            severity_score=0,
            risk_level="LOW",
            explanation=["No ML detections available for analysis."]
        )


class RiskService(ABC):
    @abstractmethod
    def assess(self, analysis: AIAnalysis) -> RiskAssessment:
        ...


class DevelopmentRiskService(RiskService):
    def assess(self, analysis: AIAnalysis) -> RiskAssessment:
        return RiskAssessment(score=analysis.severity_score, level=analysis.risk_level, factors=analysis.explanation)


class ProductionRiskService(RiskService):
    def assess(self, analysis: AIAnalysis) -> RiskAssessment:
        return RiskAssessment(score=analysis.severity_score, level=analysis.risk_level, factors=analysis.explanation)


class DuplicateDetectionService(ABC):
    @abstractmethod
    def find(self, incident_id: str) -> DuplicateInformation:
        ...


class DevelopmentDuplicateService(DuplicateDetectionService):
    def find(self, incident_id: str) -> DuplicateInformation:
        return DuplicateInformation(count=0, duplicate_of=None)


class ProductionDuplicateService(DuplicateDetectionService):
    def find(self, incident_id: str) -> DuplicateInformation:
        # TODO: Implement actual duplicate detection using database
        return DuplicateInformation(count=0, duplicate_of=None)


class IncidentAnalysisService:
    def __init__(
        self,
        vision: VisionService | None = None,
        risk: RiskService | None = None,
        duplicates: DuplicateDetectionService | None = None,
        production_mode: bool = False
    ):
        self.production_mode = production_mode
        self.vision = vision or (ProductionVisionService() if production_mode else DevelopmentVisionService())
        self.risk = risk or (ProductionRiskService() if production_mode else DevelopmentRiskService())
        self.duplicates = duplicates or (ProductionDuplicateService() if production_mode else DevelopmentDuplicateService())

    def analyze(
        self,
        incident_id: str,
        description: str,
        detections: Optional[List[Detection]] = None,
        image_width: int = 640,
        image_height: int = 640
    ) -> AnalysisResponse:
        analysis = self.vision.classify(description, detections, image_width, image_height)
        mode = 'production' if self.production_mode else 'development'
        provider = 'real-ml-inference' if self.production_mode else 'development-deterministic-adapter'
        
        return AnalysisResponse(
            mode=mode,
            provider=provider,
            analysis=analysis,
            risk=self.risk.assess(analysis),
            assignment=DepartmentAssignment(
                department=assign_department(analysis.classification),
                recommended_action=self._get_recommended_action(analysis)
            ),
            duplicates=self.duplicates.find(incident_id)
        )

    def _get_recommended_action(self, analysis: AIAnalysis) -> str:
        actions = {
            "pothole": "Schedule road repair within 48 hours. Deploy warning signs immediately.",
            "waterlogging": "Clear drainage blockage immediately. Deploy pumps if flooding persists.",
            "water": "Clear drainage blockage immediately. Deploy pumps if flooding persists.",
            "none": "No action required. Image does not contain detected civic issues.",
        }
        return actions.get(analysis.classification, "Assess and route to appropriate department.")