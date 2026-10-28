import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from app.retrieval.search import search

load_dotenv()

logger = logging.getLogger(__name__)

app = FastAPI(
    title="MoukawilOS RAG Service",
    description="Microservice for regulatory search and context retrieval",
    version="0.1.0",
)


class RetrieveRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    top_k: int = Field(default=5, ge=1, le=20)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "moukawilos-rag",
    }


@app.post("/retrieve")
def retrieve_passages(request: RetrieveRequest):
    if not request.question.strip():
        raise HTTPException(
            status_code=422,
            detail="The question must not be empty.",
        )

    try:
        results = search(request.question, top_k=request.top_k)
    except Exception as exc:
        logger.exception("Retrieval failed")
        raise HTTPException(
            status_code=500,
            detail="The retrieval service could not process the request.",
        ) from exc

    return {
        "question": request.question,
        "results_count": len(results),
        "results": results,
    }


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("RAG_HOST", "0.0.0.0")
    port = int(os.getenv("RAG_PORT", 8000))
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
