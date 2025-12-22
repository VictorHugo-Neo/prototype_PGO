from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .config import settings
from .routers import users, task, chat

Base.metadata.create_all(bind=engine)
app = FastAPI(title=settings.PROJETC_NAME)

origins = [
    "http://localhost:3000", # React default
    "http://localhost:5173", # Vite default
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")

def read_root():
    return {"message":"Prototype PGO", "docs": "/docs"}

app.include_router(users.router)
app.include_router(task.router)
app.include_router(chat.router)