from fastapi import APIRouter
from app.schemas.agriculture import AgricultureData, ChatMessage, ChatResponse

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

@router.post("/agriculture/chat", response_model=ChatResponse)
async def chat_agriculture(payload: ChatMessage):
    msg = payload.message.lower()
    
    if "paddy" in msg or "rice" in msg:
        reply = (
            "🌾 **Paddy Advisory:** Current soil moisture (58.3%) and optimal temperature "
            "make it an excellent window for short-duration paddy transplanting in Eastern India. "
            "For Northwest regions, recommend delaying transplanting by 1 week until monsoon coverage reaches 85%."
        )
    elif "cotton" in msg:
        reply = (
            "🌱 **Cotton Advisory:** Cotton suitability is currently at 76%. Ensure proper drainage in black soils. "
            "Sowing is recommended immediately as normal rainfall outlook guarantees strong initial vegetative growth. "
            "Watch out for early-stage sucking pests."
        )
    elif "wheat" in msg:
        reply = (
            "🌾 **Wheat Advisory:** As we are currently in the Kharif season cycle, wheat (Rabi crop) sowing "
            "is not advised. Yield predictions for next season show a slight decline (-1.4% change) due to "
            "projected higher winter temperatures. Plan for heat-resistant varieties (e.g., HD-3385)."
        )
    elif "moisture" in msg or "soil" in msg or "water" in msg:
        reply = (
            "💧 **Soil Intelligence:** National soil moisture is stable at 58.3%. However, the crop stress index "
            "of 34/100 indicates mild localized moisture stress in parts of Vidarbha and rainfed districts of Karnataka. "
            "Implement drip irrigation where available."
        )
    elif "rain" in msg or "monsoon" in msg or "weather" in msg:
        reply = (
            "🌧️ **Meteorological Outlook:** The current rainfall outlook is classified as 'Normal'. "
            "Monsoon winds are progressing steadily through Central India, covering 70.2% of the land area. "
            "No extreme rainfall events are forecast for the agricultural belts over the next 48 hours."
        )
    else:
        reply = (
            "👋 **Namaste! I am Krishi AI, your ClimateTwin Agricultural Advisor.**\n\n"
            "I can help you with crop suitability, sowing windows, soil moisture details, and yield projections. "
            "Try asking me about **paddy**, **cotton**, **wheat**, or **soil moisture**!"
        )
        
    return ChatResponse(reply=reply)
