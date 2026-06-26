import logging
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import (
    ClimateSnapshot,
    ClimateSummary,
    DisasterAlert,
    AlertEvent,
    RiskPrediction,
    MonsoonStatus
)

logger = logging.getLogger("db-setup")

async def seed_data(db: AsyncSession):
    logger.info("Clearing existing database records...")
    
    # Delete in order of dependencies (if any)
    await db.execute(delete(ClimateSnapshot))
    await db.execute(delete(ClimateSummary))
    await db.execute(delete(DisasterAlert))
    await db.execute(delete(AlertEvent))
    await db.execute(delete(RiskPrediction))
    await db.execute(delete(MonsoonStatus))
    
    logger.info("Inserting mock climate data...")

    # 1. Climate Snapshot
    snapshot = ClimateSnapshot(
        temperature=34.2,
        humidity=72.0,
        rainfall=8.4,
        wind_speed=18.6,
        air_pressure=1008.3,
        cloud_cover=65.0,
        aqi=142,
        cyclone_active="false",
        monsoon_phase="active",
        reservoir_level=61.4,
        drought_index=-0.8,
        forest_fire_risk="moderate",
        heatwave_risk="low",
        flood_probability=38.0
    )
    db.add(snapshot)

    # 2. Climate Summary
    summary = ClimateSummary(
        avg_temp=34.2,
        total_rainfall=8.4,
        active_cyclones=0,
        active_alerts=7,
        affected_districts=43,
        co2_level=422.6,
        temp_anomaly_from_baseline=1.4,
        rainfall_deficit=-12.3
    )
    db.add(summary)

    # 3. Disaster Alerts
    today = datetime.now(timezone.utc)
    alerts = [
        DisasterAlert(
            type="flood",
            severity="severe",
            title="Severe Flood Warning — Brahmaputra Basin",
            description="Heavy rainfall over Arunachal Pradesh has caused Brahmaputra river to rise above danger mark at multiple gauging stations.",
            affected_districts=["Dhemaji", "Lakhimpur", "Jorhat", "Dibrugarh", "Sibsagar"],
            probability=87.0,
            expected_date=(today + timedelta(days=1)).strftime("%Y-%m-%d"),
            recommended_actions=[
                "Evacuate low-lying areas within 500m of riverbank",
                "Activate flood relief camps in all five districts",
                "Deploy NDRF teams at Dhemaji and Lakhimpur",
                "Issue public advisory via emergency broadcast"
            ],
            active="true"
        ),
        DisasterAlert(
            type="heatwave",
            severity="warning",
            title="Heatwave Warning — Rajasthan & Gujarat",
            description="Maximum temperatures expected to exceed 44°C for 3 consecutive days. Severe heat stress for outdoor workers and elderly.",
            affected_districts=["Barmer", "Jaisalmer", "Bikaner", "Jodhpur", "Kutch", "Banaskantha"],
            probability=92.0,
            expected_date=(today + timedelta(hours=12)).strftime("%Y-%m-%d"),
            recommended_actions=[
                "Issue heat health advisory to hospitals",
                "Open cooling centers in public buildings",
                "Restrict outdoor work between 11am–4pm",
                "Increase water supply in urban areas"
            ],
            active="true"
        ),
        DisasterAlert(
            type="cyclone",
            severity="watch",
            title="Cyclone Watch — Bay of Bengal",
            description="A low-pressure system in the Bay of Bengal is intensifying. Likely to develop into a cyclonic storm within 36 hours.",
            affected_districts=["Puri", "Kendrapara", "Jagatsinghpur", "Ganjam", "Srikakulam"],
            probability=64.0,
            expected_date=(today + timedelta(days=2)).strftime("%Y-%m-%d"),
            recommended_actions=[
                "Fishermen advised not to venture into sea",
                "Monitor IMD bulletins every 6 hours",
                "Prepare evacuation plans for coastal villages",
                "Pre-position relief material at district HQ"
            ],
            active="true"
        ),
        DisasterAlert(
            type="drought",
            severity="warning",
            title="Drought Conditions Deteriorating — Vidarbha Region",
            description="SPI values below -1.5 for 12 consecutive weeks. Kharif sowing severely impacted in 9 districts.",
            affected_districts=["Wardha", "Yavatmal", "Amravati", "Akola", "Washim", "Buldhana"],
            probability=78.0,
            expected_date=None,
            recommended_actions=[
                "Activate drought relief scheme for farmers",
                "Arrange tanker water supply for 847 villages",
                "Restrict non-essential water use",
                "Expedite completion of check dams and borewells"
            ],
            active="true"
        ),
        DisasterAlert(
            type="forest-fire",
            severity="extreme",
            title="Extreme Forest Fire Risk — Uttarakhand Himalayan Zone",
            description="Critical fire weather conditions: low humidity (8%), high winds, dry fuels. Multiple active fires in Nainital and Champawat.",
            affected_districts=["Nainital", "Champawat", "Pithoragarh", "Almora"],
            probability=96.0,
            expected_date=today.strftime("%Y-%m-%d"),
            recommended_actions=[
                "Deploy forest fire fighting teams immediately",
                "Activate aerial firefighting operations",
                "Evacuate wildlife sanctuaries in risk zones",
                "Coordinate with Army for additional support"
            ],
            active="true"
        ),
        DisasterAlert(
            type="landslide",
            severity="warning",
            title="Landslide Risk — Western Ghats",
            description="Sustained heavy rainfall has saturated hill slopes in Kerala and Karnataka. High susceptibility above 600m elevation.",
            affected_districts=["Idukki", "Wayanad", "Malappuram", "Chikmagalur", "Hassan"],
            probability=71.0,
            expected_date=(today + timedelta(days=1)).strftime("%Y-%m-%d"),
            recommended_actions=[
                "Close roads through high-risk mountain passes",
                "Evacuate landslide-prone settlements",
                "Keep rescue teams on standby in Idukki and Wayanad",
                "Restrict tourist movement in hill stations"
            ],
            active="true"
        ),
        DisasterAlert(
            type="flood",
            severity="watch",
            title="Flood Watch — Upper Ganga Plains",
            description="Heavy monsoon discharge from Himalayan tributaries increasing Ganga river levels in UP and Bihar.",
            affected_districts=["Varanasi", "Allahabad", "Ballia", "Buxar", "Ghazipur"],
            probability=55.0,
            expected_date=(today + timedelta(days=3)).strftime("%Y-%m-%d"),
            recommended_actions=[
                "Monitor river level at hourly intervals",
                "Keep embankment repair teams ready",
                "Prepare evacuation routes for riverside villages"
            ],
            active="true"
        )
    ]
    for alert in alerts:
        db.add(alert)

    # 4. Alert Events
    events = [
        AlertEvent(type="flood", message="Brahmaputra river rises above danger mark at Neamatighat", region="Assam", severity="critical"),
        AlertEvent(type="heatwave", message="Barmer records 44.8°C — 8th consecutive day above 44°C", region="Rajasthan", severity="warning"),
        AlertEvent(type="forest-fire", message="New fire spot detected in Nainital Forest Division (Block 7)", region="Uttarakhand", severity="critical"),
        AlertEvent(type="cyclone", message="Low-pressure system in BoB intensifies — 996 hPa central pressure", region="Bay of Bengal", severity="warning"),
        AlertEvent(type="drought", message="Kharif sowing deficit reaches 31% in Vidarbha — NDMA activated", region="Maharashtra", severity="warning"),
        AlertEvent(type="flood", message="NDRF team deployed to Dhemaji ahead of predicted flash flood", region="Assam", severity="info"),
        AlertEvent(type="landslide", message="NH 66 closed near Kozhikode due to landslide debris", region="Kerala", severity="critical"),
        AlertEvent(type="heatwave", message="Cooling centers activated across 12 cities in Gujarat", region="Gujarat", severity="info")
    ]
    for event in events:
        db.add(event)

    # 5. Risk Predictions
    predictions = [
        RiskPrediction(hazard="flood", score=68.0, confidence=84.0, trend="increasing", top_regions=["Assam", "West Bengal", "Bihar", "Odisha"]),
        RiskPrediction(hazard="cyclone", score=42.0, confidence=71.0, trend="stable", top_regions=["Odisha Coast", "Andhra Pradesh Coast", "Tamil Nadu Coast"]),
        RiskPrediction(hazard="heatwave", score=78.0, confidence=91.0, trend="increasing", top_regions=["Rajasthan", "Gujarat", "Madhya Pradesh", "Telangana"]),
        RiskPrediction(hazard="drought", score=55.0, confidence=79.0, trend="stable", top_regions=["Vidarbha", "Marathwada", "Bundelkhand", "Saurashtra"]),
        RiskPrediction(hazard="landslide", score=61.0, confidence=76.0, trend="increasing", top_regions=["Western Ghats", "Uttarakhand Himalayas", "Northeast Hills", "Himachal Pradesh"]),
        RiskPrediction(hazard="forestFire", score=83.0, confidence=88.0, trend="increasing", top_regions=["Uttarakhand", "Himachal Pradesh", "Chhattisgarh", "Odisha"])
    ]
    for prediction in predictions:
        db.add(prediction)

    # 6. Monsoon Status
    monsoon = MonsoonStatus(
        phase="active",
        onset_date="2024-06-05",
        predicted_onset_date="2024-06-01",
        current_coverage=73.0,
        rainfall_deficit=-12.3,
        progression_percent=73.0
    )
    db.add(monsoon)

    await db.commit()
    logger.info("Database seeding completed successfully.")
