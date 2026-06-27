import random
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database.session import get_db
from app.models.base import DisasterAlert as DisasterAlertModel, AlertEvent as AlertEventModel
from app.schemas.alerts import DisasterAlert, DetailedAlert, AlertEvent, AffectedArea

router = APIRouter()

AFFECTED_AREAS: Dict[str, List[Dict[str, Any]]] = {
    "flood": [
        {
            "state": "Assam", "district": "Dhemaji", "city": "Dhemaji Town",
            "impactLevel": "extreme", "populationAtRisk": 287000, "durationHours": 96,
            "primaryRisk": "Flash Flooding & River Overflow",
            "estimatedRainfall": 185.0, "floodProbability": 94.0, "landslideProbability": 28.0,
            "infrastructureRisk": "critical", "cropImpact": "severe", "waterResourceImpact": "severe",
            "precautionaryMeasures": [
                "Immediate evacuation of riverbank settlements within 500m",
                "Deploy NDRF boats at all river crossing points",
                "Shut down ground-floor electricity supply in flood-prone wards",
                "Open all designated flood relief camps",
            ],
        },
        {
            "state": "Assam", "district": "Lakhimpur", "city": "North Lakhimpur",
            "impactLevel": "severe", "populationAtRisk": 342000, "durationHours": 84,
            "primaryRisk": "River Inundation",
            "estimatedRainfall": 160.0, "floodProbability": 88.0, "landslideProbability": 15.0,
            "infrastructureRisk": "high", "cropImpact": "severe", "waterResourceImpact": "high",
            "precautionaryMeasures": [
                "Alert district administration for embankment monitoring",
                "Pre-position rescue boats at Subansiri confluence",
                "Issue advisory to farmers to harvest standing crops",
            ],
        },
        {
            "state": "Assam", "district": "Jorhat", "city": "Jorhat",
            "impactLevel": "high", "populationAtRisk": 198000, "durationHours": 72,
            "primaryRisk": "Agricultural Land Submergence",
            "estimatedRainfall": 120.0, "floodProbability": 76.0,
            "infrastructureRisk": "high", "cropImpact": "severe", "waterResourceImpact": "moderate",
            "precautionaryMeasures": [
                "Protect tea gardens with temporary bunds",
                "Activate district control room 24×7",
                "Issue boil-water advisory for affected areas",
            ],
        },
        {
            "state": "Assam", "district": "Dibrugarh", "city": "Dibrugarh",
            "impactLevel": "high", "populationAtRisk": 156000, "durationHours": 60,
            "primaryRisk": "Urban Flooding",
            "estimatedRainfall": 95.0, "floodProbability": 68.0,
            "infrastructureRisk": "moderate", "cropImpact": "high", "waterResourceImpact": "moderate",
            "precautionaryMeasures": [
                "Clear storm water drains in low-lying areas",
                "Keep pumping stations operational round the clock",
            ],
        },
        {
            "state": "Assam", "district": "Sibsagar", "city": "Sibasagar",
            "impactLevel": "moderate", "populationAtRisk": 112000, "durationHours": 48,
            "primaryRisk": "Crop Damage",
            "estimatedRainfall": 75.0, "floodProbability": 55.0,
            "infrastructureRisk": "moderate", "cropImpact": "high", "waterResourceImpact": "low",
            "precautionaryMeasures": [
                "Issue crop insurance claim advisories to farmers",
                "Monitor Desoi river gauge at Amguri",
            ],
        },
    ],

    "heatwave": [
        {
            "state": "Rajasthan", "district": "Barmer", "city": "Barmer",
            "impactLevel": "extreme", "populationAtRisk": 460000, "durationHours": 120,
            "primaryRisk": "Heat Stress & Dehydration",
            "expectedTemperature": 48.2,
            "infrastructureRisk": "moderate", "cropImpact": "high", "waterResourceImpact": "severe",
            "precautionaryMeasures": [
                "Issue Red Alert — avoid outdoor exposure between 10am–5pm",
                "Open 24-hour cooling centres in all 9 wards",
                "Increase ORS distribution at PHCs and anganwadis",
                "Restrict construction labour from noon to 4pm",
                "Deploy mobile medical units in rural habitations",
            ],
        },
        {
            "state": "Rajasthan", "district": "Jaisalmer", "city": "Jaisalmer",
            "impactLevel": "extreme", "populationAtRisk": 218000, "durationHours": 120,
            "primaryRisk": "Extreme Dry Heat",
            "expectedTemperature": 47.6,
            "infrastructureRisk": "low", "cropImpact": "high", "waterResourceImpact": "severe",
            "precautionaryMeasures": [
                "Issue tourist advisory — restrict daytime outdoor excursions",
                "Increase water tanker frequency to desert villages",
            ],
        },
        {
            "state": "Rajasthan", "district": "Bikaner", "city": "Bikaner",
            "impactLevel": "severe", "populationAtRisk": 785000, "durationHours": 96,
            "primaryRisk": "Heat Stress & Water Scarcity",
            "expectedTemperature": 46.1,
            "infrastructureRisk": "moderate", "cropImpact": "severe", "waterResourceImpact": "high",
            "precautionaryMeasures": [
                "Activate Heat Action Plan — CMHO to lead response",
                "Ensure uninterrupted power supply for cooling",
                "Spray water on roads in congested areas",
            ],
        },
        {
            "state": "Gujarat", "district": "Kutch", "city": "Bhuj",
            "impactLevel": "severe", "populationAtRisk": 612000, "durationHours": 96,
            "primaryRisk": "Heat Stroke Risk",
            "expectedTemperature": 44.8,
            "infrastructureRisk": "low", "cropImpact": "high", "waterResourceImpact": "severe",
            "precautionaryMeasures": [
                "Scale up potable water supply from Narmada grid",
                "Run heat safety awareness on community radio",
                "Protect salt pan and marine workers with mandatory breaks",
            ],
        },
        {
            "state": "Gujarat", "district": "Banaskantha", "city": "Palanpur",
            "impactLevel": "high", "populationAtRisk": 395000, "durationHours": 72,
            "primaryRisk": "Agricultural Stress",
            "expectedTemperature": 43.2,
            "infrastructureRisk": "low", "cropImpact": "severe", "waterResourceImpact": "high",
            "precautionaryMeasures": [
                "Issue crop advisory for groundnut and cotton farmers",
                "Ensure irrigation availability at critical growth stage",
            ],
        },
    ],

    "cyclone": [
        {
            "state": "Odisha", "district": "Puri", "city": "Puri",
            "impactLevel": "severe", "populationAtRisk": 540000, "durationHours": 36,
            "primaryRisk": "High Winds & Storm Surge",
            "estimatedRainfall": 250.0, "windSpeed": 145.0, "floodProbability": 82.0,
            "infrastructureRisk": "critical", "cropImpact": "severe", "waterResourceImpact": "high",
            "precautionaryMeasures": [
                "Evacuate all coastal villages within 5km of shoreline",
                "Move fishing boats to safe harbours immediately",
                "Close Jagannath Temple and restrict pilgrim movement",
                "Pre-position emergency generators at hospitals",
                "Activate cyclone shelters across all 16 blocks",
            ],
        },
        {
            "state": "Odisha", "district": "Kendrapara", "city": "Kendrapara",
            "impactLevel": "severe", "populationAtRisk": 315000, "durationHours": 42,
            "primaryRisk": "Storm Surge & Inundation",
            "estimatedRainfall": 220.0, "windSpeed": 130.0, "floodProbability": 86.0,
            "infrastructureRisk": "critical", "cropImpact": "severe", "waterResourceImpact": "severe",
            "precautionaryMeasures": [
                "Evacuate Mahanadi delta region settlements",
                "Issue no-go advisory for Bhitarkanika National Park",
                "Deploy ODRAF rescue teams at all entry points",
            ],
        },
        {
            "state": "Andhra Pradesh", "district": "Srikakulam", "city": "Srikakulam",
            "impactLevel": "high", "populationAtRisk": 267000, "durationHours": 30,
            "primaryRisk": "Heavy Rainfall & Coastal Flooding",
            "estimatedRainfall": 180.0, "windSpeed": 110.0, "floodProbability": 72.0,
            "infrastructureRisk": "high", "cropImpact": "high", "waterResourceImpact": "moderate",
            "precautionaryMeasures": [
                "Strengthen embankments along Vamsadhara river",
                "Move shrimp farm workers to safer locations",
            ],
        },
    ],

    "drought": [
        {
            "state": "Maharashtra", "district": "Wardha", "city": "Wardha",
            "impactLevel": "high", "populationAtRisk": 430000, "durationHours": 720,
            "primaryRisk": "Water Scarcity & Crop Failure",
            "estimatedRainfall": 12.0, "expectedTemperature": 38.4,
            "infrastructureRisk": "moderate", "cropImpact": "severe", "waterResourceImpact": "severe",
            "precautionaryMeasures": [
                "Implement tanker water supply to 148 villages",
                "Activate MGNREGS water conservation works",
                "Issue cotton crop insurance advisory",
                "Restrict groundwater extraction for non-essential use",
                "Advise farmers to adopt drought-tolerant varieties",
            ],
        },
        {
            "state": "Maharashtra", "district": "Yavatmal", "city": "Yavatmal",
            "impactLevel": "severe", "populationAtRisk": 610000, "durationHours": 720,
            "primaryRisk": "Agricultural Crisis & Farmer Distress",
            "estimatedRainfall": 8.0, "expectedTemperature": 39.1,
            "infrastructureRisk": "moderate", "cropImpact": "severe", "waterResourceImpact": "severe",
            "precautionaryMeasures": [
                "Declare drought and activate state relief funds",
                "Deploy agricultural counsellors at all taluka offices",
                "Provide fodder supply for livestock",
            ],
        },
        {
            "state": "Maharashtra", "district": "Amravati", "city": "Amravati",
            "impactLevel": "high", "populationAtRisk": 885000, "durationHours": 720,
            "primaryRisk": "Water Deficit",
            "estimatedRainfall": 15.0, "expectedTemperature": 37.8,
            "infrastructureRisk": "moderate", "cropImpact": "high", "waterResourceImpact": "severe",
            "precautionaryMeasures": [
                "Prioritise Upper Wardha dam water for drinking use",
                "Restrict irrigation for second crop",
            ],
        },
        {
            "state": "Maharashtra", "district": "Akola", "city": "Akola",
            "impactLevel": "high", "populationAtRisk": 498000, "durationHours": 720,
            "primaryRisk": "Sowing Failure",
            "estimatedRainfall": 10.0,
            "infrastructureRisk": "low", "cropImpact": "severe", "waterResourceImpact": "high",
            "precautionaryMeasures": [
                "Distribute seed kits for short-duration crops",
                "Issue Kisan Call Centre helpline numbers",
            ],
        },
    ],

    "forest-fire": [
        {
            "state": "Uttarakhand", "district": "Nainital", "city": "Nainital",
            "impactLevel": "extreme", "populationAtRisk": 145000, "durationHours": 48,
            "primaryRisk": "Wildfire Spread & Air Quality Hazard",
            "expectedTemperature": 36.2, "windSpeed": 42.0,
            "infrastructureRisk": "high", "cropImpact": "moderate", "waterResourceImpact": "low",
            "precautionaryMeasures": [
                "Deploy State Forest Corporation fire crews immediately",
                "Activate aerial firefighting — Mi-17 helicopters on standby",
                "Evacuate tourist zones and eco-lodges in buffer zone",
                "Issue AQI advisory — N95 masks for residents",
                "Close forest trekking routes until further notice",
            ],
        },
        {
            "state": "Uttarakhand", "district": "Champawat", "city": "Champawat",
            "impactLevel": "extreme", "populationAtRisk": 68000, "durationHours": 60,
            "primaryRisk": "Rapid Fire Spread in Dense Forest",
            "expectedTemperature": 37.8, "windSpeed": 38.0,
            "infrastructureRisk": "moderate", "cropImpact": "high", "waterResourceImpact": "low",
            "precautionaryMeasures": [
                "Create firebreaks along village boundaries",
                "Deploy Army assistance for fire line cutting",
            ],
        },
        {
            "state": "Uttarakhand", "district": "Pithoragarh", "city": "Pithoragarh",
            "impactLevel": "severe", "populationAtRisk": 82000, "durationHours": 36,
            "primaryRisk": "Forest & Grassland Fire",
            "expectedTemperature": 35.5, "windSpeed": 34.0,
            "infrastructureRisk": "moderate", "cropImpact": "high", "waterResourceImpact": "low",
            "precautionaryMeasures": [
                "Alert border villages with early warning system",
                "Coordinate with BRO for access road maintenance",
            ],
        },
    ],

    "landslide": [
        {
            "state": "Kerala", "district": "Idukki", "city": "Munnar",
            "impactLevel": "severe", "populationAtRisk": 192000, "durationHours": 36,
            "primaryRisk": "Debris Flow & Road Blockage",
            "estimatedRainfall": 180.0, "landslideProbability": 86.0, "floodProbability": 55.0,
            "infrastructureRisk": "critical", "cropImpact": "high", "waterResourceImpact": "moderate",
            "precautionaryMeasures": [
                "Evacuate landslide-prone hill settlements immediately",
                "Close Munnar–Bodinayakanur highway until geotechnical clearance",
                "Alert tea estate workers — restrict hillside movement",
                "Deploy Kerala Fire & Rescue teams at valley roads",
                "Keep Kochi–Dhanushkodi Highway alternate route open",
            ],
        },
        {
            "state": "Kerala", "district": "Wayanad", "city": "Kalpetta",
            "impactLevel": "severe", "populationAtRisk": 243000, "durationHours": 48,
            "primaryRisk": "Slope Failure & Flash Flood",
            "estimatedRainfall": 210.0, "landslideProbability": 91.0, "floodProbability": 72.0,
            "infrastructureRisk": "critical", "cropImpact": "severe", "waterResourceImpact": "high",
            "precautionaryMeasures": [
                "Declare Orange Alert — trigger pre-emptive evacuation",
                "Close NH 766 via Sultan Bathery–Gudalur section",
                "Alert coffee and pepper plantation workers",
            ],
        },
        {
            "state": "Karnataka", "district": "Chikmagalur", "city": "Chikmagalur",
            "impactLevel": "high", "populationAtRisk": 128000, "durationHours": 24,
            "primaryRisk": "Road Closure & Crop Damage",
            "estimatedRainfall": 140.0, "landslideProbability": 68.0,
            "infrastructureRisk": "high", "cropImpact": "high", "waterResourceImpact": "low",
            "precautionaryMeasures": [
                "Alert coffee estate managers in Baba Budan Giri area",
                "Deploy SDRF teams at Kemmanagundi and Ballalarayana Durga",
            ],
        },
    ],
}

def status_from_severity(severity: str) -> str:
    if severity == "extreme":
        return "critical"
    elif severity == "severe":
        return "warning"
    elif severity == "warning":
        return "watch"
    else:
        return "monitoring"

def confidence_from_probability(p: float) -> float:
    return min(98, round(p * 0.85 + 10 + random.random() * 5))

def to_iso_str(dt: datetime) -> str:
    if dt is None:
        return None
    if dt.tzinfo is not None:
        dt = dt.astimezone(timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"

def build_affected_areas(type_str: str, issued_at: datetime) -> List[Dict[str, Any]]:
    areas = AFFECTED_AREAS.get(type_str, [])
    result = []
    for a in areas:
        start = issued_at + timedelta(hours=3)
        end = start + timedelta(hours=a["durationHours"])
        
        district = a.get("district", "District")
        if type_str == "flood":
            shelters = [
                {"name": f"{district} Government College Camp", "capacity": 1200, "occupied": 980, "status": "active"},
                {"name": f"{district} Sports Stadium Shelter", "capacity": 800, "occupied": 800, "status": "full"},
                {"name": "Miri Village Uplands Safe Zone", "capacity": 400, "occupied": 150, "status": "active"}
            ]
            routes = [
                {"highway": "National Highway 15", "status": "blocked", "alternativeRoute": "State Highway 4 Bypass"},
                {"highway": "Riverbank Embankment Road", "status": "inundated", "alternativeRoute": "Panchayat Village Path"},
                {"highway": "District Link Highway", "status": "open", "alternativeRoute": None}
            ]
        elif type_str == "cyclone":
            shelters = [
                {"name": f"{district} Cyclone Shelter #1", "capacity": 1500, "occupied": 1420, "status": "active"},
                {"name": "Coastal Community Center", "capacity": 600, "occupied": 600, "status": "full"},
                {"name": "High Land School Safe House", "capacity": 500, "occupied": 80, "status": "active"}
            ]
            routes = [
                {"highway": "National Highway 16 (East Coast)", "status": "warning", "alternativeRoute": "District Inner Expressway"},
                {"highway": "Port Connection Road", "status": "blocked", "alternativeRoute": "Coastal Protection Bypass"},
                {"highway": "Main Arterial Way", "status": "open", "alternativeRoute": None}
            ]
        elif type_str == "heatwave":
            shelters = [
                {"name": f"{district} Public Cooling Center", "capacity": 300, "occupied": 120, "status": "active"},
                {"name": "Municipal Red Cross Shelter", "capacity": 200, "occupied": 80, "status": "active"}
            ]
            routes = [
                {"highway": "District Arterial Road", "status": "open", "alternativeRoute": None}
            ]
        else:
            shelters = [
                {"name": f"{district} Community Relief Center", "capacity": 500, "occupied": 150, "status": "active"}
            ]
            routes = [
                {"highway": "State Highway Link", "status": "open", "alternativeRoute": None}
            ]

        result.append({
            **a,
            "expectedStart": to_iso_str(start),
            "expectedEnd": to_iso_str(end),
            "activeShelters": shelters,
            "evacuationRoutes": routes
        })
    return result

@router.get("/alerts", response_model=List[DisasterAlert])
async def get_alerts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DisasterAlertModel)
        .where(DisasterAlertModel.active == "true")
        .order_by(desc(DisasterAlertModel.issued_at))
    )
    rows = result.scalars().all()
    
    return [
        DisasterAlert(
            id=r.id,
            type=r.type,
            severity=r.severity,
            title=r.title,
            description=r.description,
            affectedDistricts=r.affected_districts,
            probability=r.probability,
            expectedDate=r.expected_date,
            recommendedActions=r.recommended_actions,
            issuedAt=to_iso_str(r.issued_at)
        )
        for r in rows
    ]

@router.get("/alerts/detailed", response_model=List[DetailedAlert])
async def get_detailed_alerts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DisasterAlertModel)
        .where(DisasterAlertModel.active == "true")
        .order_by(desc(DisasterAlertModel.issued_at))
    )
    rows = result.scalars().all()
    
    detailed = []
    for r in rows:
        areas_data = build_affected_areas(r.type, r.issued_at)
        affected_areas = [AffectedArea(**a) for a in areas_data]
        
        detailed.append(
            DetailedAlert(
                id=r.id,
                type=r.type,
                severity=r.severity,
                title=r.title,
                description=r.description,
                affectedDistricts=r.affected_districts,
                probability=r.probability,
                confidence=confidence_from_probability(r.probability),
                status=status_from_severity(r.severity),
                expectedDate=r.expected_date,
                recommendedActions=r.recommended_actions,
                issuedAt=to_iso_str(r.issued_at),
                affectedAreas=affected_areas
            )
        )
    return detailed

@router.get("/alerts/recent", response_model=List[AlertEvent])
async def get_recent_alerts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AlertEventModel)
        .order_by(desc(AlertEventModel.timestamp))
        .limit(10)
    )
    rows = result.scalars().all()
    
    return [
        AlertEvent(
            id=r.id,
            type=r.type,
            message=r.message,
            region=r.region,
            severity=r.severity,
            timestamp=to_iso_str(r.timestamp)
        )
        for r in rows
    ]
