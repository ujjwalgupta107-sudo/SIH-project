import os
os.environ['DATABASE_URL'] = 'sqlite:///./test.db'
os.environ['JWT_SECRET'] = 'test-secret-with-at-least-thirty-two-characters'

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.routers.auth import seed_demo_users


@pytest.fixture(autouse=True)
def database():
    """Fresh database for every test with demo users seeded."""
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    # Seed demo users so auth tests work
    db = SessionLocal()
    try:
        seed_demo_users(db)
    finally:
        db.close()
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture
def client():
    return TestClient(app)
