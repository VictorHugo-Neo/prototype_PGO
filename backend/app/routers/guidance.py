from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, models, schemas, deps
from ..database import get_db

router = APIRouter(prefix="/guidances", tags=["guidance"])

# ------------------------------------------------------------------
# 1. Rotas Específicas (DEVEM vir primeiro)
# ------------------------------------------------------------------

@router.get("/my-students", response_model=List[schemas.GuidanceList])
def get_my_students(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    # Verifica se é orientador
    if current_user.type != models.TypeUser.ADVISOR:
        raise HTTPException(status_code=403, detail="Apenas orientadores podem ver esta lista.")

    # Busca orientações onde o advisor_id é o usuário logado
    guidances = db.query(models.Guidance)\
        .filter(models.Guidance.advisor_id == current_user.id)\
        .all()

    return guidances

# ------------------------------------------------------------------
# 2. Rotas Dinâmicas (que usam ID) vêm depois
# ------------------------------------------------------------------

@router.get("/{guidance_id}", response_model=schemas.GuidanceList)
def get_guidance_detail(
    guidance_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    # Busca a orientação e garante que pertence ao orientador logado
    guidance = db.query(models.Guidance)\
        .filter(models.Guidance.id == guidance_id)\
        .filter(models.Guidance.advisor_id == current_user.id)\
        .first()
        
    if not guidance:
        raise HTTPException(status_code=404, detail="Orientação não encontrada ou acesso negado.")
        
    return guidance

# Rota de criação (POST não confunde com GET, pode ficar em qualquer lugar, mas deixamos aqui)
@router.post("/", response_model=schemas.GuidanceResponse)
def create_guidance(
    guidance: schemas.GuidanceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    # Cria a orientação
    db_guidance = models.Guidance(**guidance.model_dump())
    db.add(db_guidance)
    db.commit()
    db.refresh(db_guidance)
    return db_guidance