from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, models, schemas, deps
from ..database import get_db

router = APIRouter(prefix="/guidances", tags=["guidance"])


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

@router.post("/link", response_model=schemas.GuidanceResponse)
def link_student_by_email(
    link_data: schemas.GuidanceLink,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    # 1. Verifica se quem está pedindo é Orientador
    if current_user.type != models.TypeUser.ADVISOR:
        raise HTTPException(status_code=403, detail="Apenas orientadores podem vincular alunos.")

    # 2. Busca o aluno pelo email
    student = crud.get_user_by_email(db, email=link_data.student_email)
    if not student:
        raise HTTPException(status_code=404, detail="Aluno não encontrado com este email.")
    
    # 3. Garante que o usuário encontrado é realmente um ALUNO
    if student.type != models.TypeUser.STUDENT:
        raise HTTPException(status_code=400, detail="O email informado pertence a um Orientador, não a um aluno.")

    # 4. Verifica se já existe vínculo entre este professor e este aluno
    existing = db.query(models.Guidance).filter(
        models.Guidance.advisor_id == current_user.id,
        models.Guidance.student_id == student.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Este aluno já está vinculado a você.")

    # 5. Cria o vínculo
    new_guidance = models.Guidance(
        theme=link_data.theme,
        advisor_id=current_user.id,
        student_id=student.id
    )
    db.add(new_guidance)
    db.commit()
    db.refresh(new_guidance)
    
    return new_guidance

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