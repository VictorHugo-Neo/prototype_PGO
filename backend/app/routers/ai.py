from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from groq import Groq
import json
from pydantic import BaseModel
from .. import models, deps
from ..database import get_db
from ..config import settings

router = APIRouter(prefix="/ai", tags=["ai"])

client = Groq(api_key=settings.GROQ_API_KEY)

class AIQuery(BaseModel):
    question: str

@router.post("/generate-tasks/{guidance_id}")
def generate_tasks_ai(
    guidance_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    guidance = db.query(models.Guidance).filter(models.Guidance.id == guidance_id).first()
    if not guidance: raise HTTPException(404, "Não encontrado")

    prompt = f"Crie 5 tarefas para TCC sobre '{guidance.theme}'. JSON: [{{'title': '...', 'description': '...', 'time_estimate': 'YYYY-MM-DD'}}]"
    try:
        resp = client.chat.completions.create(messages=[{"role": "user", "content": prompt}], model="llama-3.3-70b-versatile", response_format={"type": "json_object"})
        data = json.loads(resp.choices[0].message.content)
        items = data.get("tasks", data)
        for t in items:
            db.add(models.Task(title=t["title"], description=t["description"], status="pending", guidance_id=guidance.id, time_estimate=t.get("time_estimate")))
        db.commit()
        return {"ok": True}
    except: raise HTTPException(500, "Erro IA")


@router.post("/consult/{guidance_id}")
def consult_project_ai(
    guidance_id: int,
    query: AIQuery,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    
    guidance = db.query(models.Guidance).filter(models.Guidance.id == guidance_id).first()
    if not guidance: raise HTTPException(404, "Orientação não encontrada")
    
    tasks = db.query(models.Task).filter(models.Task.guidance_id == guidance_id).all()
    
    
    task_ids = [t.id for t in tasks]
    all_comments = db.query(models.Comment).filter(models.Comment.task_id.in_(task_ids)).order_by(models.Comment.created_at).all()
    all_attachments = db.query(models.Attachment).filter(models.Attachment.task_id.in_(task_ids)).all()

    
    role_desc = "Visitante"
    if current_user.id == guidance.advisor_id: role_desc = "ORIENTADOR (Professor)"
    elif current_user.id == guidance.student_id: role_desc = "ALUNO"

    # 3. Montagem do Contexto
    tasks_details_str = ""
    
    if not tasks:
        tasks_details_str = "Não há tarefas cadastradas neste projeto."
    
    for t in tasks:
        # Filtros locais
        t_comments = [c for c in all_comments if c.task_id == t.id]
        t_attachments = [a for a in all_attachments if a.task_id == t.id]
        
        st_label = "PENDENTE"
        if t.status == "in_progress": st_label = "EM ANDAMENTO"
        elif t.status == "completed": st_label = "CONCLUÍDO"

        # Bloco da Tarefa
        tasks_details_str += f"\n=== TAREFA: {t.title} ===\n"
        tasks_details_str += f"Status: {st_label}\n"
        tasks_details_str += f"Descrição: {t.description or 'Sem descrição'}\n"
        
        # Arquivos
        if t_attachments:
            files_str = ", ".join([a.filename for a in t_attachments])
            tasks_details_str += f"Arquivos Anexados: {files_str}\n"
        else:
            tasks_details_str += "Arquivos: Nenhum\n"

        
        if t_comments:
            tasks_details_str += "Histórico de Conversa:\n"
            for c in t_comments:
                
                author_name = c.user.name if c.user else "Desconhecido"
                tasks_details_str += f"   - [{author_name}]: {c.content}\n"
        else:
            tasks_details_str += "Conversa: Nenhuma mensagem trocada.\n"
        
        tasks_details_str += "--------------------------------------------------\n"

    
    system_prompt = f"""
    VOCÊ É O ASSISTENTE VIRTUAL DO SISTEMA PGO.
    
    --- QUEM ESTÁ FALANDO ---
    Nome: {current_user.name}
    Papel: {role_desc}
    
    --- DADOS DO PROJETO ---
    Aluno: {guidance.student.name}
    Tema: {guidance.theme}
    
    --- DETALHAMENTO DAS TAREFAS (COM ARQUIVOS E CHAT) ---
    {tasks_details_str}
    
    --- DIRETRIZES ---
    1. Responda com base nos detalhes acima.
    2. Se perguntarem sobre o que foi conversado, olhe o Histórico de Conversa da tarefa.
    3. Se perguntarem sobre arquivos, olhe os Arquivos Anexados.
    4. Seja prestativo e natural.
    """

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query.question}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.1, 
        )
        answer = response.choices[0].message.content
        return {"response": answer}

    except Exception as e:
        print(f"❌ Erro IA: {e}")
        raise HTTPException(status_code=500, detail="Erro na IA")