import random
from datetime import datetime
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app import models, deps

client = TestClient(app)


def setup_guidance_data():
    db = SessionLocal()
    suffix = random.randint(10000, 99999)

    advisor = models.User(
        name=f"Prof. Orientador {suffix}",
        email=f"advisor_report_{suffix}@test.com",
        type=models.TypeUser.ADVISOR,
        hashed_password="hash",
    )
    student = models.User(
        name=f"Aluno João Víctor {suffix}",
        email=f"student_report_{suffix}@test.com",
        type=models.TypeUser.STUDENT,
        hashed_password="hash",
    )
    intruder = models.User(
        name=f"Outro Usuário {suffix}",
        email=f"intruder_{suffix}@test.com",
        type=models.TypeUser.ADVISOR,
        hashed_password="hash",
    )

    db.add_all([advisor, student, intruder])
    db.commit()
    db.refresh(advisor)
    db.refresh(student)
    db.refresh(intruder)

    guidance = models.Guidance(
        theme="Desenvolvimento de Software para Gestão de TCC",
        advisor_id=advisor.id,
        student_id=student.id,
        defense_date=datetime(2026, 12, 10, 14, 30),
    )
    db.add(guidance)
    db.commit()
    db.refresh(guidance)

    col_pending = models.KanbanColumn(guidance_id=guidance.id, title="A Fazer", slug="pending", order=0)
    col_progress = models.KanbanColumn(guidance_id=guidance.id, title="Em Andamento", slug="in_progress", order=1)
    col_done = models.KanbanColumn(guidance_id=guidance.id, title="Concluído", slug="completed", order=2)
    db.add_all([col_pending, col_progress, col_done])
    db.commit()

    task1 = models.Task(
        title="Elaboração do Cronograma e Referencial Teórico",
        description="Pesquisa e levantamento bibliográfico das principais referências.",
        status="completed",
        order=0,
        guidance_id=guidance.id,
        time_estimate=datetime(2026, 3, 1),
    )
    task2 = models.Task(
        title="Desenvolvimento dos Protótipos de Interface",
        description="Construção das telas no Figma e validação com usuários.",
        status="in_progress",
        order=1,
        guidance_id=guidance.id,
        time_estimate=datetime(2026, 5, 15),
    )
    db.add_all([task1, task2])
    db.commit()

    meeting = models.Meeting(
        date=datetime(2026, 4, 10, 10, 0),
        topic="Alinhamento sobre metodologia e cronograma de entregas.",
        status="confirmed",
        guidance_id=guidance.id,
    )
    db.add(meeting)
    db.commit()

    return db, advisor, student, intruder, guidance


def test_generate_pdf_report_as_advisor():
    db, advisor, student, _, guidance = setup_guidance_data()
    try:
        app.dependency_overrides[deps.get_current_user] = lambda: advisor
        response = client.get(f"/report/{guidance.id}")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert "attachment" in response.headers["content-disposition"]
        assert response.content.startswith(b"%PDF-")
    finally:
        app.dependency_overrides.clear()
        db.close()


def test_generate_pdf_report_as_student():
    db, advisor, student, _, guidance = setup_guidance_data()
    try:
        app.dependency_overrides[deps.get_current_user] = lambda: student
        response = client.get(f"/report/{guidance.id}?preview=true")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert "inline" in response.headers["content-disposition"]
        assert response.content.startswith(b"%PDF-")
    finally:
        app.dependency_overrides.clear()
        db.close()


def test_generate_pdf_report_unauthorized_user():
    db, advisor, student, intruder, guidance = setup_guidance_data()
    try:
        app.dependency_overrides[deps.get_current_user] = lambda: intruder
        response = client.get(f"/report/{guidance.id}")
        assert response.status_code == 403
        assert "não tem permissão" in response.json()["detail"]
    finally:
        app.dependency_overrides.clear()
        db.close()


def test_generate_pdf_report_not_found():
    db, advisor, _, _, _ = setup_guidance_data()
    try:
        app.dependency_overrides[deps.get_current_user] = lambda: advisor
        response = client.get("/report/9999999")
        assert response.status_code == 404
        assert "não encontrada" in response.json()["detail"]
    finally:
        app.dependency_overrides.clear()
        db.close()


def test_generate_pdf_report_empty_guidance():
    db = SessionLocal()
    suffix = random.randint(10000, 99999)
    advisor = models.User(
        name=f"Advisor Empty {suffix}",
        email=f"empty_advisor_{suffix}@test.com",
        type=models.TypeUser.ADVISOR,
        hashed_password="hash",
    )
    student = models.User(
        name=f"Student Empty {suffix}",
        email=f"empty_student_{suffix}@test.com",
        type=models.TypeUser.STUDENT,
        hashed_password="hash",
    )
    db.add_all([advisor, student])
    db.commit()
    db.refresh(advisor)
    db.refresh(student)

    guidance = models.Guidance(
        theme="Orientação Vazia sem Tarefas",
        advisor_id=advisor.id,
        student_id=student.id,
    )
    db.add(guidance)
    db.commit()
    db.refresh(guidance)

    try:
        app.dependency_overrides[deps.get_current_user] = lambda: advisor
        response = client.get(f"/report/{guidance.id}")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert response.content.startswith(b"%PDF-")
    finally:
        app.dependency_overrides.clear()
        db.close()


def test_generate_pdf_report_with_custom_kanban_columns():
    db = SessionLocal()
    suffix = random.randint(10000, 99999)
    advisor = models.User(
        name=f"Advisor Custom {suffix}",
        email=f"custom_advisor_{suffix}@test.com",
        type=models.TypeUser.ADVISOR,
        hashed_password="hash",
    )
    student = models.User(
        name=f"Student Custom {suffix}",
        email=f"custom_student_{suffix}@test.com",
        type=models.TypeUser.STUDENT,
        hashed_password="hash",
    )
    db.add_all([advisor, student])
    db.commit()
    db.refresh(advisor)
    db.refresh(student)

    guidance = models.Guidance(
        theme="Orientação com Colunas Customizadas",
        advisor_id=advisor.id,
        student_id=student.id,
    )
    db.add(guidance)
    db.commit()
    db.refresh(guidance)

    col1 = models.KanbanColumn(guidance_id=guidance.id, title="Planejamento", slug="planejamento", color="bg-purple-50", order=0)
    col2 = models.KanbanColumn(guidance_id=guidance.id, title="Desenvolvimento", slug="dev", color="bg-blue-50", order=1)
    col3 = models.KanbanColumn(guidance_id=guidance.id, title="Revisão Final", slug="revisao", color="bg-amber-50", order=2)
    col4 = models.KanbanColumn(guidance_id=guidance.id, title="Entregue e Validado", slug="entregue", color="bg-emerald-50", order=3)
    db.add_all([col1, col2, col3, col4])
    db.commit()

    t1 = models.Task(title="Estudo da Arte", status="planejamento", guidance_id=guidance.id, order=0)
    t2 = models.Task(title="Implementação de Algoritmo", status="dev", guidance_id=guidance.id, order=0)
    t3 = models.Task(title="Revisão do Artigo", status="revisao", guidance_id=guidance.id, order=0)
    t4 = models.Task(title="Depósito Final do TCC", status="entregue", guidance_id=guidance.id, order=0)
    db.add_all([t1, t2, t3, t4])
    db.commit()

    try:
        app.dependency_overrides[deps.get_current_user] = lambda: advisor
        response = client.get(f"/report/{guidance.id}")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert response.content.startswith(b"%PDF-")
    finally:
        app.dependency_overrides.clear()
        db.close()

