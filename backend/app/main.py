from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import Base, engine, SessionLocal
from .routers import incidents, departments, media, auth as auth_router
from .models import Department
from .config import settings
from .errors import validation_handler, http_handler
import os

app = FastAPI(title='CivicShield AI API', version='0.2.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(',')],
    allow_methods=['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allow_headers=['Authorization', 'Content-Type'],
)

app.add_exception_handler(RequestValidationError, validation_handler)
app.add_exception_handler(HTTPException, http_handler)


@app.on_event('startup')
def startup():
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        # Seed departments
        if not db.query(Department).count():
            db.add_all([
                Department(name='Public Works Department', code='PWD'),
                Department(name='Sanitation Department', code='SAN'),
                Department(name='Drainage Department', code='DRN'),
            ])
            db.commit()

        # Seed demo users (requires auth router helper)
        from .routers.auth import seed_demo_users
        seed_demo_users(db)
    finally:
        db.close()


@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'civicshield-api', 'version': '0.2.0'}


os.makedirs('uploads', exist_ok=True)
app.mount('/uploads', StaticFiles(directory='uploads'), name='uploads')

app.include_router(auth_router.router, prefix='/api/v1')
app.include_router(incidents.router, prefix='/api/v1')
app.include_router(departments.router, prefix='/api/v1')
app.include_router(media.router, prefix='/api/v1')
