from fastapi import APIRouter, HTTPException

from app.core.db import pool

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/health/db")
def health_db():
    try:
        with pool.connection() as conn:
            row = conn.execute("select 1").fetchone()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="database unreachable") from exc
    return {"db": "ok" if row and row[0] == 1 else "error"}