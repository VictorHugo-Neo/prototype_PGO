import random
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app import models, deps

client = TestClient(app)

def test_coadvisor_flow_and_single_advisor_restriction():
    db = SessionLocal()
    suffix = random.randint(100000, 999999)

    advisor1 = models.User(
        name="Prof. Carlos Alberto",
        email=f"advisor1_{suffix}@test.com",
        type=models.TypeUser.ADVISOR,
        hashed_password="hash"
    )
    advisor2 = models.User(
        name="Profa. Regina Coorientadora",
        email=f"advisor2_{suffix}@test.com",
        type=models.TypeUser.ADVISOR,
        hashed_password="hash"
    )
    student = models.User(
        name="Mariana Discente",
        email=f"student_{suffix}@test.com",
        type=models.TypeUser.STUDENT,
        hashed_password="hash"
    )
    db.add_all([advisor1, advisor2, student])
    db.commit()
    db.refresh(advisor1)
    db.refresh(advisor2)
    db.refresh(student)

    try:
        app.dependency_overrides[deps.get_current_user] = lambda: advisor1
        
        self_coadvisor_res = client.post("/guidances/link", json={
            "student_email": student.email,
            "theme": "Projeto de Pesquisa em IA",
            "coadvisor_email": advisor1.email
        })
        assert self_coadvisor_res.status_code == 400
        assert "mesmo professor" in self_coadvisor_res.json()["detail"].lower()

        link_res = client.post("/guidances/link", json={
            "student_email": student.email,
            "theme": "Projeto de Pesquisa em IA",
            "coadvisor_email": advisor2.email
        })
        assert link_res.status_code == 200
        guidance_data = link_res.json()
        guidance_id = guidance_data["id"]
        assert guidance_data["advisor_id"] == advisor1.id
        assert guidance_data["coadvisor_id"] == advisor2.id

        app.dependency_overrides[deps.get_current_user] = lambda: advisor2
        dup_res = client.post("/guidances/link", json={
            "student_email": student.email,
            "theme": "Tentativa de Outro Orientador Vincular"
        })
        assert dup_res.status_code == 400
        assert "já possui uma orientação" in dup_res.json()["detail"].lower()

        my_students_res = client.get("/guidances/my-students")
        assert my_students_res.status_code == 200
        students_list = my_students_res.json()
        matching = next((g for g in students_list if g["id"] == guidance_id), None)
        assert matching is not None
        assert matching["user_role"] == "coadvisor"

        guidance_detail = client.get(f"/guidances/{guidance_id}")
        assert guidance_detail.status_code == 200
        assert guidance_detail.json()["user_role"] == "coadvisor"

        task_res = client.post("/tasks/", json={
            "guidance_id": guidance_id,
            "title": "Revisão dos Modelos Estatísticos",
            "description": "Elaborar análise comparativa dos métodos"
        })
        assert task_res.status_code == 200
        task_data = task_res.json()
        assert task_data["creator_id"] == advisor2.id
        assert task_data["creator_role"] == "coadvisor"
        created_task_id = task_data["id"]

        app.dependency_overrides[deps.get_current_user] = lambda: student
        student_task_res = client.post("/tasks/", json={
            "guidance_id": guidance_id,
            "title": "Coleta dos Datasets",
            "description": "Buscar dados abertos"
        })
        assert student_task_res.status_code == 200
        assert student_task_res.json()["creator_role"] == "student"

        app.dependency_overrides[deps.get_current_user] = lambda: advisor2
        comment_res = client.post("/comments/", json={
            "task_id": created_task_id,
            "content": "Excelente abordagem inicial, sugiro incluir métricas F1-Score."
        })
        assert comment_res.status_code == 200
        comment_data = comment_res.json()
        assert comment_data["user_role"] == "coadvisor"
        assert comment_data["user_name"] == advisor2.name

        notifs = db.query(models.Notification).filter(
            models.Notification.link == f"/guidance/{guidance_id}"
        ).all()
        notified_users = {n.user_id for n in notifs}
        assert advisor1.id in notified_users
        assert student.id in notified_users
        assert any("Coorientador" in n.message for n in notifs)

        meeting_res = client.post("/meetings/", json={
            "guidance_id": guidance_id,
            "date": (datetime.utcnow() + timedelta(days=7)).isoformat(),
            "topic": "Alinhamento com Coorientadora"
        })
        assert meeting_res.status_code == 200
        assert meeting_res.json()["creator_role"] == "coadvisor"

        defense_time = (datetime.utcnow() + timedelta(days=60)).isoformat()
        defense_res = client.put(f"/guidances/{guidance_id}/defense-date", json={
            "defense_date": defense_time
        })
        assert defense_res.status_code == 200

        pdf_res = client.get(f"/report/{guidance_id}?preview=true")
        assert pdf_res.status_code == 200
        assert pdf_res.headers["content-type"] == "application/pdf"

    finally:
        app.dependency_overrides.clear()
        db.close()


def test_post_hoc_coadvisor_management():
    db = SessionLocal()
    suffix = random.randint(100000, 999999)

    advisor = models.User(
        name="Prof. Orientador Principal",
        email=f"main_adv_{suffix}@test.com",
        type=models.TypeUser.ADVISOR,
        hashed_password="hash"
    )
    coadvisor = models.User(
        name="Profa. Nova Coorientadora",
        email=f"late_coadv_{suffix}@test.com",
        type=models.TypeUser.ADVISOR,
        hashed_password="hash"
    )
    other_advisor = models.User(
        name="Prof. Intruso",
        email=f"intruso_{suffix}@test.com",
        type=models.TypeUser.ADVISOR,
        hashed_password="hash"
    )
    student = models.User(
        name="Aluno Sem Coorientador Inicial",
        email=f"aluno_{suffix}@test.com",
        type=models.TypeUser.STUDENT,
        hashed_password="hash"
    )
    db.add_all([advisor, coadvisor, other_advisor, student])
    db.commit()
    db.refresh(advisor)
    db.refresh(coadvisor)
    db.refresh(other_advisor)
    db.refresh(student)

    try:
        app.dependency_overrides[deps.get_current_user] = lambda: advisor
        link_res = client.post("/guidances/link", json={
            "student_email": student.email,
            "theme": "Projeto que Ganhou Coorientador Posteriormente"
        })
        assert link_res.status_code == 200
        guidance_id = link_res.json()["id"]
        assert link_res.json()["coadvisor_id"] is None

        app.dependency_overrides[deps.get_current_user] = lambda: other_advisor
        forbidden_res = client.put(f"/guidances/{guidance_id}/coadvisor", json={
            "coadvisor_email": coadvisor.email
        })
        assert forbidden_res.status_code == 403

        app.dependency_overrides[deps.get_current_user] = lambda: student
        student_forbidden = client.put(f"/guidances/{guidance_id}/coadvisor", json={
            "coadvisor_email": coadvisor.email
        })
        assert student_forbidden.status_code == 403

        app.dependency_overrides[deps.get_current_user] = lambda: advisor
        add_res = client.put(f"/guidances/{guidance_id}/coadvisor", json={
            "coadvisor_email": coadvisor.email
        })
        assert add_res.status_code == 200
        assert add_res.json()["coadvisor"]["id"] == coadvisor.id
        assert add_res.json()["coadvisor"]["email"] == coadvisor.email

        app.dependency_overrides[deps.get_current_user] = lambda: other_advisor
        del_forbidden = client.delete(f"/guidances/{guidance_id}/coadvisor")
        assert del_forbidden.status_code == 403

        app.dependency_overrides[deps.get_current_user] = lambda: advisor
        del_res = client.delete(f"/guidances/{guidance_id}/coadvisor")
        assert del_res.status_code == 200
        assert del_res.json()["coadvisor"] is None
        assert del_res.json()["coadvisor_id"] is None

    finally:
        app.dependency_overrides.clear()
        db.close()
