from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, deps
from ..database import get_db

# O prefixo /users já está definido aqui
router = APIRouter(prefix="/users", tags=["users"])

# ---------------------------------------------------------
# 🚨 IMPORTANTE: As rotas específicas (/me) DEVEM vir no topo
# ---------------------------------------------------------

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: schemas.UserResponse = Depends(deps.get_current_user)):
    """ Retorna o usuário logado """
    return current_user

@router.put("/me", response_model=schemas.UserResponse)
def update_user_me(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    """ Atualiza o usuário logado """
    # Verifica duplicidade de email na edição
    if user_update.email and user_update.email != current_user.email:
        existing_user = crud.get_user_by_email(db, email=user_update.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email já está em uso")
            
    updated_user = crud.update_user(db, current_user.id, user_update)
    return updated_user

# ---------------------------------------------------------
# Rotas Genéricas (/{email}, /) vêm DEPOIS
# ---------------------------------------------------------

@router.post("/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Esse email já está em uso.")
    return crud.create_user(db=db, user=user)

@router.get("/{email}", response_model=schemas.UserResponse)
def read_user(email: str, db: Session = Depends(get_db)):
    """ 
    Se esta rota viesse antes do /me, o FastAPI acharia que 
    'me' é um email e daria erro 404 ou 500.
    """
    db_user = crud.get_user_by_email(db, email=email)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return db_user