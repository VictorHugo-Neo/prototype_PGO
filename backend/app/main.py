from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text
from .database import engine, Base, get_db

from .routers import users, auth, guidance, task, comment, attachment, notification, meeting, report, stats

Base.metadata.create_all(bind=engine)

app = FastAPI(title="PGO API", version="1.0.0")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://prototype-pgo.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(guidance.router)
app.include_router(task.router) 
app.include_router(comment.router)
app.include_router(attachment.router)
app.include_router(notification.router)
app.include_router(meeting.router)
app.include_router(report.router)
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(stats.router)

@app.get("/")
def read_root():
    return {"message": "API do Projeto de Gestão de Orientação está rodando!"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception:
        raise HTTPException(status_code=503, detail="Database unreachable")