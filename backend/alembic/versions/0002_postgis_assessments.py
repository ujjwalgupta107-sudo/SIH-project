"""PostGIS location, operational indexes and rich AI assessment storage.

Revision ID: 0002
Revises: 0001
"""
from alembic import op
import sqlalchemy as sa
revision='0002'; down_revision='0001'; branch_labels=None; depends_on=None
def upgrade():
    op.add_column('incidents',sa.Column('location',sa.Text(),nullable=True))
    op.execute("UPDATE incidents SET location = 'SRID=4326;POINT(' || longitude || ' ' || latitude || ')' ")
    op.execute("ALTER TABLE incidents ALTER COLUMN location TYPE geography(POINT,4326) USING ST_GeogFromText(location)")
    op.alter_column('incidents','location',nullable=False)
    op.create_index('ix_incidents_location_gist','incidents',['location'],postgresql_using='gist')
    op.create_index('ix_incidents_status','incidents',['status'])
    op.create_index('ix_incidents_department','incidents',['department'])
    op.create_index('ix_incidents_created_at','incidents',['created_at'])
    op.create_table('ai_assessments',sa.Column('id',sa.String(),primary_key=True),sa.Column('incident_id',sa.String(),sa.ForeignKey('incidents.id',ondelete='CASCADE'),nullable=False,unique=True),sa.Column('mode',sa.String(20),nullable=False),sa.Column('provider',sa.String(100),nullable=False),sa.Column('payload',sa.JSON(),nullable=False),sa.Column('created_at',sa.DateTime(),nullable=False))
def downgrade():
    op.drop_table('ai_assessments')
    for index in ['ix_incidents_created_at','ix_incidents_department','ix_incidents_status','ix_incidents_location_gist']: op.drop_index(index,table_name='incidents')
    op.drop_column('incidents','location')
