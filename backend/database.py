"""
Database configuration and session management for AI Emotion Recognition System.
Uses SQLite for zero-configuration, reliable persistence across user accounts and analysis records.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database path in the backend directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "emotion_system.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_FILE}"

# Engine with check_same_thread=False for SQLite concurrency in FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency to yield a database session and close it after request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
