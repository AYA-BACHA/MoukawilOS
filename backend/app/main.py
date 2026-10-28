from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import clients, health, me, onboarding , invoices , profile , lookups , compliance , manual_income , auth
from app.core.config import settings
from app.core.db import pool
import logging

@asynccontextmanager
async def lifespan(app: FastAPI):
    settings.check_required()
    logging.basicConfig(level=logging.WARNING)
    logging.getLogger("psycopg.pool").setLevel(logging.WARNING)
    pool.open(wait=True, timeout=10)
    yield
    pool.close()


app = FastAPI(title="MoukawilOS API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
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
app.include_router(compliance.router)
app.include_router(manual_income.router)
app.include_router(auth.router)