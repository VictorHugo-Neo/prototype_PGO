from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm # <--- Importante!
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel
from .. import database, schemas, models, utils, security, crud
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    # 1. Verifica se email já existe
    user_exist = db.query(models.User).filter(models.User.email == user.email).first()
    if user_exist:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    # 2. Cria o hash da senha (segurança)
    # Se você não tiver utils.hash, use: from passlib.context import CryptContext e crie o hash
    hashed_password = utils.hash(user.password) 

    # 3. Salva no Banco
    new_user = models.User(email=user.email, password=hashed_password, name=user.name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Usuário criado com sucesso!"}
@router.post("/login", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), # <--- Mudamos aqui para aceitar o Swagger
    db: Session = Depends(database.get_db)
):

    user = crud.authenticate_user(db, email=form_data.username, password=form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email, "id": user.id, "type": user.type},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}