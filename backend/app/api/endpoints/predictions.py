import random
from datetime import datetime, timedelta
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database.session import get_db
from app.models.base import RiskPrediction, MonsoonStatus
from app.schemas.predictions import RiskPredictions, RiskScore, ForecastDay, MonsoonStatus as MonsoonStatusSchema

router = APIRouter()

def jitter(val: float, max_pct=0.02) -> float:
    return round(val * (1 + (random.random() - 0.5) * max_pct * 2), 1)

@router.get("/predictions/risks", response_model=RiskPredictions)
async def get_risk_predictions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RiskPrediction))
    rows = result.scalars().all()

    # Default/fallback dictionary
    temp_res = {}
    for r in rows:
        temp_res[r.hazard] = RiskScore(
            score=jitter(r.score, 0.03),
            confidence=jitter(r.confidence, 0.02),
            trend=r.trend,
            topRegions=r.top_regions
        )

    # Validate that we have all required fields for RiskPredictions schema
    hazards = ["flood", "cyclone", "heatwave", "drought", "landslide", "forestFire"]
    for h in hazards:
        if h not in temp_res:
            temp_res[h] = RiskScore(score=0.0, confidence=0.0, trend="stable", topRegions=[])

    return RiskPredictions(
        flood=temp_res["flood"],
        cyclone=temp_res["cyclone"],
        heatwave=temp_res["heatwave"],
        drought=temp_res["drought"],
        landslide=temp_res["landslide"],
        forestFire=temp_res["forestFire"]
    )

@router.get("/predictions/forecast", response_model=List[ForecastDay])
async def get_weather_forecast():
    conditions = ["sunny", "partly-cloudy", "cloudy", "rainy", "thunderstorm", "foggy"]
    today = datetime.now()

    forecast = []
    for i in range(7):
        date_str = (today + timedelta(days=i)).strftime("%Y-%m-%d")
        is_rainy = i in [2, 3, 5]
        
        max_temp = round(34 - i * 0.3 + 3 + random.random() * 2, 1)
        min_temp = round(34 - i * 0.3 - 6 + random.random() * 2, 1)
        
        if is_rainy:
            rainfall = round(12 + random.random() * 25, 1)
            condition = "thunderstorm" if i == 3 else "rainy"
        else:
            rainfall = round(random.random() * 4, 1)
            condition = conditions[random.randint(0, 2)]

        forecast.append(
            ForecastDay(
                date=date_str,
                maxTemp=max_temp,
                minTemp=min_temp,
                rainfall=rainfall,
                windSpeed=round(14 + random.random() * 12, 1),
                humidity=round(65 + random.random() * 20, 1),
                condition=condition
            )
        )
    return forecast

@router.get("/predictions/monsoon", response_model=MonsoonStatusSchema)
async def get_monsoon_status(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(MonsoonStatus).order_by(desc(MonsoonStatus.updated_at)).limit(1)
    )
    m = result.scalars().first()
    
    if not m:
        raise HTTPException(status_code=503, detail="No monsoon data available")

    return MonsoonStatusSchema(
        phase=m.phase,
        onsetDate=m.onset_date,
        predictedOnsetDate=m.predicted_onset_date,
        currentCoverage=jitter(m.current_coverage, 0.01),
        rainfallDeficit=round(m.rainfall_deficit + (random.random() - 0.5) * 0.4, 1),
        progressionPercent=jitter(m.progression_percent, 0.01)
    )
