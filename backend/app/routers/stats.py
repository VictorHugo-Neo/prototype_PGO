from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, deps
from ..database import get_db

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    # 1. Filtra as orientações baseadas no usuário logado
    if current_user.type == 'advisor':
        # Se for Orientador: Pega apenas as orientações DELE
        guidances = db.query(models.Guidance).filter(models.Guidance.advisor_id == current_user.id).all()
    else:
        # Se for Aluno: Pega apenas a orientação DELE (se existir)
        guidances = db.query(models.Guidance).filter(models.Guidance.student_id == current_user.id).all()

    # 2. Total de Alunos Vinculados
    total_students = len(guidances)
    
    # Lista de IDs das orientações para filtrar tarefas e reuniões
    guidance_ids = [g.id for g in guidances]
    
    # Inicializa contadores zerados
    task_dist = {"pending": 0, "in_progress": 0, "completed": 0}
    pending_meetings = 0
    student_performance = []

    if guidance_ids:
        # 3. Distribuição de Tarefas (Filtrado pelas orientações do usuário)
        tasks_query = db.query(
            models.Task.status, func.count(models.Task.id)
        ).filter(models.Task.guidance_id.in_(guidance_ids))\
         .group_by(models.Task.status).all()
        
        for status, count in tasks_query:
            if status in task_dist:
                task_dist[status] = count

        # 4. Reuniões Pendentes (Filtrado)
        pending_meetings = db.query(models.Meeting)\
            .filter(models.Meeting.guidance_id.in_(guidance_ids), models.Meeting.status == "pending")\
            .count()

        # 5. Progresso por Aluno (Ranking)
        for g in guidances:
            total = db.query(models.Task).filter(models.Task.guidance_id == g.id).count()
            completed = db.query(models.Task).filter(models.Task.guidance_id == g.id, models.Task.status == "completed").count()
            
            progress = int((completed / total * 100)) if total > 0 else 0
            student_performance.append({
                "name": g.student.name.split()[0], # Primeiro nome
                "progress": progress
            })
        
        # Ordena: Mais adiantados primeiro
        student_performance = sorted(student_performance, key=lambda x: x['progress'], reverse=True)[:5]

    return {
        "total_students": total_students,
        "pending_meetings": pending_meetings,
        "task_stats": [
            {"name": "Pendente", "value": task_dist["pending"], "color": "#9CA3AF"}, # Cinza
            {"name": "Em Andamento", "value": task_dist["in_progress"], "color": "#3B82F6"}, # Azul
            {"name": "Concluído", "value": task_dist["completed"], "color": "#10B981"}, # Verde
        ],
        "student_ranking": student_performance
    }