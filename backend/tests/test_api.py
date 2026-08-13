import jwt
from app.config import settings
def payload(): return {'type':'pothole','description':'A dangerous pothole near the junction','location':{'latitude':26.8467,'longitude':80.9462,'address':'Hazratganj, Lucknow'}}
def token(role='OPERATOR'): return {'Authorization':'Bearer '+jwt.encode({'sub':'test','role':role},settings.jwt_secret,algorithm='HS256')}
def test_health(client): assert client.get('/health').json()['status']=='ok'
def test_incident_creation_and_retrieval(client):
    res=client.post('/api/v1/incidents',json=payload()); assert res.status_code==201
    data=res.json(); assert data['status']=='REPORTED'; assert client.get('/api/v1/incidents/'+data['id']).status_code==200
def test_incident_validation(client): assert client.post('/api/v1/incidents',json={'type':'x'}).status_code==422
def test_role_permissions(client):
    assert client.get('/api/v1/incidents').status_code==401
    assert client.get('/api/v1/incidents',headers=token('CITIZEN')).status_code==403
    assert client.get('/api/v1/incidents',headers=token()).status_code==200
def test_development_analysis_is_backend_owned(client):
    created=client.post('/api/v1/incidents',json=payload()).json()
    response=client.post('/api/v1/incidents/'+created['id']+'/analyze',headers=token('CITIZEN'))
    assert response.status_code==200
    assert response.json()['mode']=='development'
    assert response.json()['provider']=='development-deterministic-adapter'
