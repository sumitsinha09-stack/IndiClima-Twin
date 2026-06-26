from pydantic import BaseModel
from typing import List

class Reservoir(BaseModel):
    name: str
    state: str
    currentLevel: float
    capacity: float
    fillPercent: float
    inflow: float
    outflow: float

class River(BaseModel):
    name: str
    currentLevel: float
    dangerLevel: float
    status: str

class Groundwater(BaseModel):
    nationalAverage: float
    depleting: int
    stable: int
    recharging: int

class WaterData(BaseModel):
    reservoirs: List[Reservoir]
    rivers: List[River]
    groundwater: Groundwater
    waterStressIndex: float
    demandEstimate: float
