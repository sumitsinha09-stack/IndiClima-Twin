from pydantic import BaseModel
from typing import Optional

class CurrentClimate(BaseModel):
    temperature: float
    humidity: float
    rainfall: float
    windSpeed: float
    airPressure: float
    cloudCover: float
    aqi: int
    cycloneActive: bool
    monsoonPhase: str
    reservoirLevel: float
    droughtIndex: float
    forestFireRisk: str
    heatwaveRisk: str
    floodProbability: float
    updatedAt: str

class MapDataPoint(BaseModel):
    lat: float
    lng: float
    value: float
    district: str
    state: str
    label: Optional[str] = None

class TrendDataPoint(BaseModel):
    year: int
    value: float
    anomaly: float
    movingAvg: Optional[float] = None

class ClimateSummary(BaseModel):
    avgTemp: float
    totalRainfall: float
    activeCyclones: int
    activeAlerts: int
    affectedDistricts: int
    co2Level: float
    tempAnomalyFromBaseline: float
    rainfallDeficit: float
