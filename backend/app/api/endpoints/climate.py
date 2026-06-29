import random
import os
import json
import urllib.request
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database.session import get_db
from app.models.base import ClimateSnapshot, ClimateSummary
from app.schemas.climate import CurrentClimate, MapDataPoint, TrendDataPoint, ClimateSummary as ClimateSummarySchema
from app.schemas.agriculture import ChatMessage, ChatResponse

router = APIRouter()

def jitter(val: float, max_pct=0.02) -> float:
    return round(val * (1 + (random.random() - 0.5) * max_pct * 2), 2)

@router.get("/climate/current", response_model=CurrentClimate)
async def get_current_climate(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ClimateSnapshot).order_by(desc(ClimateSnapshot.recorded_at)).limit(1)
    )
    snap = result.scalars().first()
    
    if not snap:
        raise HTTPException(status_code=503, detail="No climate data available")

    # Map database row to CurrentClimate schema applying random jitter
    return CurrentClimate(
        temperature=jitter(snap.temperature, 0.015),
        humidity=jitter(snap.humidity, 0.02),
        rainfall=jitter(snap.rainfall, 0.05),
        windSpeed=jitter(snap.wind_speed, 0.04),
        airPressure=jitter(snap.air_pressure, 0.005),
        cloudCover=jitter(snap.cloud_cover, 0.03),
        aqi=int(round(jitter(snap.aqi, 0.04))),
        cycloneActive=snap.cyclone_active == "true",
        monsoonPhase=snap.monsoon_phase,
        reservoirLevel=jitter(snap.reservoir_level, 0.01),
        droughtIndex=round(snap.drought_index + (random.random() - 0.5) * 0.05, 2),
        forestFireRisk=snap.forest_fire_risk,
        heatwaveRisk=snap.heatwave_risk,
        floodProbability=jitter(snap.flood_probability, 0.03),
        updatedAt=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
    )

@router.get("/climate/map-layers", response_model=List[MapDataPoint])
async def get_map_layers(
    layer: str = Query("temperature", enum=["rainfall", "temperature", "wind", "humidity", "flood_zones", "aqi"])
):
    base_points = [
        {"lat": 28.6, "lng": 77.2, "district": "Delhi", "state": "Delhi"},
        {"lat": 19.08, "lng": 72.88, "district": "Mumbai", "state": "Maharashtra"},
        {"lat": 22.57, "lng": 88.36, "district": "Kolkata", "state": "West Bengal"},
        {"lat": 13.08, "lng": 80.27, "district": "Chennai", "state": "Tamil Nadu"},
        {"lat": 12.97, "lng": 77.59, "district": "Bengaluru", "state": "Karnataka"},
        {"lat": 17.38, "lng": 78.47, "district": "Hyderabad", "state": "Telangana"},
        {"lat": 23.02, "lng": 72.57, "district": "Ahmedabad", "state": "Gujarat"},
        {"lat": 26.92, "lng": 75.78, "district": "Jaipur", "state": "Rajasthan"},
        {"lat": 21.15, "lng": 79.09, "district": "Nagpur", "state": "Maharashtra"},
        {"lat": 25.36, "lng": 85.14, "district": "Patna", "state": "Bihar"},
        {"lat": 22.72, "lng": 75.86, "district": "Indore", "state": "Madhya Pradesh"},
        {"lat": 30.73, "lng": 76.78, "district": "Chandigarh", "state": "Chandigarh"},
        {"lat": 8.73, "lng": 77.73, "district": "Trivandrum", "state": "Kerala"},
        {"lat": 20.27, "lng": 85.84, "district": "Bhubaneswar", "state": "Odisha"},
        {"lat": 26.44, "lng": 80.33, "district": "Lucknow", "state": "Uttar Pradesh"},
        {"lat": 26.20, "lng": 91.74, "district": "Guwahati", "state": "Assam"},
        {"lat": 34.08, "lng": 74.79, "district": "Srinagar", "state": "J&K"},
        {"lat": 15.33, "lng": 75.13, "district": "Dharwad", "state": "Karnataka"},
        {"lat": 10.79, "lng": 79.13, "district": "Thanjavur", "state": "Tamil Nadu"},
        {"lat": 23.83, "lng": 91.28, "district": "Agartala", "state": "Tripura"},
    ]

    layer_values = {
        "temperature": [38, 31, 33, 36, 29, 35, 40, 42, 36, 34, 37, 28, 32, 34, 36, 30, 12, 31, 35, 32],
        "rainfall": [12, 45, 68, 22, 18, 30, 5, 2, 28, 95, 15, 8, 120, 85, 20, 140, 3, 60, 30, 150],
        "wind": [15, 22, 18, 28, 12, 20, 35, 18, 22, 16, 25, 30, 20, 24, 18, 22, 40, 15, 22, 18],
        "humidity": [55, 78, 82, 72, 68, 70, 45, 38, 65, 80, 58, 60, 85, 82, 70, 88, 42, 72, 78, 90],
        "flood_zones": [15, 30, 65, 20, 10, 25, 8, 5, 45, 75, 20, 12, 40, 80, 55, 85, 5, 25, 45, 90],
        "aqi": [180, 110, 145, 95, 75, 130, 160, 155, 140, 165, 150, 85, 55, 100, 175, 65, 45, 80, 90, 60],
    }

    values = layer_values.get(layer, layer_values["temperature"])
    points = []
    for i, p in enumerate(base_points):
        val = round(values[i] + (random.random() - 0.5) * values[i] * 0.04, 1)
        points.append(
            MapDataPoint(
                lat=p["lat"],
                lng=p["lng"],
                district=p["district"],
                state=p["state"],
                value=val,
                label=f"{values[i]:.1f}"
            )
        )
    return points

@router.get("/climate/trends", response_model=List[TrendDataPoint])
async def get_climate_trends(
    metric: str = Query("temperature", enum=["temperature", "rainfall", "humidity"])
):
    baseline = {"temperature": 25.8, "rainfall": 1180.0, "humidity": 65.0}
    base = baseline.get(metric, 25.8)

    trend = []
    for year in range(1994, 2025):
        progress = (year - 1994) / 30.0
        if metric == "temperature":
            trend_delta = progress * 1.4
            noise = (random.random() - 0.5) * 1.2
        elif metric == "rainfall":
            trend_delta = -progress * 60.0
            noise = (random.random() - 0.5) * 120.0
        else:
            trend_delta = 0.0
            noise = (random.random() - 0.5) * 1.2

        val = base + trend_delta + noise
        anomaly = val - base
        trend.append({
            "year": year,
            "value": round(val, 2),
            "anomaly": round(anomaly, 2),
            "movingAvg": None
        })

    for i in range(4, len(trend)):
        subset = trend[i-4 : i+1]
        avg = sum(d["value"] for d in subset) / 5.0
        trend[i]["movingAvg"] = round(avg, 2)

    return [TrendDataPoint(**t) for t in trend]

@router.get("/climate/summary", response_model=ClimateSummarySchema)
async def get_climate_summary(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ClimateSummary).order_by(desc(ClimateSummary.updated_at)).limit(1)
    )
    s = result.scalars().first()
    
    if not s:
        raise HTTPException(status_code=503, detail="No summary data available")

    return ClimateSummarySchema(
        avgTemp=jitter(s.avg_temp, 0.01),
        totalRainfall=jitter(s.total_rainfall, 0.03),
        activeCyclones=s.active_cyclones,
        activeAlerts=s.active_alerts,
        affectedDistricts=s.affected_districts,
        co2Level=jitter(s.co2_level, 0.002),
        tempAnomalyFromBaseline=jitter(s.temp_anomaly_from_baseline, 0.02),
        rainfallDeficit=jitter(s.rainfall_deficit, 0.03)
    )

def call_gemini_api(prompt: str, context: str = "") -> Optional[str]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    system_instruction = (
        "You are the IndiClima Twin AI Advisor, a conversational assistant integrated directly into the IndiClima Twin India command center. "
        "Your role is to answer questions about the IndiClima Twin platform (the simulator, clean energy hub, Krishi AI chatbot, and emergency shelter routing) "
        "as well as general climate science, microclimates in India, meteorological terms, crop suitability, and green energy. "
        "Keep responses professional, concise (1-3 paragraphs), and format key parameters or instructions in markdown. "
        "If asked about platform capabilities, relate it to the 6 modules: Dashboard, Agriculture, Water, Energy, Analytics, and Simulator.\n\n"
        "Here is the current live telemetry data from the Digital Twin database that you can use to answer current state/weather questions:\n"
        f"{context}"
    )
    
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "systemInstruction": {
            "parts": [
                {
                    "text": system_instruction
                }
            ]
        }
    }
    
    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=8) as response:
            res_body = json.loads(response.read().decode("utf-8"))
            reply = res_body['candidates'][0]['content']['parts'][0]['text']
            return reply
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return None

@router.post("/climate/chat", response_model=ChatResponse)
async def chat_climate(payload: ChatMessage, db: AsyncSession = Depends(get_db)):
    # Fetch live telemetry from the database to inject as context
    context = ""
    try:
        snap_res = await db.execute(
            select(ClimateSnapshot).order_by(desc(ClimateSnapshot.recorded_at)).limit(1)
        )
        snap = snap_res.scalars().first()
        if snap:
            context += (
                "--- CURRENT TELEMETRY SNAPSHOT ---\n"
                f"Temperature: {snap.temperature}°C\n"
                f"Humidity: {snap.humidity}%\n"
                f"Rainfall: {snap.rainfall} mm\n"
                f"Wind Speed: {snap.wind_speed} km/h\n"
                f"Air Pressure: {snap.air_pressure} hPa\n"
                f"Air Quality Index (AQI): {snap.aqi}\n"
                f"Monsoon Phase: {snap.monsoon_phase}\n"
                f"Reservoir Level: {snap.reservoir_level}%\n"
                f"Drought Severity Index: {snap.drought_index}/10\n"
                f"Active Cyclone Alert: {'Yes' if snap.cyclone_active == 'true' else 'No'}\n"
                f"Forest Fire Risk: {snap.forest_fire_risk}/100\n"
                f"Heatwave Risk: {snap.heatwave_risk}/100\n"
                f"Flood Probability: {snap.flood_probability}%\n\n"
            )
            
        sum_res = await db.execute(
            select(ClimateSummary).order_by(desc(ClimateSummary.updated_at)).limit(1)
        )
        summary = sum_res.scalars().first()
        if summary:
            context += (
                "--- COMMAND CENTER SUMMARY ---\n"
                f"National Avg Temperature: {summary.avg_temp}°C\n"
                f"Seasonal Total Rainfall: {summary.total_rainfall} mm\n"
                f"Active Weather Alerts Count: {summary.active_alerts}\n"
                f"Affected Districts: {summary.affected_districts}\n"
                f"CO2 Concentration: {summary.co2_level} ppm\n"
                f"Temperature Anomaly from Baseline: +{summary.temp_anomaly_from_baseline}°C\n"
                f"Monsoon Deficit/Excess: {summary.rainfall_deficit}%\n\n"
            )
    except Exception as e:
        print(f"Error fetching context for chat: {e}")

    # Try calling the generative AI model with loaded telemetry context
    gemini_reply = call_gemini_api(payload.message, context)
    if gemini_reply:
        return ChatResponse(reply=gemini_reply)
        
    # Local intent fallback if Gemini API key is missing or calls fail
    msg = payload.message.lower()
    has_key = bool(os.getenv("GEMINI_API_KEY"))
    
    if "climatetwin" in msg or "indiclima" in msg or "concept of the project" in msg or "about the project" in msg:
        reply = (
            "🌍 **IndiClima Twin India** is a real-time digital twin platform designed to monitor and simulate India's changing microclimates. "
            "It uses PostgreSQL storage and parametric modeling to visualize weather, reservoir fill levels, agricultural crop suitability, "
            "and emergency disaster patterns in an integrated command center."
        )
    elif "simulate" in msg or "scenario" in msg or "uhi" in msg or "urban heat" in msg:
        reply = (
            "🖥️ **Scenario Simulator:** It leverages mathematical feedback loops mapping inputs like deforested surface percentages, "
            "urban sprawl growth, and temperature deviations to compound hazards like flood probability, drought severity index, "
            "and water stress factors. In our latest update, we also simulate **Urban Heat Island (UHI) Index** and green cover cooling effects!"
        )
    elif "disaster" in msg or "evacuate" in msg or "shelter" in msg or "relief" in msg or "highway" in msg:
        reply = (
            "🚨 **Disaster Command Center:** Tracks active alerts categorized by severity (watch, warning, severe, extreme). "
            "In the detailed views, it displays active evacuation corridors (e.g. NH-15) and relief shelter capacities "
            "to aid local disaster management authorities (NDRF/SDMAs) in planning."
        )
    elif "data" in msg or "source" in msg or "sensor" in msg or "telemetry" in msg:
        reply = (
            "📡 **Data Telemetry:** The platform simulates live environmental reporting by applying mathematical jitter to PostgreSQL seeded baselines. "
            "In production, this architecture is built to ingest real-time APIs from the Indian Meteorological Department (IMD), "
            "CPCB (for AQI), and ISRO (satellite imagery)."
        )
    elif "energy" in msg or "solar" in msg or "wind" in msg or "hydro" in msg:
        reply = (
            "⚡ **Renewable Energy Dashboard:** Models clean energy potential (solar irradiance and wind speeds) across Indian states like Rajasthan, "
            "Gujarat, and Tamil Nadu. It displays total grid capacity estimates under varying ambient temperature scenarios."
        )
    elif "agriculture" in msg or "crop" in msg or "soil" in msg or "krishi" in msg:
        reply = (
            "🌾 **Agriculture Viability:** Monitors crop suitability (e.g. Paddy, Cotton) and yield forecasts under changing soil moisture indices. "
            "The built-in Krishi AI chatbot on the Agriculture page provides direct agronomic advisories based on current regional conditions."
        )
    else:
        tip = (
            "💡 *Note: The dynamic Gemini AI is currently experiencing high demand or rate limits. Operating in local guide mode.*"
            if has_key else
            "💡 *Tip: To enable fully dynamic AI responses powered by Gemini, simply set your `GEMINI_API_KEY` in the project `.env` file!*"
        )
        reply = (
            "👋 **Hello! I am your IndiClima Twin conceptual guide.**\n\n"
            "I can answer questions about the platform's features, simulation algorithms, disaster tracking, and data sources.\n\n"
            f"{tip}"
        )
        
    return ChatResponse(reply=reply)
