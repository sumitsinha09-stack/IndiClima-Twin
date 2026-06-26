from fastapi import APIRouter
from app.schemas.health import HealthStatus

router = APIRouter()

@router.get("/healthz", response_model=HealthStatus)
async def health_check():
    return {"status": "ok"}
