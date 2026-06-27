from pydantic import BaseModel

class ScenarioInput(BaseModel):
    temperatureChange: float = 0.0
    rainfallChange: float = 0.0
    deforestationPercent: float = 0.0
    urbanExpansionPercent: float = 0.0
    seaLevelRise: float = 0.0
    carbonEmissionsChange: float = 0.0
    urbanGreenCoverPercent: float = 0.0
    albedoIndex: float = 0.0

class ScenarioResult(BaseModel):
    floodRisk: float
    droughtRisk: float
    heatwaveRisk: float
    agricultureImpact: float
    waterAvailability: float
    affectedPopulation: int
    co2Concentration: float
    surfaceTemp: float
    uhiIndex: float
