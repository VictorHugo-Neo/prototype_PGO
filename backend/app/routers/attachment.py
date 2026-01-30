from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
import uuid
from .. import crud, models, schemas, deps
from ..database import get_db

router = APIRouter(prefix="/attachments", tags=["attachments"])

# Configuração da pasta de upload (caminho absoluto para evitar erros)
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True) # Garante que a pasta existe

@router.post("/task/{task_id}", response_model=schemas.AttachmentResponse)
async def upload_file(
    task_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    # 1. Verifica se a tarefa existe
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")

    # 2. Gera um nome único para o arquivo (para não sobrescrever)
    # Ex: relatorio.pdf -> unique_id_relatorio.pdf
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # 3. Salva o arquivo no disco
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar arquivo: {str(e)}")

    # 4. Salva no Banco de Dados
    # O caminho salvo no banco será relativo para facilitar o acesso via URL
    # Ex: static/uploads/uuid.pdf
    db_attachment = models.Attachment(
        filename=file.filename, # Nome original (para exibir pro usuário)
        file_path=file_path,    # Caminho real
        task_id=task_id
    )
    
    db.add(db_attachment)
    db.commit()
    db.refresh(db_attachment)

    return db_attachment

@router.get("/task/{task_id}", response_model=List[schemas.AttachmentResponse])
def get_attachments_by_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    return db.query(models.Attachment).filter(models.Attachment.task_id == task_id).all()