"""Auth router — login endpoint + demo user seeding support."""
import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import LoginRequest, LoginResponse, UserRead
from ..config import settings

router = APIRouter(prefix='/auth', tags=['auth'])


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False


def create_jwt(user: User) -> str:
    payload = {
        'sub': user.id,
        'role': user.role,
        'email': user.email,
        'exp': datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm='HS256')


@router.post('/login', response_model=LoginResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT token with their role."""
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid email or password',
        )
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid email or password',
        )
    token = create_jwt(user)
    return LoginResponse(
        token=token,
        user=UserRead.model_validate(user),
    )


def seed_demo_users(db: Session) -> None:
    """Seed two demo accounts if they don't already exist."""
    demos = [
        {
            'email': 'citizen@civicshield.ai',
            'password': 'citizen123',
            'role': 'CITIZEN',
            'display_name': 'Demo Citizen',
        },
        {
            'email': 'authority@civicshield.ai',
            'password': 'authority123',
            'role': 'AUTHORITY',
            'display_name': 'Demo Authority',
        },
    ]
    for demo in demos:
        existing = db.query(User).filter(User.email == demo['email']).first()
        if not existing:
            user = User(
                email=demo['email'],
                password_hash=hash_password(demo['password']),
                role=demo['role'],
                display_name=demo['display_name'],
            )
            db.add(user)
    db.commit()
