from datetime import datetime, timezone
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

from app.core.db import get_db, pool

logger = logging.getLogger(__name__)

router = APIRouter(tags=["health"])


@router.get("/health", status_code=status.HTTP_200_OK)
def health(db: Any = Depends(get_db)):
    try:
        if db is None:
            raise ConnectionError("Database connection pool unavailable or closed")

        # Execute lightweight check: SELECT 1
        # Supports both SQLAlchemy Session and psycopg Connection
        try:
            from sqlalchemy import text
            try:
                db.execute(text("SELECT 1"))
            except Exception:
                db.execute("SELECT 1")
        except ImportError:
            db.execute("SELECT 1")

        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        logger.error("Health check database probe failed: %s", e)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e),
            },
        )


@router.get("/health/db")
def health_db():
    try:
        with pool.connection() as conn:
            row = conn.execute("select 1").fetchone()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="database unreachable") from exc
    return {"db": "ok" if row and row[0] == 1 else "error"}
