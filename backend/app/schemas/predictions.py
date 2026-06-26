from pydantic import BaseModel
from typing import List, Optional

class RiskScore(BaseModel):
    score: float
    confidence: float
    trend: str
    topRegions: List[str]

class RiskPredictions(BaseModel):
    flood: RiskScore
    cyclone: RiskScore
    heatwave: RiskScore
    drought: RiskScore
    landslide: RiskScore
    forestFire: RiskScore

class ForecastDay(BaseModel):
    date: str
    maxTemp: float
    minTemp: float
    rainfall: float
    windSpeed: float
    humidity: float
    condition: str

class MonsoonStatus(BaseModel):
    phase: str
    onsetDate: Optional[str] = None
    predictedOnsetDate: Optional[str] = None
    currentCoverage: float
    rainfallDeficit: float
    progressionPercent: float
