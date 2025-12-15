from app.database import engine, Base
from app import models
from sqlalchemy import inspect

def test_models_tables_exist():
    Base.metadata.drop_all(bind=engine) # It helps when there are any changes to the models.
    Base.metadata.create_all(bind=engine)
    
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    expected_tables = {'users', 'guidances', 'tasks'}
    assert expected_tables.issubset(set(tables))