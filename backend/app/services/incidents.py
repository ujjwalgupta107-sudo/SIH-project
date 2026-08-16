from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..repositories.incidents import IncidentRepository
from ..schemas import IncidentCreate, IncidentUpdate, Detection
from ..services.ai import IncidentAnalysisService, ProductionVisionService, ProductionRiskService, ProductionDuplicateService, DevelopmentVisionService, DevelopmentRiskService, DevelopmentDuplicateService
from ..models import Incident, IncidentMedia, AIAssessment
from typing import List, Optional
from datetime import datetime


class IncidentService:
    def __init__(self):
        self.repo = IncidentRepository()
        self.analysis = IncidentAnalysisService(
            vision=ProductionVisionService(),
            risk=ProductionRiskService(),
            duplicates=ProductionDuplicateService(),
            production_mode=True
        )

    def create(
        self,
        db: Session,
        data: IncidentCreate,
        user=None,
        idempotency_key: str = None,
        ml_detections: List[Detection] = None
    ):
        if idempotency_key:
            existing = db.query(Incident).filter(Incident.idempotency_key == idempotency_key).first()
            if existing:
                return existing

        # Run real ML-based analysis if detections provided
        if ml_detections:
            ai_analysis = self.analysis.analyze(
                incident_id='',
                description=data.description,
                detections=ml_detections,
                image_width=640,
                image_height=640
            )
            ai = ai_analysis.analysis
        else:
            ai = data.ai_analysis

        # Resolve city and authority via geocoding (best-effort, non-blocking)
        city = None
        authority = None
        try:
            from ..services.geocoding import reverse_geocode
            from ..services.authority_resolver import resolve_authority
            geo = reverse_geocode(data.location.latitude, data.location.longitude)
            city = geo.get('city') or geo.get('town') or geo.get('state_district') or geo.get('state')
            primary_class = ml_detections[0].class_name if ml_detections else (ai.classification if ai else 'unknown')
            authority = resolve_authority(city, primary_class)
        except Exception as e:
            print(f'[geocoding] Non-fatal error: {e}')

        item = Incident(
            citizen_id=(user.sub if user else None),
            type=data.type,
            description=data.description,
            latitude=data.location.latitude,
            longitude=data.location.longitude,
            location=f'POINT({data.location.longitude} {data.location.latitude})',
            location_accuracy=data.location.accuracy,
            address=data.location.address,
            city=city,
            authority=authority,
            severity=ai.severity_score if ai else 0,
            confidence=ai.confidence if ai else 0,
            risk_level=ai.risk_level if ai else 'LOW',
            department=authority or 'Unassigned',
            status='REPORTED',
            notification_status='PENDING',
            idempotency_key=idempotency_key
        )
        db.add(item)
        db.commit()
        db.refresh(item)

        # Store AI assessment with full detections payload
        if ml_detections:
            ai_assessment = AIAssessment(
                incident_id=item.id,
                mode='production',
                provider='real-ml-inference',
                payload={
                    'detections': [d.model_dump() for d in ml_detections],
                    'severity_score': ai.severity_score,
                    'risk_level': ai.risk_level,
                    'classification': ai.classification,
                    'confidence': ai.confidence,
                    'explanation': ai.explanation,
                    'department': ai_analysis.assignment.department,
                    'recommended_action': ai_analysis.assignment.recommended_action,
                },
                created_at=datetime.utcnow()
            )
        else:
            ai_assessment = AIAssessment(
                incident_id=item.id,
                mode='development',
                provider='development-deterministic-adapter',
                payload={},
                created_at=datetime.utcnow()
            )

        db.add(ai_assessment)

        for m in data.media:
            db.add(IncidentMedia(
                incident_id=item.id,
                storage_key=m.storage_key,
                mime_type='image/jpeg',
                size_bytes=0,
                stage=m.type
            ))
        db.commit()

        # Fire-and-forget email notification (best-effort)
        try:
            from ..services.email import send_incident_notification
            import asyncio
            asyncio.create_task(send_incident_notification(item))
        except Exception as e:
            print(f'[email] Non-fatal notification error: {e}')

        return item

    def get(self, db: Session, id: str, user=None):
        item = self.repo.get(db, id)
        if not item:
            raise HTTPException(404, 'Incident not found')
        if user and user.role == 'CITIZEN' and item.citizen_id != user.sub:
            raise HTTPException(403, 'Not authorized to view this incident')
        return item

    def list(self, db: Session):
        return self.repo.list(db)

    def list_by_citizen(self, db: Session, citizen_id: str):
        """Return all incidents submitted by a specific citizen."""
        return db.query(Incident).filter(Incident.citizen_id == citizen_id).order_by(Incident.created_at.desc()).all()

    def get_nearby(self, db: Session, lat: float, lng: float, radius: float = 500):
        return self.repo.get_nearby(db, lat, lng, radius)

    def update(self, db: Session, id: str, data: IncidentUpdate, user=None):
        return self.repo.update(db, self.get(db, id, user=user), data)

    def analyze(self, db: Session, id: str):
        incident = self.get(db, id)
        dev_analysis = IncidentAnalysisService(
            vision=DevelopmentVisionService(),
            risk=DevelopmentRiskService(),
            duplicates=DevelopmentDuplicateService(),
            production_mode=False
        )
        return dev_analysis.analyze(incident.id, incident.description)