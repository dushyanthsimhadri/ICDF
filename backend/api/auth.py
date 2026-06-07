import db.bcrypt_patch
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import jwt
import datetime
from passlib.hash import bcrypt
from db.database import get_db
from db.models import User, AuditLog
from auth.rbac import get_allowed_dashboards, get_allowed_modules

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = "ICDF_ENTERPRISE_SECRET_KEY_CHANGE_IN_PRODUCTION"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 600

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: str
    department: str = "Engineering"
    team: str = "Core Delivery"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SSOLoginRequest(BaseModel):
    email: EmailStr
    provider: str # google or microsoft
    role: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user_from_token(token: str, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = bcrypt.hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_pw,
        role=user_data.role,
        department=user_data.department,
        team=user_data.team
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Audit log
    log = AuditLog(user_email=user_data.email, action="User Registered", details=f"Role: {user_data.role}")
    db.add(log)
    db.commit()
    
    return {"message": "User registered successfully"}

@router.post("/login")
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not bcrypt.verify(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    token = create_access_token({"sub": user.email, "role": user.role})
    
    # Audit log
    log = AuditLog(user_email=user.email, action="User Login", details="Email login successful")
    db.add(log)
    db.commit()
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "role": user.role,
            "department": user.department,
            "team": user.team,
            "tenant_id": user.tenant_id,
            "dashboards": get_allowed_dashboards(user.role),
            "modules": get_allowed_modules(user.role)
        }
    }

@router.post("/sso-login")
def sso_login(sso_data: SSOLoginRequest, db: Session = Depends(get_db)):
    # Simulating SSO token login - creates/fetches user automatically
    user = db.query(User).filter(User.email == sso_data.email).first()
    if not user:
        # Create user with default password
        hashed_pw = bcrypt.hash("SSO_TEMPORARY_PASSWORD_123!")
        user = User(
            email=sso_data.email,
            hashed_password=hashed_pw,
            role=sso_data.role,
            department="Enterprise",
            team="SSO Team"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    token = create_access_token({"sub": user.email, "role": user.role})
    
    log = AuditLog(user_email=user.email, action="SSO Login", details=f"Logged in via {sso_data.provider}")
    db.add(log)
    db.commit()
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "role": user.role,
            "department": user.department,
            "team": user.team,
            "tenant_id": user.tenant_id,
            "dashboards": get_allowed_dashboards(user.role),
            "modules": get_allowed_modules(user.role)
        }
    }

@router.get("/me")
def get_me(token: str, db: Session = Depends(get_db)):
    user = get_current_user_from_token(token, db)
    return {
        "email": user.email,
        "role": user.role,
        "department": user.department,
        "team": user.team,
        "tenant_id": user.tenant_id,
        "dashboards": get_allowed_dashboards(user.role),
        "modules": get_allowed_modules(user.role)
    }
