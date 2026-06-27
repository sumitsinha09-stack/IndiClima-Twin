from fastapi import APIRouter
from app.schemas.energy import EnergyPotentialData

router = APIRouter()

@router.get("/energy/dashboard", response_model=EnergyPotentialData)
async def get_energy_dashboard():
    return EnergyPotentialData(
        totalSolarPotentialMw=365200.0,
        totalWindPotentialMw=142800.0,
        totalHydroPotentialMw=48500.0,
        averageSolarIrradiance=5.42,
        averageWindSpeed=6.15,
        states=[
            {"stateName": "Rajasthan", "solarIrradiance": 6.2, "windSpeed": 5.8, "hydroPotential": 1200.0, "solarCapacityMw": 142000.0, "windCapacityMw": 28400.0, "status": "optimal"},
            {"stateName": "Gujarat", "solarIrradiance": 5.9, "windSpeed": 7.2, "hydroPotential": 2400.0, "solarCapacityMw": 98000.0, "windCapacityMw": 45200.0, "status": "optimal"},
            {"stateName": "Tamil Nadu", "solarIrradiance": 5.6, "windSpeed": 7.8, "hydroPotential": 3200.0, "solarCapacityMw": 42000.0, "windCapacityMw": 38600.0, "status": "optimal"},
            {"stateName": "Karnataka", "solarIrradiance": 5.4, "windSpeed": 6.5, "hydroPotential": 4800.0, "solarCapacityMw": 32000.0, "windCapacityMw": 18200.0, "status": "high"},
            {"stateName": "Maharashtra", "solarIrradiance": 5.2, "windSpeed": 5.4, "hydroPotential": 5600.0, "solarCapacityMw": 24000.0, "windCapacityMw": 8400.0, "status": "high"},
            {"stateName": "Madhya Pradesh", "solarIrradiance": 5.5, "windSpeed": 4.8, "hydroPotential": 2900.0, "solarCapacityMw": 18000.0, "windCapacityMw": 3400.0, "status": "moderate"},
            {"stateName": "Andhra Pradesh", "solarIrradiance": 5.3, "windSpeed": 6.1, "hydroPotential": 3500.0, "solarCapacityMw": 9200.0, "windCapacityMw": 6000.0, "status": "high"}
        ]
    )
