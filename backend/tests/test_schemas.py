from datetime import datetime
from app.schemas import UserCreate, TypeUser, MeetingCreate, MeetingUpdate, MeetingResponse

def test_user_create_schema_valid():
    user = UserCreate(
        name="Teste",
        email="teste@gmail.com",
        type=TypeUser.ADVISOR,
        password="secretpassword123"
    )
    assert user.email == "teste@gmail.com"
    assert user.name == "Teste"
    assert user.type == TypeUser.ADVISOR


def test_meeting_schemas_valid():
    now = datetime.now()
    create_schema = MeetingCreate(
        date=now,
        topic="Definição de Tema",
        guidance_id=1
    )
    assert create_schema.topic == "Definição de Tema"
    assert create_schema.guidance_id == 1

    update_schema = MeetingUpdate(
        topic="Novo Tema"
    )
    assert update_schema.topic == "Novo Tema"
    assert update_schema.date is None

    response_schema = MeetingResponse(
        id=10,
        date=now,
        topic="Definição de Tema",
        status="pending",
        created_at=now,
        guidance_id=1
    )
    assert response_schema.id == 10
    assert response_schema.status == "pending"
    assert response_schema.guidance_id == 1

