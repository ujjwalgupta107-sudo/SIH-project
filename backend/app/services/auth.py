"""JWT verification middleware for route protection."""
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from ..config import settings
from ..schemas import TokenPayload

security = HTTPBearer(auto_error=False)

# All valid authority-level roles
AUTHORITY_ROLES = {'AUTHORITY', 'OFFICER', 'OPERATOR', 'ADMIN'}
ALL_ROLES = {'CITIZEN', 'AUTHORITY', 'OFFICER', 'OPERATOR', 'ADMIN'}


def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> TokenPayload:
    if not credentials:
        raise HTTPException(status_code=401, detail='Authentication required')
    try:
        data = jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=['HS256'])
        return TokenPayload(**data)
    except Exception:
        raise HTTPException(status_code=401, detail='Invalid or expired token')


def require_roles(*roles: str):
    """Dependency that enforces role-based access. Pass role names as strings."""
    def check(user: TokenPayload = Depends(current_user)):
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Insufficient permissions')
        return user
    return check


def require_authority(user: TokenPayload = Depends(current_user)) -> TokenPayload:
    """Shorthand dependency for any authority-level role."""
    if user.role not in AUTHORITY_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Authority access required')
    return user
