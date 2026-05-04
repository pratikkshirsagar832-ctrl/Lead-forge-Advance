from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

class LoginRequest(BaseModel):
    user_id: str
    password: str

@router.post("/login")
def login(req: LoginRequest):
    if req.user_id == settings.INTERNAL_USER_ID and req.password == settings.INTERNAL_USER_PASSWORD:
        return {"access_token": "internal_auth_token", "token_type": "bearer"}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )
