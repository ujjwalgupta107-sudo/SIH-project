"""phase2 media idempotency

Revision ID: 0003_phase2_media
Revises:
Create Date: 2026-08-15 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0003_phase2_media'
down_revision = None # replace with actual down revision if known
branch_labels = None
depends_on = None

def upgrade():
    # Incidents table modifications
    op.add_column('incidents', sa.Column('idempotency_key', sa.String(length=100), nullable=True))
    op.add_column('incidents', sa.Column('location_accuracy', sa.Float(), nullable=True))
    op.create_index(op.f('ix_incidents_idempotency_key'), 'incidents', ['idempotency_key'], unique=True)

    # IncidentMedia table modifications
    op.add_column('incident_media', sa.Column('storage_key', sa.String(), nullable=True))
    op.add_column('incident_media', sa.Column('mime_type', sa.String(length=100), nullable=True))
    op.add_column('incident_media', sa.Column('size_bytes', sa.Integer(), nullable=True))
    op.add_column('incident_media', sa.Column('thumbnail_key', sa.String(), nullable=True))
    op.drop_column('incident_media', 'url')
    op.drop_column('incident_media', 'media_type')

def downgrade():
    # Revert IncidentMedia
    op.add_column('incident_media', sa.Column('media_type', sa.VARCHAR(), autoincrement=False, nullable=False))
    op.add_column('incident_media', sa.Column('url', sa.VARCHAR(), autoincrement=False, nullable=False))
    op.drop_column('incident_media', 'thumbnail_key')
    op.drop_column('incident_media', 'size_bytes')
    op.drop_column('incident_media', 'mime_type')
    op.drop_column('incident_media', 'storage_key')

    # Revert Incidents
    op.drop_index(op.f('ix_incidents_idempotency_key'), table_name='incidents')
    op.drop_column('incidents', 'location_accuracy')
    op.drop_column('incidents', 'idempotency_key')
