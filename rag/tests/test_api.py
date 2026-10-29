from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

SAMPLE_RESULT = {
    "score": 0.91,
    "chunk_id": "JORADP-2022-085:art-1",
    "document_id": "JORADP-2022-085",
    "document_number": "22-23",
    "title": "Loi relative au statut de l'auto-entrepreneur",
    "source_file": "F2022085.pdf",
    "source_pages": [3],
    "language": "fr",
    "type": "article",
    "article_number": "1",
    "article_label": "Article 1er",
    "review_status": "pending",
    "segmentation_status": "pilot",
    "text": "Sample legal passage for API testing.",
}


def test_health():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "moukawilos-rag",
    }


def test_retrieve_returns_passages(monkeypatch):
    def fake_search(question, top_k=5):
        assert question == "Quelle loi fixe le statut ?"
        assert top_k == 3
        return [SAMPLE_RESULT]

    monkeypatch.setattr("app.main.search", fake_search)
    monkeypatch.setattr(
    "app.main.generate_answer",
    lambda question, results: ("Réponse de test [Source 1]", False),
    )
    response = client.post(
        "/retrieve",
        json={
            "question": "Quelle loi fixe le statut ?",
            "top_k": 3,
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["results_count"] == 1
    assert data["results"][0]["chunk_id"] == SAMPLE_RESULT["chunk_id"]
    assert data["results"][0]["text"] == SAMPLE_RESULT["text"]


def test_empty_question_is_rejected():
    response = client.post(
        "/retrieve",
        json={"question": "   "},
    )
    assert response.status_code == 422


def test_missing_question_is_rejected():
    response = client.post("/retrieve", json={})
    assert response.status_code == 422


def test_top_k_out_of_range_is_rejected():
    for top_k in (0, 21):
        response = client.post(
            "/retrieve",
            json={"question": "Test question", "top_k": top_k},
        )
        assert response.status_code == 422


def test_retrieval_failure_returns_generic_error(monkeypatch):
    def failing_search(question, top_k=5):
        raise RuntimeError("Internal test error")

    monkeypatch.setattr("app.main.search", failing_search)

    response = client.post(
        "/retrieve",
        json={"question": "Test question"},
    )

    assert response.status_code == 500
    assert response.json()["detail"] == (
        "The retrieval service could not process the request."
    )
