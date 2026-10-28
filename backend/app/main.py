from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    analytics,
    assistant,
    clients,
    compliance,
    health,
    invoices,
    lookups,
    me,
    onboarding,
    profile,
)
from app.core.config import settings
from app.core.db import pool
import logging

@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.basicConfig(level=logging.WARNING)
    logging.getLogger("psycopg.pool").setLevel(logging.WARNING)
    pool.open(wait=True, timeout=10)
    yield
    pool.close()


app = FastAPI(title="MoukawilOS API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "https://moukawil-os.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(me.router)
app.include_router(onboarding.router)
app.include_router(clients.router)
app.include_router(invoices.router)
app.include_router(profile.router)
app.include_router(lookups.router)
app.include_router(assistant.router)
app.include_router(analytics.router)
app.include_router(compliance.router)

# Mount /api aliases to match docs/api.md specifications
app.include_router(analytics.router, prefix="/api")
app.include_router(compliance.router, prefix="/api")
app.include_router(invoices.router, prefix="/api")
app.include_router(clients.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(assistant.router, prefix="/api")