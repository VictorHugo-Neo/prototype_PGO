from app.database import Base
from app import models

def test_models_tables_exist():
    expected_tables = {'users', 'guidances', 'tasks', 'attachments', 'comments', 'notifications', 'meetings'}
    registered_tables = set(Base.metadata.tables.keys())
    assert expected_tables.issubset(registered_tables)