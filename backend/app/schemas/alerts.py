from pydantic import BaseModel
from typing import List, Optional

class DisasterAlert(BaseModel):
    id: int
    type: str
    severity: str
    title: str
    description: Optional[str] = None
    affectedDistricts: List[str]
    probability: float
    expectedDate: Optional[str] = None
    recommendedActions: List[str]
    issuedAt: str

class ActiveShelter(BaseModel):
    name: str
    capacity: int
    occupied: int
    status: str

class EvacuationRoute(BaseModel):
    highway: str
    status: str
    alternativeRoute: Optional[str] = None

class AffectedArea(BaseModel):
    state: str
    district: str
    city: str
    impactLevel: str
    populationAtRisk: int
    expectedStart: str
    expectedEnd: str
    primaryRisk: str
    estimatedRainfall: Optional[float] = None
    expectedTemperature: Optional[float] = None
    windSpeed: Optional[float] = None
    floodProbability: Optional[float] = None
    landslideProbability: Optional[float] = None
    infrastructureRisk: str
    cropImpact: str
    waterResourceImpact: str
    precautionaryMeasures: List[str]
    activeShelters: List[ActiveShelter]
    evacuationRoutes: List[EvacuationRoute]

class DetailedAlert(BaseModel):
    id: int
    type: str
    severity: str
    title: str
    description: Optional[str] = None
    affectedDistricts: List[str]
    probability: float
    confidence: float
    status: str
    expectedDate: Optional[str] = None
    recommendedActions: List[str]
    issuedAt: str
    affectedAreas: List[AffectedArea]

class AlertEvent(BaseModel):
    id: int
    type: str
    message: str
    region: str
    severity: str
    timestamp: str
