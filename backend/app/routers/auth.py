from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import crud, schemas, security, database

router = APIRouter(tags=["auth"])

@router.post("/auth/login", response_model=schemas.Token)
def login_for_access_token(form_data: schemas.LoginData, db: Session = Depends(database.get_db)):
    # 1. Busca usuário pelo email
    user = crud.get_user_by_email(db, email=form_data.email)

    # 2. Verifica se usuário existe e se a senha bate
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Cria o token JWT
    access_token = security.create_access_token(
        data={"sub": user.email, "id": user.id, "type": user.type}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}