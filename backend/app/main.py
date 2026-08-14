from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import Base,engine,SessionLocal
from .routers import incidents,departments,media
from .models import Department
from .config import settings
from .errors import validation_handler,http_handler
app=FastAPI(title='CivicShield AI API',version='0.1.0')
app.add_middleware(CORSMiddleware,allow_origins=[origin.strip() for origin in settings.cors_origins.split(',')],allow_methods=['GET','POST','PATCH'],allow_headers=['Authorization','Content-Type'])
app.add_exception_handler(RequestValidationError,validation_handler); app.add_exception_handler(HTTPException,http_handler)
@app.on_event('startup')
def startup():
    Base.metadata.create_all(engine)
    db=SessionLocal()
    if not db.query(Department).count(): db.add_all([Department(name='Public Works Department',code='PWD'),Department(name='Sanitation Department',code='SAN')]); db.commit()
    db.close()
@app.get('/health')
def health(): return {'status':'ok','service':'civicshield-api'}
import os
os.makedirs('uploads', exist_ok=True)
app.mount('/uploads', StaticFiles(directory='uploads'), name='uploads')
app.include_router(incidents.router,prefix='/api/v1'); app.include_router(departments.router,prefix='/api/v1'); app.include_router(media.router,prefix='/api/v1')
