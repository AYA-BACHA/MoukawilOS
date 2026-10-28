from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.regulatory_rag import (
    get_official_statutes,
    query_regulatory_assistant,
)

router = APIRouter(prefix="/assistant", tags=["assistant"])


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000)
    locale: Optional[str] = None


class AssistantMessageOut(BaseModel):
    id: str
    userId: str = "usr_1"
    role: str = "assistant"
    content: str
    citations: List[str] = []
    createdAt: str
    statutory_source: Optional[str] = None
    confidence: Optional[float] = None
    refusal: bool = False


@router.post("/ask", response_model=AssistantMessageOut)
def ask_assistant(req: AskRequest) -> Dict[str, Any]:
    res = query_regulatory_assistant(req.question, locale=req.locale)
    return {
        "id": res["id"],
        "userId": "usr_1",
        "role": "assistant",
        "content": res["content"],
        "citations": res["citations"],
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "statutory_source": res.get("statutory_source"),
        "confidence": res.get("confidence"),
        "refusal": res.get("refusal", False),
    }


@router.get("/statutes")
def list_statutes() -> List[Dict[str, Any]]:
    return get_official_statutes()


@router.get("/messages")
def get_messages() -> List[Dict[str, Any]]:
    return [
        {
            "id": "msg_welcome",
            "userId": "usr_1",
            "role": "assistant",
            "content": "Welcome to the Al-Moukawil Regulatory Intelligence Workspace.\n\nThis system provides legal and fiscal guidance grounded strictly in the official legislation of the People's Democratic Republic of Algeria (Law n° 22-23, Executive Decrees 23-196 and 23-197, and the Direct Tax Code CIDTA).\n\nEnter an inquiry regarding the 5,000,000 DZD revenue threshold, the 0.5% IFU flat tax calculation, 0% VAT exemption rules, or statutory invoicing requirements. Each response includes direct citations to inspect codified articles and authentic Gazette (JORADP) PDF documents.",
            "citations": ["JORADP-2022-085:art-2", "JORADP-2023-197:art-4"],
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
    ]
