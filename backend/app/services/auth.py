import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from ..config import settings
from ..schemas import TokenPayload
security=HTTPBearer(auto_error=False)
def current_user(credentials:HTTPAuthorizationCredentials|None=Depends(security))->TokenPayload:
    if not credentials: raise HTTPException(status_code=401, detail='Authentication required')
    try: return TokenPayload(**jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=['HS256']))
    except Exception: raise HTTPException(status_code=401, detail='Invalid or expired token')
def require_roles(*roles:str):
    def check(user:TokenPayload=Depends(current_user)):
        if user.role not in roles: raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Insufficient permissions')
        return user
    return check
