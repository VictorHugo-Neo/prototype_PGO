from app.security import get_password_hash, verify_password, create_access_token

def test_password_hashing():
    senha = "teste123"
    hash_senha = get_password_hash(senha)

    assert hash_senha != senha
    assert verify_password(senha, hash_senha) == True
    assert verify_password("senhaerrada", hash_senha) == False

def test_jwt_creation():
    token = create_access_token(data={"sub": "teste@email.com"})
    assert isinstance(token, str)
    assert len(token) > 10