import random
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app import models, deps

client = TestClient(app)


def setup_stats_data():
    db = SessionLocal()
    suffix = random.randint(10000, 99999)

    advisor = models.User(
        name="Advisor Stats",
        email=f"advisor_stats_{suffix}@test.com",
        type=models.TypeUser.ADVISOR,
        hashed_password="hash"
    )
    student1 = models.User(
        name="Ana Clara",
        email=f"ana_{suffix}@test.com",
        type=models.TypeUser.STUDENT,
        hashed_password="hash"
    )
    student2 = models.User(
        name="Bruno Lima",
        email=f"bruno_{suffix}@test.com",
        type=models.TypeUser.STUDENT,
        hashed_password="hash"
    )
    db.add_all([advisor, student1, student2])
    db.commit()
    db.refresh(advisor)
    db.refresh(student1)
    db.refresh(student2)

    g1 = models.Guidance(theme="Inteligência Artificial no Diagnóstico", advisor_id=advisor.id, student_id=student1.id)
    g2 = models.Guidance(theme="Segurança em Sistemas Distribuídos", advisor_id=advisor.id, student_id=student2.id)
    db.add_all([g1, g2])
    db.commit()
    db.refresh(g1)
    db.refresh(g2)

    c1_1 = models.KanbanColumn(guidance_id=g1.id, title="A Fazer", slug="pending", color="bg-gray-100", order=0)
    c1_2 = models.KanbanColumn(guidance_id=g1.id, title="Em Andamento", slug="in_progress", color="bg-blue-50", order=1)
    c1_3 = models.KanbanColumn(guidance_id=g1.id, title="Revisão", slug="revisao", color="bg-purple-50", order=2)
    c1_4 = models.KanbanColumn(guidance_id=g1.id, title="Concluído", slug="completed", color="bg-green-50", order=3)
    db.add_all([c1_1, c1_2, c1_3, c1_4])

    t1 = models.Task(title="Levantamento Bibliográfico", status="completed", guidance_id=g1.id)
    t2 = models.Task(title="Definição da Arquitetura", status="revisao", guidance_id=g1.id)
    t3 = models.Task(title="Implementação do Modelo", status="pending", guidance_id=g1.id)
    db.add_all([t1, t2, t3])

    t4 = models.Task(title="Artigo Inicial", status="completed", guidance_id=g2.id)
    db.add(t4)

    m1 = models.Meeting(date=datetime.now() + timedelta(days=2), topic="Alinhamento", status="pending", guidance_id=g1.id)
    m2 = models.Meeting(date=datetime.now() + timedelta(days=5), topic="Banca Prévia", status="confirmed", guidance_id=g1.id)
    db.add_all([m1, m2])

    db.commit()

    return db, advisor, student1, student2, g1, g2


def test_dashboard_stats_flow():
    db, advisor, student1, student2, g1, g2 = setup_stats_data()

    try:
        app.dependency_overrides[deps.get_current_user] = lambda: advisor
        res = client.get("/stats/dashboard")
        assert res.status_code == 200
        data = res.json()

        assert data["total_students"] == 2
        assert data["total_tasks"] == 4
        assert data["completed_tasks"] == 2
        assert data["pending_meetings"] == 1
        assert data["confirmed_meetings"] == 1
        assert data["overall_progress"] == 50

        slugs = [s["slug"] for s in data["task_stats"]]
        assert "pending" in slugs
        assert "in_progress" in slugs
        assert "completed" in slugs
        assert "revisao" in slugs

        summary = data["guidances_summary"]
        assert str(g1.id) in summary
        assert str(g2.id) in summary
        assert summary[str(g1.id)]["total_tasks"] == 3
        assert summary[str(g1.id)]["completed_tasks"] == 1
        assert summary[str(g1.id)]["progress"] == 33
        assert summary[str(g1.id)]["pending_meetings"] == 1

        ranking = data["student_ranking"]
        assert len(ranking) == 2
        assert ranking[0]["name"] == "Bruno"
        assert ranking[0]["progress"] == 100
        assert ranking[1]["name"] == "Ana"
        assert ranking[1]["progress"] == 33

    finally:
        app.dependency_overrides.clear()
        db.close()
