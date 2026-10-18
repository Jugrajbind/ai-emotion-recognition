"""
Authentication API Router.
Handles registration, login credentials verification, and token issuance.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register_user(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    """Registers a new user account with secure password hashing."""
    # Check if username exists
    existing_user = db.query(models.User).filter(
        (models.User.username == payload.username) | (models.User.email == payload.email)
    ).first()
    
    if existing_user:
        if existing_user.username == payload.username:
            raise HTTPException(status_code=400, detail="Username is already taken.")
        else:
            raise HTTPException(status_code=400, detail="Email is already registered.")

    hashed_pw = get_password_hash(payload.password)
    user = models.User(
        username=payload.username,
        email=payload.email,
        hashed_password=hashed_pw,
        full_name=payload.full_name or payload.username
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/login", response_model=schemas.Token)
def login_user(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    """Authenticates credentials and returns a JWT access token."""
    user = db.query(models.User).filter(
        (models.User.username == payload.username) | (models.User.email == payload.username)
    ).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=schemas.UserResponse)
def get_user_profile(current_user: models.User = Depends(get_current_user)):
    """Returns profile information for the authenticated user."""
    return current_user
