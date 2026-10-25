import random
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app import models, deps

client = TestClient(app)

def test_defense_date_crud():
    db = SessionLocal()
    suffix = random.randint(10000, 99999)

    advisor = models.User(
        name="Advisor Defense Test",
        email=f"advisor_def_{suffix}@test.com",
        type=models.TypeUser.ADVISOR,
        hashed_password="hash"
    )
    student = models.User(
        name="Student Defense Test",
        email=f"student_def_{suffix}@test.com",
        type=models.TypeUser.STUDENT,
        hashed_password="hash"
    )
    other_advisor = models.User(
        name="Other Advisor Test",
        email=f"other_adv_{suffix}@test.com",
        type=models.TypeUser.ADVISOR,
        hashed_password="hash"
    )
    db.add_all([advisor, student, other_advisor])
    db.commit()
    db.refresh(advisor)
    db.refresh(student)
    db.refresh(other_advisor)

    guidance = models.Guidance(
        theme="TCC Usabilidade e IA",
        advisor_id=advisor.id,
        student_id=student.id,
        defense_date=None
    )
    db.add(guidance)
    db.commit()
    db.refresh(guidance)

    try:
        app.dependency_overrides[deps.get_current_user] = lambda: advisor
        res = client.get(f"/guidances/{guidance.id}")
        assert res.status_code == 200
        assert res.json()["defense_date"] is None

        target_date = datetime.now() + timedelta(days=30)
        target_iso = target_date.isoformat()
        put_res = client.put(
            f"/guidances/{guidance.id}/defense-date",
            json={"defense_date": target_iso}
        )
        assert put_res.status_code == 200
        assert put_res.json()["defense_date"] is not None

        rescheduled_date = datetime.now() + timedelta(days=45)
        rescheduled_iso = rescheduled_date.isoformat()
        patch_res = client.patch(
            f"/guidances/{guidance.id}",
            json={"defense_date": rescheduled_iso}
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["defense_date"] is not None

        del_res = client.delete(f"/guidances/{guidance.id}/defense-date")
        assert del_res.status_code == 200
        assert del_res.json()["defense_date"] is None

        get_after_del = client.get(f"/guidances/{guidance.id}")
        assert get_after_del.json()["defense_date"] is None

        client.put(
            f"/guidances/{guidance.id}/defense-date",
            json={"defense_date": target_iso}
        )
        patch_null = client.patch(
            f"/guidances/{guidance.id}",
            json={"defense_date": None}
        )
        assert patch_null.status_code == 200
        assert patch_null.json()["defense_date"] is None

        app.dependency_overrides[deps.get_current_user] = lambda: student
        student_put = client.put(
            f"/guidances/{guidance.id}/defense-date",
            json={"defense_date": target_iso}
        )
        assert student_put.status_code == 403

        student_del = client.delete(f"/guidances/{guidance.id}/defense-date")
        assert student_del.status_code == 403

        app.dependency_overrides[deps.get_current_user] = lambda: other_advisor
        other_put = client.put(
            f"/guidances/{guidance.id}/defense-date",
            json={"defense_date": target_iso}
        )
        assert other_put.status_code == 404

    finally:
        app.dependency_overrides.clear()
        db.delete(guidance)
        db.delete(advisor)
        db.delete(student)
        db.delete(other_advisor)
        db.commit()
        db.close()
