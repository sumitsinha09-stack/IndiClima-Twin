from pydantic import BaseModel
from typing import List

class SuitableCrop(BaseModel):
    crop: str
    suitability: float
    season: str

class YieldPrediction(BaseModel):
    crop: str
    predictedYield: float
    unit: str
    changeFromLastYear: float

class AgricultureData(BaseModel):
    soilMoisture: float
    cropStressIndex: float
    rainfallOutlook: str
    sowingAdvisory: str
    suitableCrops: List[SuitableCrop]
    yieldPredictions: List[YieldPrediction]
