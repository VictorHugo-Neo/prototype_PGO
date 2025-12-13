import pytest
from pydantic import ValidationError
from app.schemas import UserCreate, TypeUser

def test_user_create_schema_valid():
    user = UserCreate(
        name = "Teste",
        email = "teste@gmail.com",
        type = TypeUser.ADVISOR
    )
    assert user.email == "teste@gmail.com"
