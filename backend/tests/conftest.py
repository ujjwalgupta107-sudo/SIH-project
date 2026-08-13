import os
os.environ['DATABASE_URL']='sqlite:///./test.db'
os.environ['JWT_SECRET']='test-secret-with-at-least-thirty-two-characters'
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base,engine
@pytest.fixture(autouse=True)
def database():
    Base.metadata.drop_all(engine); Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)
@pytest.fixture
def client(): return TestClient(app)
