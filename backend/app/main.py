from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base

from .routers import users, auth, guidance, chat, task 

Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluindo as rotas
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(guidance.router)
app.include_router(chat.router)
app.include_router(task.router) 

@app.get("/")
def read_root():
    return {"message": "API do Projeto de Gestão de Orientação está rodando!"}