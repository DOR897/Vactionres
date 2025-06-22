# app/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ► Change this URL to whatever database you’re using:
SQLALCHEMY_DATABASE_URL = "sqlite:///./db.sqlite3"
# If you use PostgreSQL, for example:
# SQLALCHEMY_DATABASE_URL = (
#     "postgresql://user:password@postgresserver/dbname"
# )

# Create the SQLAlchemy engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # only for SQLite
)

# Each request will use its own Session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Base class for all models
Base = declarative_base()

# Dependency that yields a database session, then closes it
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()