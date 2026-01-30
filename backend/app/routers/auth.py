from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm # <--- Importante!
from sqlalchemy.orm import Session
from datetime import timedelta
from .. import database, schemas, models, utils, security, crud

router = APIRouter(prefix="/auth", tags=["auth"])

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