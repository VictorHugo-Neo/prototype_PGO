from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from .. import crud, models, schemas, deps
from ..database import get_db

router = APIRouter(prefix="/guidances", tags=["guidance"])

# 1. Rota para o Aluno descobrir sua orientação (NOVA)
@router.get("/me", response_model=schemas.GuidanceList)
def get_my_guidance_as_student(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.type != models.TypeUser.STUDENT:
        raise HTTPException(status_code=400, detail="Rota exclusiva para alunos.")

    guidance = db.query(models.Guidance)\
        .filter(models.Guidance.student_id == current_user.id)\
        .first()
        
    if not guidance:
        raise HTTPException(status_code=404, detail="Você ainda não possui um orientador vinculado.")
        
    return guidance

# 2. Lista de alunos do Orientador
@router.get("/my-students", response_model=List[schemas.GuidanceList])
def get_my_students(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.type != models.TypeUser.ADVISOR:
        raise HTTPException(status_code=403, detail="Apenas orientadores podem ver esta lista.")

    guidances = db.query(models.Guidance)\
        .filter(models.Guidance.advisor_id == current_user.id)\
        .all()

    return guidances

# 3. Vincular Aluno (Mantém igual)
@router.post("/link", response_model=schemas.GuidanceResponse)
def link_student_by_email(
    link_data: schemas.GuidanceLink,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.type != models.TypeUser.ADVISOR:
        raise HTTPException(status_code=403, detail="Apenas orientadores podem vincular alunos.")

    student = crud.get_user_by_email(db, email=link_data.student_email)
    if not student:
        raise HTTPException(status_code=404, detail="Aluno não encontrado com este email.")
    
    if student.type != models.TypeUser.STUDENT:
        raise HTTPException(status_code=400, detail="O email informado não é de um aluno.")

    existing = db.query(models.Guidance).filter(
        models.Guidance.advisor_id == current_user.id,
        models.Guidance.student_id == student.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Este aluno já está vinculado a você.")

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
    # Busca a orientação
    guidance = db.query(models.Guidance)\
        .filter(models.Guidance.id == guidance_id)\
        .first()
        
    if not guidance:
        raise HTTPException(status_code=404, detail="Orientação não encontrada.")
    
    
    is_advisor = (guidance.advisor_id == current_user.id)
    is_student = (guidance.student_id == current_user.id)

    if not is_advisor and not is_student:
        raise HTTPException(status_code=403, detail="Você não tem permissão para ver esta orientação.")
        
    return guidance