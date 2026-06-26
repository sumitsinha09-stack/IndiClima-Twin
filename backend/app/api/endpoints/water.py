from fastapi import APIRouter
from app.schemas.water import WaterData

router = APIRouter()

@router.get("/water/dashboard", response_model=WaterData)
async def get_water_dashboard():
    return WaterData(
        reservoirs=[
            {"name": "Sardar Sarovar", "state": "Gujarat", "currentLevel": 4.82, "capacity": 9.46, "fillPercent": 50.9, "inflow": 2850.0, "outflow": 1200.0},
            {"name": "Hirakud", "state": "Odisha", "currentLevel": 5.81, "capacity": 8.10, "fillPercent": 71.7, "inflow": 4200.0, "outflow": 3100.0},
            {"name": "Nagarjunasagar", "state": "Telangana/AP", "currentLevel": 8.12, "capacity": 11.56, "fillPercent": 70.2, "inflow": 3600.0, "outflow": 2800.0},
            {"name": "Tungabhadra", "state": "Karnataka", "currentLevel": 2.48, "capacity": 3.72, "fillPercent": 66.7, "inflow": 1850.0, "outflow": 1400.0},
            {"name": "Bhakra Nangal", "state": "Punjab/HP", "currentLevel": 6.21, "capacity": 9.34, "fillPercent": 66.5, "inflow": 2200.0, "outflow": 1900.0},
            {"name": "Idukki", "state": "Kerala", "currentLevel": 1.72, "capacity": 1.99, "fillPercent": 86.4, "inflow": 950.0, "outflow": 720.0},
            {"name": "Gobind Sagar", "state": "Himachal Pradesh", "currentLevel": 5.94, "capacity": 7.39, "fillPercent": 80.4, "inflow": 3100.0, "outflow": 2400.0},
            {"name": "Srisailam", "state": "Telangana/AP", "currentLevel": 7.53, "capacity": 8.72, "fillPercent": 86.4, "inflow": 4800.0, "outflow": 3200.0},
        ],
        rivers=[
            {"name": "Brahmaputra (Neamatighat)", "currentLevel": 64.82, "dangerLevel": 63.5, "status": "danger"},
            {"name": "Ganga (Varanasi)", "currentLevel": 70.21, "dangerLevel": 71.26, "status": "above-normal"},
            {"name": "Yamuna (Delhi)", "currentLevel": 204.83, "dangerLevel": 204.5, "status": "warning"},
            {"name": "Godavari (Bhadrachalam)", "currentLevel": 34.6, "dangerLevel": 43.0, "status": "normal"},
            {"name": "Krishna (Vijayawada)", "currentLevel": 12.8, "dangerLevel": 15.24, "status": "normal"},
            {"name": "Mahanadi (Mundali)", "currentLevel": 15.3, "dangerLevel": 18.0, "status": "above-normal"},
            {"name": "Narmada (Garudeshwar)", "currentLevel": 21.9, "dangerLevel": 30.5, "status": "normal"},
            {"name": "Cauvery (Biligundlu)", "currentLevel": 8.4, "dangerLevel": 12.8, "status": "normal"},
        ],
        groundwater={
            "nationalAverage": 8.42,
            "depleting": 189,
            "stable": 312,
            "recharging": 151,
        },
        waterStressIndex=0.62,
        demandEstimate=1092.3
    )
