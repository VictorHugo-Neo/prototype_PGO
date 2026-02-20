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
 
    if current_user.type == 'advisor':

        guidances = db.query(models.Guidance).filter(models.Guidance.advisor_id == current_user.id).all()
    else:

        guidances = db.query(models.Guidance).filter(models.Guidance.student_id == current_user.id).all()


    total_students = len(guidances)

    guidance_ids = [g.id for g in guidances]

    task_dist = {"pending": 0, "in_progress": 0, "completed": 0}
    pending_meetings = 0
    student_performance = []

    if guidance_ids:

        tasks_query = db.query(
            models.Task.status, func.count(models.Task.id)
        ).filter(models.Task.guidance_id.in_(guidance_ids))\
         .group_by(models.Task.status).all()
        
        for status, count in tasks_query:
            if status in task_dist:
                task_dist[status] = count


        pending_meetings = db.query(models.Meeting)\
            .filter(models.Meeting.guidance_id.in_(guidance_ids), models.Meeting.status == "pending")\
            .count()


        for g in guidances:
            total = db.query(models.Task).filter(models.Task.guidance_id == g.id).count()
            completed = db.query(models.Task).filter(models.Task.guidance_id == g.id, models.Task.status == "completed").count()
            
            progress = int((completed / total * 100)) if total > 0 else 0
            student_performance.append({
                "name": g.student.name.split()[0], # Primeiro nome
                "progress": progress
            })
        

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