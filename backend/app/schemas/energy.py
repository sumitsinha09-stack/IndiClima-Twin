from pydantic import BaseModel
from typing import List

class StateEnergyPotential(BaseModel):
    stateName: str
    solarIrradiance: float
    windSpeed: float
    hydroPotential: float
    solarCapacityMw: float
    windCapacityMw: float
    status: str

class EnergyPotentialData(BaseModel):
    totalSolarPotentialMw: float
    totalWindPotentialMw: float
    totalHydroPotentialMw: float
    averageSolarIrradiance: float
    averageWindSpeed: float
    states: List[StateEnergyPotential]
