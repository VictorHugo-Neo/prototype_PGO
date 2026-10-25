from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text
from .database import engine, Base, get_db

from .routers import users, auth, guidance, task, comment, attachment, notification, meeting, report, stats, kanban

def init_db():
    Base.metadata.create_all(bind=engine)
    if engine.dialect.name == "postgresql":
        try:
            with engine.begin() as conn:
                conn.execute(text("""
                    DO $$
                    BEGIN
                        IF EXISTS (
                            SELECT 1
                            FROM information_schema.columns
                            WHERE table_name = 'tasks'
                              AND column_name = 'status'
                              AND udt_name = 'statustask'
                        ) THEN
                            ALTER TABLE tasks ALTER COLUMN status DROP DEFAULT;
                            ALTER TABLE tasks ALTER COLUMN status TYPE VARCHAR USING status::text;
                            ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'pending';
                        END IF;

                        IF NOT EXISTS (
                            SELECT 1
                            FROM information_schema.columns
                            WHERE table_name = 'kanban_columns'
                              AND column_name = 'created_at'
                        ) THEN
                            ALTER TABLE kanban_columns ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
                        END IF;

                        IF NOT EXISTS (
                            SELECT 1
                            FROM information_schema.columns
                            WHERE table_name = 'tasks'
                              AND column_name = 'creator_id'
                        ) THEN
                            ALTER TABLE tasks ADD COLUMN creator_id INTEGER REFERENCES users(id);
                        END IF;
                    END $$;
                """))
        except Exception:
            pass
    elif engine.dialect.name == "sqlite":
        try:
            with engine.begin() as conn:
                columns = [c[1] for c in conn.execute(text("PRAGMA table_info(tasks)")).fetchall()]
                if columns and "creator_id" not in columns:
                    conn.execute(text("ALTER TABLE tasks ADD COLUMN creator_id INTEGER REFERENCES users(id)"))
        except Exception:
            pass

init_db()

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
app.include_router(kanban.router) 
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