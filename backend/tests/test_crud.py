from app import crud, schemas, models
from app.database import SessionLocal, engine, Base

def setup_module(module):
    Base.metadata.create_all(bind=engine)

def test_create_user():
    db = SessionLocal()
    email_test = "test_crud@gmail.com"
    
    existing_user = db.query(models.User).filter_by(email=email_test).first()
    if existing_user:
        db.delete(existing_user)
        db.commit()
    
    user_in = schemas.UserCreate(
        name="Test User",
        email=email_test,
        type=models.TypeUser.STUDENT,
        password="secretpassword123"
    )
    user_created = crud.create_user(db, user_in)
    
    assert user_created.email == email_test
    assert user_created.id is not None
    db.close()


def test_meeting_crud():
    from datetime import datetime, timedelta
    db = SessionLocal()

    advisor = crud.create_user(
        db,
        schemas.UserCreate(
            name="Advisor CRUD",
            email="advisor_crud_meet@test.com",
            type=models.TypeUser.ADVISOR,
            password="secretpassword123"
        )
    )
    student = crud.create_user(
        db,
        schemas.UserCreate(
            name="Student CRUD",
            email="student_crud_meet@test.com",
            type=models.TypeUser.STUDENT,
            password="secretpassword123"
        )
    )
    guidance = crud.create_guidance(
        db,
        {"theme": "Theme Meeting CRUD", "advisor_id": advisor.id, "student_id": student.id}
    )

    meeting_time = datetime.now() + timedelta(days=1)
    meeting_in = schemas.MeetingCreate(
        date=meeting_time,
        topic="Pauta Inicial",
        guidance_id=guidance.id
    )
    created_meeting = crud.create_meeting(db, meeting_in)
    assert created_meeting.id is not None
    assert created_meeting.topic == "Pauta Inicial"
    assert created_meeting.status == "pending"

    retrieved = crud.get_meeting_by_id(db, created_meeting.id)
    assert retrieved is not None
    assert retrieved.id == created_meeting.id

    by_guidance = crud.get_meetings_by_guidance(db, guidance.id)
    assert len(by_guidance) >= 1

    updated = crud.update_meeting(db, created_meeting.id, {"topic": "Pauta Revisada"})
    assert updated.topic == "Pauta Revisada"

    status_updated = crud.update_meeting_status(db, created_meeting.id, "confirmed")
    assert status_updated.status == "confirmed"

    deleted = crud.delete_meeting(db, created_meeting.id)
    assert deleted is True
    assert crud.get_meeting_by_id(db, created_meeting.id) is None

    db.delete(guidance)
    db.delete(advisor)
    db.delete(student)
    db.commit()
    db.close()
