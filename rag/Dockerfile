# Multi-stage Dockerfile for MoukawilOS RAG Service (Python / FastAPI)
FROM python:3.13-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY requirements.txt ./
RUN pip install --user --no-cache-dir -r requirements.txt

# Development stage (used for docker compose live reload)
FROM base AS development
COPY --from=deps /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH
COPY requirements.txt ./
COPY app ./app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Production runner stage
FROM base AS runner
RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -s /bin/sh appuser

COPY --from=deps /root/.local /home/appuser/.local
ENV PATH=/home/appuser/.local/bin:$PATH

COPY app ./app

RUN chown -R appuser:appgroup /app /home/appuser/.local
USER appuser

EXPOSE 8000
ENV RAG_HOST=0.0.0.0
ENV RAG_PORT=8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
