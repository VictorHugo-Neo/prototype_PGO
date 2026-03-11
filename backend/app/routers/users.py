from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
import uuid

from .. import crud, schemas, deps, models
from ..database import get_db


router = APIRouter(prefix="/users", tags=["users"])


AVATAR_DIR = "static/avatars"
os.makedirs(AVATAR_DIR, exist_ok=True) 


@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(deps.get_current_user)):
    """ Retorna o usuário logado """
    return current_user


@router.post("/me/avatar", response_model=schemas.UserResponse)
def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """ Faz upload da foto de perfil do usuário logado """

    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Apenas arquivos de imagem são permitidos.")

    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"user_{current_user.id}_{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(AVATAR_DIR, unique_filename)


    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(500, f"Erro ao salvar arquivo: {str(e)}")


    current_user.avatar_path = file_path 
    db.commit()     
    db.refresh(current_user) 
    
    return current_user

@router.put("/me", response_model=schemas.UserResponse)
def update_user_me(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """ Atualiza o usuário logado (Nome, Email, Senha) """
    
    if user_update.email and user_update.email != current_user.email:
        existing_user = crud.get_user_by_email(db, email=user_update.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email já está em uso")
            
    updated_user = crud.update_user(db, current_user.id, user_update)
    return updated_user


@router.post("/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """ Cria um novo usuário (Registro) """
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Esse email já está em uso.")
    return crud.create_user(db=db, user=user)

@router.get("/{email}", response_model=schemas.UserResponse)
def read_user(email: str, db: Session = Depends(get_db)):
    """ Busca um usuário específico pelo email (Admin ou uso interno) """
    db_user = crud.get_user_by_email(db, email=email)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return db_user