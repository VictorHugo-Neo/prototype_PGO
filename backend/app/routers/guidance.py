from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import crud, models, schemas, deps
from ..database import get_db

router = APIRouter(prefix="/guidances", tags=["guidance"])


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


@router.get("/my-students", response_model=List[schemas.GuidanceList])
def get_my_students(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.type != models.TypeUser.ADVISOR:
        raise HTTPException(status_code=403, detail="Apenas orientadores podem ver esta lista.")

    guidances = db.query(models.Guidance)\
        .filter(
            or_(
                models.Guidance.advisor_id == current_user.id,
                models.Guidance.coadvisor_id == current_user.id
            )
        )\
        .all()

    for g in guidances:
        setattr(g, "user_role", "advisor" if g.advisor_id == current_user.id else "coadvisor")

    return guidances


@router.get("/available-students", response_model=List[schemas.AvailableStudent])
def get_available_students(
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.type != models.TypeUser.ADVISOR:
        raise HTTPException(status_code=403, detail="Apenas orientadores podem ver a lista de alunos disponíveis.")

    all_guidances = db.query(models.Guidance).all()
    linked_map = {g.student_id: g.theme for g in all_guidances}

    query = db.query(models.User).filter(models.User.type == models.TypeUser.STUDENT)
    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            (models.User.name.ilike(term)) | (models.User.email.ilike(term))
        )

    students = query.order_by(models.User.name.asc()).all()

    result = [
        schemas.AvailableStudent(
            id=s.id,
            name=s.name,
            email=s.email,
            avatar_path=s.avatar_path,
            is_already_linked=(s.id in linked_map),
            active_theme=linked_map.get(s.id),
        )
        for s in students
    ]
    return result


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
        models.Guidance.student_id == student.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Este aluno já possui uma orientação vinculada.")

    coadvisor_id = None
    if link_data.coadvisor_email:
        coadvisor = crud.get_user_by_email(db, email=link_data.coadvisor_email)
        if not coadvisor:
            raise HTTPException(status_code=404, detail="Coorientador não encontrado com este email.")
        if coadvisor.type != models.TypeUser.ADVISOR:
            raise HTTPException(status_code=400, detail="O email informado para coorientador não pertence a um orientador.")
        if coadvisor.id == current_user.id:
            raise HTTPException(status_code=400, detail="O coorientador não pode ser o mesmo professor que o orientador principal.")
        if coadvisor.id == student.id:
            raise HTTPException(status_code=400, detail="O coorientador não pode ser o próprio aluno.")
        coadvisor_id = coadvisor.id

    new_guidance = models.Guidance(
        theme=link_data.theme,
        defense_date=link_data.defense_date,
        advisor_id=current_user.id,
        coadvisor_id=coadvisor_id,
        student_id=student.id
    )
    db.add(new_guidance)
    db.commit()
    db.refresh(new_guidance)

    crud.get_kanban_columns_by_guidance(db, new_guidance.id)

    return new_guidance


@router.get("/{guidance_id}", response_model=schemas.GuidanceList)
def get_guidance_detail(
    guidance_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    guidance = db.query(models.Guidance)\
        .filter(models.Guidance.id == guidance_id)\
        .first()
        
    if not guidance:
        raise HTTPException(status_code=404, detail="Orientação não encontrada.")
    
    is_advisor = (guidance.advisor_id == current_user.id)
    is_coadvisor = (guidance.coadvisor_id == current_user.id)
    is_student = (guidance.student_id == current_user.id)

    if not is_advisor and not is_coadvisor and not is_student:
        raise HTTPException(status_code=403, detail="Você não tem permissão para ver esta orientação.")
        
    role = "advisor" if is_advisor else ("coadvisor" if is_coadvisor else "student")
    setattr(guidance, "user_role", role)
    return guidance



@router.patch("/{guidance_id}", response_model=schemas.GuidanceList)
def update_guidance(
    guidance_id: int,
    guidance_update: schemas.GuidanceUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.type != models.TypeUser.ADVISOR:
        raise HTTPException(status_code=403, detail="Apenas orientadores podem alterar dados da orientação.")

    db_guidance = db.query(models.Guidance).filter(
        models.Guidance.id == guidance_id,
        or_(
            models.Guidance.advisor_id == current_user.id,
            models.Guidance.coadvisor_id == current_user.id
        )
    ).first()

    if not db_guidance:
        raise HTTPException(status_code=404, detail="Orientação não encontrada.")

    update_data = guidance_update.model_dump(exclude_unset=True)
    if "theme" in update_data and update_data["theme"] is not None:
        db_guidance.theme = update_data["theme"]
    if "defense_date" in update_data:
        db_guidance.defense_date = update_data["defense_date"]
    if "coadvisor_id" in update_data:
        new_coadvisor_id = update_data["coadvisor_id"]
        if new_coadvisor_id is not None:
            coadvisor = db.query(models.User).filter(models.User.id == new_coadvisor_id).first()
            if not coadvisor or coadvisor.type != models.TypeUser.ADVISOR:
                raise HTTPException(status_code=400, detail="Coorientador inválido.")
            if coadvisor.id == db_guidance.advisor_id:
                raise HTTPException(status_code=400, detail="O coorientador não pode ser o mesmo professor que o orientador principal.")
            if coadvisor.id == db_guidance.student_id:
                raise HTTPException(status_code=400, detail="O coorientador não pode ser o próprio aluno.")
        db_guidance.coadvisor_id = new_coadvisor_id

    db.commit()
    db.refresh(db_guidance)
    setattr(db_guidance, "user_role", "advisor" if db_guidance.advisor_id == current_user.id else "coadvisor")
    return db_guidance


@router.put("/{guidance_id}/defense-date", response_model=schemas.GuidanceList)
def set_defense_date(
    guidance_id: int,
    payload: schemas.DefenseDateUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.type != models.TypeUser.ADVISOR:
        raise HTTPException(status_code=403, detail="Apenas orientadores podem alterar a data da banca.")

    db_guidance = db.query(models.Guidance).filter(
        models.Guidance.id == guidance_id,
        or_(
            models.Guidance.advisor_id == current_user.id,
            models.Guidance.coadvisor_id == current_user.id
        )
    ).first()

    if not db_guidance:
        raise HTTPException(status_code=404, detail="Orientação não encontrada.")

    db_guidance.defense_date = payload.defense_date
    db.commit()
    db.refresh(db_guidance)
    setattr(db_guidance, "user_role", "advisor" if db_guidance.advisor_id == current_user.id else "coadvisor")
    return db_guidance


@router.delete("/{guidance_id}/defense-date", response_model=schemas.GuidanceList)
def remove_defense_date(
    guidance_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.type != models.TypeUser.ADVISOR:
        raise HTTPException(status_code=403, detail="Apenas orientadores podem remover a data da banca.")

    db_guidance = db.query(models.Guidance).filter(
        models.Guidance.id == guidance_id,
        or_(
            models.Guidance.advisor_id == current_user.id,
            models.Guidance.coadvisor_id == current_user.id
        )
    ).first()

    if not db_guidance:
        raise HTTPException(status_code=404, detail="Orientação não encontrada.")

    db_guidance.defense_date = None
    db.commit()
    db.refresh(db_guidance)
    setattr(db_guidance, "user_role", "advisor" if db_guidance.advisor_id == current_user.id else "coadvisor")
    return db_guidance


@router.put("/{guidance_id}/coadvisor", response_model=schemas.GuidanceList)
def set_coadvisor(
    guidance_id: int,
    payload: schemas.CoadvisorUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    db_guidance = db.query(models.Guidance).filter(models.Guidance.id == guidance_id).first()
    if not db_guidance:
        raise HTTPException(status_code=404, detail="Orientação não encontrada.")

    if db_guidance.advisor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Apenas o orientador principal pode gerenciar o coorientador.")

    coadvisor = crud.get_user_by_email(db, email=payload.coadvisor_email)
    if not coadvisor:
        raise HTTPException(status_code=404, detail="Coorientador não encontrado com este email.")
    if coadvisor.type != models.TypeUser.ADVISOR:
        raise HTTPException(status_code=400, detail="O email informado para coorientador não pertence a um orientador.")
    if coadvisor.id == current_user.id:
        raise HTTPException(status_code=400, detail="O orientador principal não pode ser seu próprio coorientador.")
    if coadvisor.id == db_guidance.student_id:
        raise HTTPException(status_code=400, detail="O coorientador não pode ser o próprio aluno.")

    db_guidance.coadvisor_id = coadvisor.id
    db.commit()
    db.refresh(db_guidance)

    student_name = db_guidance.student.name if db_guidance.student else "Aluno"
    db.add(models.Notification(
        user_id=coadvisor.id,
        message=f"Você foi vinculado como coorientador(a) do projeto: {db_guidance.theme} (Aluno: {student_name})",
        link=f"/guidance/{db_guidance.id}"
    ))
    db.commit()

    setattr(db_guidance, "user_role", "advisor")
    return db_guidance


@router.delete("/{guidance_id}/coadvisor", response_model=schemas.GuidanceList)
def remove_coadvisor(
    guidance_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    db_guidance = db.query(models.Guidance).filter(models.Guidance.id == guidance_id).first()
    if not db_guidance:
        raise HTTPException(status_code=404, detail="Orientação não encontrada.")

    if db_guidance.advisor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Apenas o orientador principal pode gerenciar o coorientador.")

    old_coadvisor_id = db_guidance.coadvisor_id
    db_guidance.coadvisor_id = None
    db.commit()
    db.refresh(db_guidance)

    if old_coadvisor_id:
        db.add(models.Notification(
            user_id=old_coadvisor_id,
            message=f"Você foi desvinculado da coorientação do projeto: {db_guidance.theme}",
            link="/dashboard"
        ))
        db.commit()

    setattr(db_guidance, "user_role", "advisor")
    return db_guidance