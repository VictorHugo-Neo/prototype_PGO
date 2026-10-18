import random
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app import models, deps

client = TestClient(app)


def setup_guidance():
    db = SessionLocal()
    suffix = random.randint(10000, 99999)

    advisor = models.User(
        name="Advisor Kanban",
        email=f"advisor_kanban_{suffix}@test.com",
        type=models.TypeUser.ADVISOR,
        hashed_password="hash"
    )
    student = models.User(
        name="Student Kanban",
        email=f"student_kanban_{suffix}@test.com",
        type=models.TypeUser.STUDENT,
        hashed_password="hash"
    )
    other_advisor = models.User(
        name="Other Advisor",
        email=f"other_advisor_{suffix}@test.com",
        type=models.TypeUser.ADVISOR,
        hashed_password="hash"
    )
    db.add_all([advisor, student, other_advisor])
    db.commit()
    db.refresh(advisor)
    db.refresh(student)
    db.refresh(other_advisor)

    guidance = models.Guidance(
        theme="Test Kanban Guidance",
        advisor_id=advisor.id,
        student_id=student.id
    )
    db.add(guidance)
    db.commit()
    db.refresh(guidance)

    return db, advisor, student, other_advisor, guidance


def test_kanban_columns_flow():
    db, advisor, student, other_advisor, guidance = setup_guidance()

    try:
        app.dependency_overrides[deps.get_current_user] = lambda: advisor
        res_cols = client.get(f"/kanban/guidance/{guidance.id}/columns")
        assert res_cols.status_code == 200
        cols_data = res_cols.json()
        assert len(cols_data) == 3
        slugs = [c["slug"] for c in cols_data]
        assert "pending" in slugs
        assert "in_progress" in slugs
        assert "completed" in slugs

        app.dependency_overrides[deps.get_current_user] = lambda: student
        res_student_get = client.get(f"/kanban/guidance/{guidance.id}/columns")
        assert res_student_get.status_code == 200
        assert len(res_student_get.json()) == 3

        res_student_create = client.post(
            f"/kanban/guidance/{guidance.id}/columns",
            json={"title": "Coluna do Aluno", "color": "bg-purple-50"}
        )
        assert res_student_create.status_code == 403

        app.dependency_overrides[deps.get_current_user] = lambda: other_advisor
        res_other_create = client.post(
            f"/kanban/guidance/{guidance.id}/columns",
            json={"title": "Coluna Intruso", "color": "bg-red-50"}
        )
        assert res_other_create.status_code == 403

        app.dependency_overrides[deps.get_current_user] = lambda: advisor
        res_create = client.post(
            f"/kanban/guidance/{guidance.id}/columns",
            json={"title": "Revisão Final", "color": "bg-purple-50"}
        )
        assert res_create.status_code == 201
        new_col = res_create.json()
        assert new_col["title"] == "Revisão Final"
        assert new_col["slug"] == "revisao_final"
        new_col_id = new_col["id"]

        res_update = client.put(
            f"/kanban/columns/{new_col_id}",
            json={"title": "Revisão do Artigo", "color": "bg-indigo-50"}
        )
        assert res_update.status_code == 200
        assert res_update.json()["title"] == "Revisão do Artigo"

        res_task = client.post("/tasks/", json={
            "title": "Ler rascunho do artigo",
            "guidance_id": guidance.id,
            "status": "revisao_final"
        })
        assert res_task.status_code == 200
        task_data = res_task.json()
        assert task_data["status"] == "revisao_final"
        task_id = task_data["id"]

        res_del_fail = client.delete(f"/kanban/columns/{new_col_id}")
        assert res_del_fail.status_code == 400
        assert "Mova as tarefas antes de excluí-la" in res_del_fail.json()["detail"]

        res_move = client.patch(f"/tasks/{task_id}/status", json={"status": "completed"})
        assert res_move.status_code == 200
        assert res_move.json()["status"] == "completed"

        res_del_ok = client.delete(f"/kanban/columns/{new_col_id}")
        assert res_del_ok.status_code == 204

        res_after = client.get(f"/kanban/guidance/{guidance.id}/columns")
        assert res_after.status_code == 200
        remaining_slugs = [c["slug"] for c in res_after.json()]
        assert "revisao_final" not in remaining_slugs

        cols_before = res_after.json()
        col_ids_reversed = [c["id"] for c in reversed(cols_before)]
        res_reorder = client.put(
            f"/kanban/guidance/{guidance.id}/columns/reorder",
            json={"column_ids": col_ids_reversed}
        )
        assert res_reorder.status_code == 200
        assert [c["id"] for c in res_reorder.json()] == col_ids_reversed

        col_to_delete = client.post(
            f"/kanban/guidance/{guidance.id}/columns",
            json={"title": "Coluna Temporária", "color": "bg-amber-50"}
        ).json()
        target_col = [c for c in res_reorder.json() if c["id"] != col_to_delete["id"]][0]

        temp_task = client.post("/tasks/", json={
            "title": "Tarefa em coluna temporária",
            "guidance_id": guidance.id,
            "status": col_to_delete["slug"]
        }).json()

        res_del_migrate = client.delete(f"/kanban/columns/{col_to_delete['id']}?target_column_id={target_col['id']}")
        assert res_del_migrate.status_code == 204

        migrated_task = client.get(f"/tasks/{temp_task['id']}").json()
        assert migrated_task["status"] == target_col["slug"]
    finally:
        app.dependency_overrides.clear()
        db.close()
