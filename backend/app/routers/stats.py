from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, deps
from ..database import get_db

router = APIRouter(prefix="/stats", tags=["stats"])

COLOR_MAP = {
    "bg-gray-100": "#9CA3AF",
    "bg-blue-50": "#3B82F6",
    "bg-green-50": "#10B981",
    "bg-emerald-50": "#10B981",
    "bg-purple-50": "#8B5CF6",
    "bg-amber-50": "#F59E0B",
    "bg-rose-50": "#F43F5E",
    "bg-indigo-50": "#6366F1",
    "bg-cyan-50": "#06B6D4",
    "pending": "#9CA3AF",
    "in_progress": "#3B82F6",
    "completed": "#10B981",
}


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

    if not guidance_ids:
        return {
            "total_students": 0,
            "total_tasks": 0,
            "completed_tasks": 0,
            "in_progress_tasks": 0,
            "pending_meetings": 0,
            "confirmed_meetings": 0,
            "overall_progress": 0,
            "task_stats": [
                {"name": "Pendente", "slug": "pending", "value": 0, "color": "#9CA3AF"},
                {"name": "Em Andamento", "slug": "in_progress", "value": 0, "color": "#3B82F6"},
                {"name": "Concluído", "slug": "completed", "value": 0, "color": "#10B981"},
            ],
            "student_ranking": [],
            "guidances_summary": {}
        }

    tasks = db.query(models.Task).filter(models.Task.guidance_id.in_(guidance_ids)).all()
    columns = (
        db.query(models.KanbanColumn)
        .filter(models.KanbanColumn.guidance_id.in_(guidance_ids))
        .order_by(models.KanbanColumn.order.asc(), models.KanbanColumn.id.asc())
        .all()
    )
    meetings = db.query(models.Meeting).filter(models.Meeting.guidance_id.in_(guidance_ids)).all()

    guidance_cols_map = defaultdict(list)
    for col in columns:
        guidance_cols_map[col.guidance_id].append(col)

    default_column_defs = [
        {"title": "Pendente", "slug": "pending", "color": "bg-gray-100", "order": 0},
        {"title": "Em Andamento", "slug": "in_progress", "color": "bg-blue-50", "order": 1},
        {"title": "Concluído", "slug": "completed", "color": "bg-green-50", "order": 2},
    ]

    status_name_map = {
        "pending": "Pendente",
        "in_progress": "Em Andamento",
        "completed": "Concluído",
    }
    status_color_map = {
        "pending": "#9CA3AF",
        "in_progress": "#3B82F6",
        "completed": "#10B981",
    }

    for col in columns:
        status_name_map[col.slug] = col.title
        status_color_map[col.slug] = COLOR_MAP.get(col.color, "#8B5CF6")

    task_counts_by_status = defaultdict(int)
    for t in tasks:
        task_counts_by_status[t.status] += 1

    guidances_summary = {}
    student_performance = []

    for g in guidances:
        g_tasks = [t for t in tasks if t.guidance_id == g.id]
        raw_cols = guidance_cols_map.get(g.id)
        if not raw_cols:
            cols_info = default_column_defs
        else:
            cols_info = [
                {"title": c.title, "slug": c.slug, "color": c.color, "order": c.order}
                for c in raw_cols
            ]

        completed_slugs = {c["slug"] for c in cols_info if c["slug"] in ("completed", "concluido", "concluida")}
        if not completed_slugs and cols_info:
            completed_slugs = {cols_info[-1]["slug"]}
        elif not completed_slugs:
            completed_slugs = {"completed"}

        pending_slugs = {c["slug"] for c in cols_info if c["slug"] in ("pending", "a_fazer", "a-fazer")}
        if not pending_slugs and cols_info:
            pending_slugs = {cols_info[0]["slug"]}
        elif not pending_slugs:
            pending_slugs = {"pending"}

        total_t = len(g_tasks)
        completed_t = sum(1 for t in g_tasks if t.status in completed_slugs)
        pending_t = sum(1 for t in g_tasks if t.status in pending_slugs)
        in_progress_t = total_t - completed_t - pending_t
        progress = int((completed_t / total_t * 100)) if total_t > 0 else 0

        g_meetings = [m for m in meetings if m.guidance_id == g.id]
        pending_m = sum(1 for m in g_meetings if m.status == "pending")
        confirmed_m = sum(1 for m in g_meetings if m.status == "confirmed")

        cols_breakdown = [
            {
                "title": c["title"],
                "slug": c["slug"],
                "color": c["color"],
                "task_count": sum(1 for t in g_tasks if t.status == c["slug"]),
            }
            for c in cols_info
        ]

        guidances_summary[str(g.id)] = {
            "guidance_id": g.id,
            "total_tasks": total_t,
            "completed_tasks": completed_t,
            "in_progress_tasks": in_progress_t,
            "pending_tasks": pending_t,
            "progress": progress,
            "pending_meetings": pending_m,
            "confirmed_meetings": confirmed_m,
            "columns": cols_breakdown,
        }

        student_performance.append({
            "id": g.student.id,
            "guidance_id": g.id,
            "name": g.student.name.split()[0],
            "full_name": g.student.name,
            "theme": g.theme,
            "progress": progress,
            "total_tasks": total_t,
            "completed_tasks": completed_t,
        })

    student_performance = sorted(student_performance, key=lambda x: x['progress'], reverse=True)

    task_stats_list = []
    base_slugs = ["pending", "in_progress", "completed"]
    for slug in base_slugs:
        task_stats_list.append({
            "name": status_name_map[slug],
            "slug": slug,
            "value": task_counts_by_status.get(slug, 0),
            "color": status_color_map[slug],
        })

    for slug, count in task_counts_by_status.items():
        if slug not in base_slugs:
            task_stats_list.append({
                "name": status_name_map.get(slug, slug.title()),
                "slug": slug,
                "value": count,
                "color": status_color_map.get(slug, "#8B5CF6"),
            })

    total_tasks_count = len(tasks)
    total_completed_tasks = sum(s["completed_tasks"] for s in guidances_summary.values())
    total_in_progress_tasks = sum(s["in_progress_tasks"] for s in guidances_summary.values())
    pending_meetings_count = sum(1 for m in meetings if m.status == "pending")
    confirmed_meetings_count = sum(1 for m in meetings if m.status == "confirmed")
    overall_progress = int((total_completed_tasks / total_tasks_count * 100)) if total_tasks_count > 0 else 0

    return {
        "total_students": total_students,
        "total_tasks": total_tasks_count,
        "completed_tasks": total_completed_tasks,
        "in_progress_tasks": total_in_progress_tasks,
        "pending_meetings": pending_meetings_count,
        "confirmed_meetings": confirmed_meetings_count,
        "overall_progress": overall_progress,
        "task_stats": task_stats_list,
        "student_ranking": student_performance,
        "guidances_summary": guidances_summary,
    }
