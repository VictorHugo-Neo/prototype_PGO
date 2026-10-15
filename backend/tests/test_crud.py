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