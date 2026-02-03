from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base

from .routers import users, auth, guidance, chat, task, comment, attachment, notification, meeting, ai, report, stats

Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://prototype-pgo.vercel.app/",
    "*"
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
app.include_router(comment.router)
app.include_router(attachment.router)
app.include_router(attachment.router)
app.include_router(notification.router)
app.include_router(meeting.router)
app.include_router(ai.router)
app.include_router(report.router)
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(stats.router)

@app.get("/")
def read_root():
    return {"message": "API do Projeto de Gestão de Orientação está rodando!"}