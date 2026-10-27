from fastapi import APIRouter

from app.core.lookups import LOOKUPS

router = APIRouter(tags=["lookups"])


@router.get("/lookups")
def get_lookups():
    return LOOKUPS