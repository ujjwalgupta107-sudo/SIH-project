import uuid
from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, Index, JSON
from sqlalchemy.types import TypeDecorator
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geography
from .database import Base
def uid(): return str(uuid.uuid4())
class GeographicPoint(TypeDecorator):
    """Geography on PostgreSQL; text-only test representation elsewhere."""
    impl=String; cache_ok=True
    def load_dialect_impl(self,dialect):
        return dialect.type_descriptor(Geography(geometry_type='POINT',srid=4326,spatial_index=False) if dialect.name=='postgresql' else String(128))
class User(Base):
    __tablename__='users'; id:Mapped[str]=mapped_column(String,primary_key=True,default=uid); email:Mapped[str]=mapped_column(String,unique=True); role:Mapped[str]=mapped_column(String,default='CITIZEN'); created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
class Department(Base):
    __tablename__='departments'; id:Mapped[str]=mapped_column(String,primary_key=True,default=uid); name:Mapped[str]=mapped_column(String,unique=True); code:Mapped[str]=mapped_column(String,unique=True)
class Incident(Base):
    __tablename__='incidents'; id:Mapped[str]=mapped_column(String,primary_key=True,default=uid); citizen_id:Mapped[str|None]=mapped_column(ForeignKey('users.id'),nullable=True); type:Mapped[str]=mapped_column(String(100)); description:Mapped[str]=mapped_column(Text); latitude:Mapped[float]=mapped_column(Float); longitude:Mapped[float]=mapped_column(Float); location:Mapped[object]=mapped_column(GeographicPoint()); location_accuracy:Mapped[float|None]=mapped_column(Float,nullable=True); address:Mapped[str]=mapped_column(String(500)); severity:Mapped[int]=mapped_column(Integer); confidence:Mapped[float]=mapped_column(Float); risk_level:Mapped[str]=mapped_column(String(20)); department:Mapped[str]=mapped_column(String(100)); status:Mapped[str]=mapped_column(String(40),default='REPORTED'); idempotency_key:Mapped[str|None]=mapped_column(String(100),unique=True,index=True,nullable=True); created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow); updated_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow,onupdate=datetime.utcnow)
    __table_args__=(Index('ix_incidents_location_gist','location',postgresql_using='gist'),Index('ix_incidents_status','status'),Index('ix_incidents_department','department'),Index('ix_incidents_created_at','created_at'))
class AIAssessment(Base):
    __tablename__='ai_assessments'; id:Mapped[str]=mapped_column(String,primary_key=True,default=uid); incident_id:Mapped[str]=mapped_column(ForeignKey('incidents.id',ondelete='CASCADE'),unique=True); mode:Mapped[str]=mapped_column(String(20)); provider:Mapped[str]=mapped_column(String(100)); payload:Mapped[dict]=mapped_column(JSON); created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
class IncidentMedia(Base):
    __tablename__='incident_media'; id:Mapped[str]=mapped_column(String,primary_key=True,default=uid); incident_id:Mapped[str]=mapped_column(ForeignKey('incidents.id')); storage_key:Mapped[str]=mapped_column(String,unique=True); mime_type:Mapped[str]=mapped_column(String(100)); size_bytes:Mapped[int]=mapped_column(Integer); thumbnail_key:Mapped[str|None]=mapped_column(String,nullable=True); stage:Mapped[str]=mapped_column(String,default='BEFORE')
class Assignment(Base):
    __tablename__='assignments'; id:Mapped[str]=mapped_column(String,primary_key=True,default=uid); incident_id:Mapped[str]=mapped_column(ForeignKey('incidents.id')); department_id:Mapped[str|None]=mapped_column(ForeignKey('departments.id'),nullable=True); officer_id:Mapped[str|None]=mapped_column(ForeignKey('users.id'),nullable=True); status:Mapped[str]=mapped_column(String,default='PENDING')
class AuditLog(Base):
    __tablename__='audit_logs'; id:Mapped[str]=mapped_column(String,primary_key=True,default=uid); actor_id:Mapped[str|None]=mapped_column(ForeignKey('users.id'),nullable=True); action:Mapped[str]=mapped_column(String); entity_type:Mapped[str]=mapped_column(String); entity_id:Mapped[str]=mapped_column(String); created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
