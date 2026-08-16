"""Tests for the authentication endpoints."""
import jwt
from app.config import settings


def test_login_citizen_success(client):
    """Demo citizen account should return JWT with CITIZEN role."""
    res = client.post('/api/v1/auth/login', json={
        'email': 'citizen@civicshield.ai',
        'password': 'citizen123',
    })
    assert res.status_code == 200, res.text
    data = res.json()
    assert 'token' in data
    assert data['user']['role'] == 'CITIZEN'
    assert data['user']['email'] == 'citizen@civicshield.ai'
    # Verify the token is a valid JWT
    payload = jwt.decode(data['token'], settings.jwt_secret, algorithms=['HS256'])
    assert payload['role'] == 'CITIZEN'


def test_login_authority_success(client):
    """Demo authority account should return JWT with AUTHORITY role."""
    res = client.post('/api/v1/auth/login', json={
        'email': 'authority@civicshield.ai',
        'password': 'authority123',
    })
    assert res.status_code == 200, res.text
    data = res.json()
    assert data['user']['role'] == 'AUTHORITY'


def test_login_wrong_password(client):
    """Wrong password must return 401."""
    res = client.post('/api/v1/auth/login', json={
        'email': 'citizen@civicshield.ai',
        'password': 'wrongpassword',
    })
    assert res.status_code == 401


def test_login_unknown_email(client):
    """Unknown email must return 401."""
    res = client.post('/api/v1/auth/login', json={
        'email': 'nobody@civicshield.ai',
        'password': 'anything',
    })
    assert res.status_code == 401


def test_login_missing_fields(client):
    """Missing required fields must return 422."""
    res = client.post('/api/v1/auth/login', json={'email': 'citizen@civicshield.ai'})
    assert res.status_code == 422


def test_citizen_can_create_incident_with_real_token(client):
    """End-to-end: login → get token → create incident."""
    login_res = client.post('/api/v1/auth/login', json={
        'email': 'citizen@civicshield.ai',
        'password': 'citizen123',
    })
    assert login_res.status_code == 200
    token = login_res.json()['token']

    incident_res = client.post('/api/v1/incidents', json={
        'type': 'pothole',
        'description': 'Large pothole near the bus stop causing traffic issues',
        'location': {
            'latitude': 26.8467,
            'longitude': 80.9462,
            'address': 'Hazratganj, Lucknow',
        },
    }, headers={'Authorization': f'Bearer {token}'})
    assert incident_res.status_code == 201
    assert incident_res.json()['type'] == 'pothole'


def test_authority_can_list_all_incidents(client):
    """Authority role must be able to GET /incidents."""
    login_res = client.post('/api/v1/auth/login', json={
        'email': 'authority@civicshield.ai',
        'password': 'authority123',
    })
    assert login_res.status_code == 200
    token = login_res.json()['token']

    res = client.get('/api/v1/incidents', headers={'Authorization': f'Bearer {token}'})
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_citizen_cannot_list_all_incidents(client):
    """Citizen role must NOT be able to GET /incidents (authority-only)."""
    login_res = client.post('/api/v1/auth/login', json={
        'email': 'citizen@civicshield.ai',
        'password': 'citizen123',
    })
    token = login_res.json()['token']
    res = client.get('/api/v1/incidents', headers={'Authorization': f'Bearer {token}'})
    assert res.status_code == 403
