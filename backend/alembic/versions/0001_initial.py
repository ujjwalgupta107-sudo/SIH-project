"""initial PostGIS-ready civic schema
Revision ID: 0001
"""
from alembic import op
import sqlalchemy as sa
revision='0001'; down_revision=None; branch_labels=None; depends_on=None
def upgrade():
    op.execute('CREATE EXTENSION IF NOT EXISTS postgis')
    op.create_table('users',sa.Column('id',sa.String(),primary_key=True),sa.Column('email',sa.String(),unique=True),sa.Column('role',sa.String()),sa.Column('created_at',sa.DateTime()))
    op.create_table('departments',sa.Column('id',sa.String(),primary_key=True),sa.Column('name',sa.String(),unique=True),sa.Column('code',sa.String(),unique=True))
    op.create_table('incidents',sa.Column('id',sa.String(),primary_key=True),sa.Column('citizen_id',sa.String(),nullable=True),sa.Column('type',sa.String()),sa.Column('description',sa.Text()),sa.Column('latitude',sa.Float()),sa.Column('longitude',sa.Float()),sa.Column('address',sa.String()),sa.Column('severity',sa.Integer()),sa.Column('confidence',sa.Float()),sa.Column('risk_level',sa.String()),sa.Column('department',sa.String()),sa.Column('status',sa.String()),sa.Column('created_at',sa.DateTime()),sa.Column('updated_at',sa.DateTime()))
    op.create_table('incident_media',sa.Column('id',sa.String(),primary_key=True),sa.Column('incident_id',sa.String()),sa.Column('url',sa.String()),sa.Column('media_type',sa.String()),sa.Column('stage',sa.String()))
    op.create_table('assignments',sa.Column('id',sa.String(),primary_key=True),sa.Column('incident_id',sa.String()),sa.Column('department_id',sa.String(),nullable=True),sa.Column('officer_id',sa.String(),nullable=True),sa.Column('status',sa.String()))
    op.create_table('audit_logs',sa.Column('id',sa.String(),primary_key=True),sa.Column('actor_id',sa.String(),nullable=True),sa.Column('action',sa.String()),sa.Column('entity_type',sa.String()),sa.Column('entity_id',sa.String()),sa.Column('created_at',sa.DateTime()))
def downgrade():
    for table in ['audit_logs','assignments','incident_media','incidents','departments','users']: op.drop_table(table)
