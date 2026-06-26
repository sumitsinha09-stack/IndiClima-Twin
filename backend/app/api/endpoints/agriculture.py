from fastapi import APIRouter
from app.schemas.agriculture import AgricultureData

router = APIRouter()

@router.get("/agriculture/dashboard", response_model=AgricultureData)
async def get_agriculture_dashboard():
    return AgricultureData(
        soilMoisture=58.3,
        cropStressIndex=34.0,
        rainfallOutlook="normal",
        sowingAdvisory="Kharif sowing window is open for most of peninsular India. Delay sowing in northwest India where rainfall deficit persists. Soil temperature optimal for paddy transplanting in eastern India.",
        suitableCrops=[
            {"crop": "Paddy (Short Duration)", "suitability": 88.0, "season": "Kharif"},
            {"crop": "Maize", "suitability": 82.0, "season": "Kharif"},
            {"crop": "Cotton", "suitability": 76.0, "season": "Kharif"},
            {"crop": "Soybean", "suitability": 74.0, "season": "Kharif"},
            {"crop": "Groundnut", "suitability": 68.0, "season": "Kharif"},
            {"crop": "Bajra (Pearl Millet)", "suitability": 65.0, "season": "Kharif"},
            {"crop": "Arhar (Pigeon Pea)", "suitability": 61.0, "season": "Kharif"},
            {"crop": "Moong Dal", "suitability": 55.0, "season": "Kharif"},
        ],
        yieldPredictions=[
            {"crop": "Rice", "predictedYield": 126.4, "unit": "MT (million tonnes)", "changeFromLastYear": 2.1},
            {"crop": "Wheat", "predictedYield": 113.2, "unit": "MT", "changeFromLastYear": -1.4},
            {"crop": "Maize", "predictedYield": 34.8, "unit": "MT", "changeFromLastYear": 3.6},
            {"crop": "Pulses", "predictedYield": 24.1, "unit": "MT", "changeFromLastYear": -0.8},
            {"crop": "Oilseeds", "predictedYield": 37.2, "unit": "MT", "changeFromLastYear": 1.9},
            {"crop": "Sugarcane", "predictedYield": 440.6, "unit": "MT", "changeFromLastYear": 4.3},
        ]
    )
