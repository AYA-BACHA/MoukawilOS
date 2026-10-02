import os
from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="MoukawilOS RAG Service",
    description="Microservice for regulatory search and context retrieval",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "moukawilos-rag",
    }


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("RAG_HOST", "0.0.0.0")
    port = int(os.getenv("RAG_PORT", 8000))
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
