from app.schemas import UserCreate, TypeUser

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
