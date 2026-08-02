import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DB_PATH = os.getenv("DATABASE_URL")
if not DB_PATH:
    if os.getenv("VERCEL") == "1":
        DB_PATH = "sqlite:////tmp/database.db"
    else:
        DB_PATH = "sqlite:///./database.db"

if DB_PATH.startswith("sqlite:///") and not DB_PATH.startswith("sqlite:////"):
    # Ensure relative paths resolve relative to backend directory
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sqlite_rel = DB_PATH.replace("sqlite:///", "")
    abs_db_path = os.path.join(backend_dir, sqlite_rel)
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{abs_db_path}"
else:
    SQLALCHEMY_DATABASE_URL = DB_PATH

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from db.models import Document, Quiz, Submission  # noqa: F401
    Base.metadata.create_all(bind=engine)
