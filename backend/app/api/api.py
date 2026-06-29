from fastapi import APIRouter
from app.api.endpoints import agriculture, alerts, climate, health, predictions, scenarios, water, energy, reports, explorer

api_router = APIRouter()

# Include all endpoint routers without prefix since they are prefixed in main app
api_router.include_router(health.router, tags=["health"])
api_router.include_router(climate.router, tags=["climate"])
api_router.include_router(explorer.router)
api_router.include_router(alerts.router, tags=["alerts"])
api_router.include_router(predictions.router, tags=["predictions"])
api_router.include_router(scenarios.router, tags=["scenarios"])
api_router.include_router(agriculture.router, tags=["agriculture"])
api_router.include_router(water.router, tags=["water"])
api_router.include_router(energy.router, tags=["energy"])
api_router.include_router(reports.router, tags=["reports"])
