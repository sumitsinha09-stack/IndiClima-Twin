import math
import random
import os
import json
import urllib.request
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional

# List of 50 major locations in India with geographical and climate baselines representing all 28 states and 8 Union Territories
LOCATIONS = [
    # North
    {"state": "Delhi", "district": "New Delhi", "city": "Delhi", "lat": 28.6139, "lng": 77.2090, "zone": "composite", "temp_base": 25.0, "rain_base": 600, "aqi_base": 190, "soil_base": 0.35, "elev": 216},
    {"state": "J&K", "district": "Srinagar", "city": "Srinagar", "lat": 34.0837, "lng": 74.7973, "zone": "temperate", "temp_base": 13.5, "rain_base": 700, "aqi_base": 65, "soil_base": 0.60, "elev": 1585},
    {"state": "J&K", "district": "Jammu", "city": "Jammu", "lat": 32.7266, "lng": 74.8570, "zone": "subtropical", "temp_base": 23.0, "rain_base": 1100, "aqi_base": 85, "soil_base": 0.45, "elev": 327},
    {"state": "Himachal Pradesh", "district": "Shimla", "city": "Shimla", "lat": 31.1048, "lng": 77.1734, "zone": "temperate", "temp_base": 14.0, "rain_base": 1300, "aqi_base": 45, "soil_base": 0.65, "elev": 2206},
    {"state": "Uttarakhand", "district": "Dehradun", "city": "Dehradun", "lat": 30.3165, "lng": 78.0322, "zone": "subtropical", "temp_base": 21.5, "rain_base": 2000, "aqi_base": 90, "soil_base": 0.58, "elev": 640},
    {"state": "Punjab", "district": "Amritsar", "city": "Amritsar", "lat": 31.6340, "lng": 74.8723, "zone": "semi-arid", "temp_base": 23.0, "rain_base": 650, "aqi_base": 140, "soil_base": 0.48, "elev": 234},
    {"state": "Chandigarh", "district": "Chandigarh", "city": "Chandigarh", "lat": 30.7333, "lng": 76.7794, "zone": "composite", "temp_base": 23.8, "rain_base": 1050, "aqi_base": 110, "soil_base": 0.42, "elev": 321},
    {"state": "Uttar Pradesh", "district": "Lucknow", "city": "Lucknow", "lat": 26.8467, "lng": 80.9462, "zone": "subtropical", "temp_base": 25.5, "rain_base": 950, "aqi_base": 160, "soil_base": 0.50, "elev": 123},
    {"state": "Uttar Pradesh", "district": "Varanasi", "city": "Varanasi", "lat": 25.3176, "lng": 82.9739, "zone": "subtropical", "temp_base": 26.0, "rain_base": 1000, "aqi_base": 150, "soil_base": 0.52, "elev": 81},
    {"state": "Uttar Pradesh", "district": "Agra", "city": "Agra", "lat": 27.1767, "lng": 78.0081, "zone": "semi-arid", "temp_base": 25.8, "rain_base": 750, "aqi_base": 170, "soil_base": 0.38, "elev": 171},
    {"state": "Haryana", "district": "Gurgaon", "city": "Gurugram", "lat": 28.4595, "lng": 77.0266, "zone": "semi-arid", "temp_base": 25.2, "rain_base": 550, "aqi_base": 195, "soil_base": 0.32, "elev": 219},
    
    # West
    {"state": "Maharashtra", "district": "Mumbai", "city": "Mumbai", "lat": 19.0760, "lng": 72.8777, "zone": "tropical-wet", "temp_base": 27.2, "rain_base": 2200, "aqi_base": 95, "soil_base": 0.55, "elev": 14},
    {"state": "Maharashtra", "district": "Pune", "city": "Pune", "lat": 18.5204, "lng": 73.8567, "zone": "tropical-dry", "temp_base": 25.0, "rain_base": 750, "aqi_base": 80, "soil_base": 0.42, "elev": 560},
    {"state": "Maharashtra", "district": "Nagpur", "city": "Nagpur", "lat": 21.1458, "lng": 79.0882, "zone": "composite", "temp_base": 26.8, "rain_base": 1100, "aqi_base": 105, "soil_base": 0.46, "elev": 310},
    {"state": "Rajasthan", "district": "Jaipur", "city": "Jaipur", "lat": 26.9124, "lng": 75.7873, "zone": "semi-arid", "temp_base": 25.0, "rain_base": 550, "aqi_base": 125, "soil_base": 0.28, "elev": 431},
    {"state": "Rajasthan", "district": "Jaisalmer", "city": "Jaisalmer", "lat": 26.9157, "lng": 70.9083, "zone": "arid", "temp_base": 27.5, "rain_base": 150, "aqi_base": 115, "soil_base": 0.12, "elev": 225},
    {"state": "Rajasthan", "district": "Udaipur", "city": "Udaipur", "lat": 24.5854, "lng": 73.7125, "zone": "semi-arid", "temp_base": 24.2, "rain_base": 620, "aqi_base": 95, "soil_base": 0.32, "elev": 420},
    {"state": "Gujarat", "district": "Ahmedabad", "city": "Ahmedabad", "lat": 23.0225, "lng": 72.5714, "zone": "semi-arid", "temp_base": 27.0, "rain_base": 780, "aqi_base": 130, "soil_base": 0.34, "elev": 53},
    {"state": "Gujarat", "district": "Kutch", "city": "Bhuj", "lat": 23.2420, "lng": 69.6669, "zone": "arid", "temp_base": 26.5, "rain_base": 330, "aqi_base": 100, "soil_base": 0.18, "elev": 110},
    {"state": "Gujarat", "district": "Surat", "city": "Surat", "lat": 21.1702, "lng": 72.8311, "zone": "tropical-wet", "temp_base": 27.0, "rain_base": 1200, "aqi_base": 105, "soil_base": 0.48, "elev": 13},
    
    # South
    {"state": "Karnataka", "district": "Bengaluru", "city": "Bengaluru", "lat": 12.9716, "lng": 77.5946, "zone": "temperate-tropical", "temp_base": 23.6, "rain_base": 900, "aqi_base": 70, "soil_base": 0.48, "elev": 920},
    {"state": "Karnataka", "district": "Dharwad", "city": "Hubli", "lat": 15.3647, "lng": 75.1240, "zone": "tropical-dry", "temp_base": 25.2, "rain_base": 730, "aqi_base": 75, "soil_base": 0.44, "elev": 670},
    {"state": "Tamil Nadu", "district": "Chennai", "city": "Chennai", "lat": 13.0827, "lng": 80.2707, "zone": "tropical-wet", "temp_base": 28.6, "rain_base": 1400, "aqi_base": 85, "soil_base": 0.50, "elev": 6},
    {"state": "Tamil Nadu", "district": "Coimbatore", "city": "Coimbatore", "lat": 11.0168, "lng": 76.9558, "zone": "tropical-dry", "temp_base": 26.3, "rain_base": 650, "aqi_base": 65, "soil_base": 0.38, "elev": 411},
    {"state": "Telangana", "district": "Hyderabad", "city": "Hyderabad", "lat": 17.3850, "lng": 78.4867, "zone": "tropical-dry", "temp_base": 26.0, "rain_base": 800, "aqi_base": 115, "soil_base": 0.40, "elev": 505},
    {"state": "Kerala", "district": "Trivandrum", "city": "Trivandrum", "lat": 8.5241, "lng": 76.9366, "zone": "tropical-wet", "temp_base": 27.0, "rain_base": 1800, "aqi_base": 48, "soil_base": 0.62, "elev": 5},
    {"state": "Kerala", "district": "Ernakulam", "city": "Kochi", "lat": 9.9312, "lng": 76.2673, "zone": "tropical-wet", "temp_base": 27.2, "rain_base": 3000, "aqi_base": 52, "soil_base": 0.65, "elev": 2},
    {"state": "Goa", "district": "North Goa", "city": "Panaji", "lat": 15.4909, "lng": 73.8278, "zone": "tropical-wet", "temp_base": 27.5, "rain_base": 2900, "aqi_base": 50, "soil_base": 0.58, "elev": 7},
    {"state": "Andhra Pradesh", "district": "Visakhapatnam", "city": "Visakhapatnam", "lat": 17.6868, "lng": 83.2185, "zone": "tropical-wet", "temp_base": 27.5, "rain_base": 1000, "aqi_base": 80, "soil_base": 0.40, "elev": 45},
    
    # East & Central
    {"state": "West Bengal", "district": "Kolkata", "city": "Kolkata", "lat": 22.5726, "lng": 88.3639, "zone": "tropical-wet", "temp_base": 26.8, "rain_base": 1600, "aqi_base": 135, "soil_base": 0.56, "elev": 9},
    {"state": "West Bengal", "district": "Darjeeling", "city": "Darjeeling", "lat": 27.0410, "lng": 88.2627, "zone": "temperate", "temp_base": 12.0, "rain_base": 3000, "aqi_base": 42, "soil_base": 0.70, "elev": 2042},
    {"state": "Bihar", "district": "Patna", "city": "Patna", "lat": 25.5941, "lng": 85.1376, "zone": "subtropical", "temp_base": 25.8, "rain_base": 1150, "aqi_base": 180, "soil_base": 0.52, "elev": 53},
    {"state": "Odisha", "district": "Khordha", "city": "Bhubaneswar", "lat": 20.2961, "lng": 85.8245, "zone": "tropical-wet", "temp_base": 27.0, "rain_base": 1450, "aqi_base": 90, "soil_base": 0.48, "elev": 45},
    {"state": "Madhya Pradesh", "district": "Indore", "city": "Indore", "lat": 22.7196, "lng": 75.8577, "zone": "composite", "temp_base": 24.5, "rain_base": 900, "aqi_base": 110, "soil_base": 0.44, "elev": 553},
    {"state": "Madhya Pradesh", "district": "Bhopal", "city": "Bhopal", "lat": 23.2599, "lng": 77.4126, "zone": "composite", "temp_base": 25.1, "rain_base": 1050, "aqi_base": 115, "soil_base": 0.45, "elev": 427},
    {"state": "Chhattisgarh", "district": "Raipur", "city": "Raipur", "lat": 21.2514, "lng": 81.6296, "zone": "composite", "temp_base": 26.5, "rain_base": 1300, "aqi_base": 120, "soil_base": 0.42, "elev": 298},
    {"state": "Jharkhand", "district": "Ranchi", "city": "Ranchi", "lat": 23.3441, "lng": 85.3096, "zone": "subtropical", "temp_base": 23.5, "rain_base": 1400, "aqi_base": 95, "soil_base": 0.48, "elev": 651},
    
    # Northeast
    {"state": "Assam", "district": "Kamrup", "city": "Guwahati", "lat": 26.1445, "lng": 91.7362, "zone": "subtropical-wet", "temp_base": 24.0, "rain_base": 1700, "aqi_base": 80, "soil_base": 0.60, "elev": 55},
    {"state": "Tripura", "district": "West Tripura", "city": "Agartala", "lat": 23.8315, "lng": 91.2868, "zone": "subtropical-wet", "temp_base": 25.0, "rain_base": 2200, "aqi_base": 70, "soil_base": 0.58, "elev": 15},
    {"state": "Arunachal Pradesh", "district": "Papum Pare", "city": "Itanagar", "lat": 27.0844, "lng": 93.6053, "zone": "subtropical-wet", "temp_base": 21.0, "rain_base": 2800, "aqi_base": 40, "soil_base": 0.65, "elev": 320},
    {"state": "Manipur", "district": "Imphal West", "city": "Imphal", "lat": 24.8170, "lng": 93.9368, "zone": "subtropical-wet", "temp_base": 20.8, "rain_base": 1400, "aqi_base": 50, "soil_base": 0.60, "elev": 786},
    {"state": "Meghalaya", "district": "East Khasi Hills", "city": "Shillong", "lat": 25.5788, "lng": 91.8933, "zone": "temperate", "temp_base": 17.0, "rain_base": 2400, "aqi_base": 35, "soil_base": 0.68, "elev": 1525},
    {"state": "Mizoram", "district": "Aizawl", "city": "Aizawl", "lat": 23.7307, "lng": 92.7173, "zone": "subtropical-wet", "temp_base": 21.5, "rain_base": 2500, "aqi_base": 38, "soil_base": 0.62, "elev": 1132},
    {"state": "Nagaland", "district": "Kohima", "city": "Kohima", "lat": 25.6751, "lng": 94.1086, "zone": "temperate", "temp_base": 18.5, "rain_base": 1800, "aqi_base": 42, "soil_base": 0.64, "elev": 1444},
    {"state": "Sikkim", "district": "Gangtok", "city": "Gangtok", "lat": 27.3314, "lng": 88.6138, "zone": "temperate", "temp_base": 15.2, "rain_base": 3500, "aqi_base": 30, "soil_base": 0.72, "elev": 1650},
    
    # Islands & UTs
    {"state": "Andaman and Nicobar Islands", "district": "South Andaman", "city": "Port Blair", "lat": 11.6234, "lng": 92.7265, "zone": "tropical-wet", "temp_base": 27.0, "rain_base": 3100, "aqi_base": 32, "soil_base": 0.65, "elev": 16},
    {"state": "Dadra and Nagar Haveli and Daman and Diu", "district": "Daman", "city": "Daman", "lat": 20.3974, "lng": 72.8328, "zone": "tropical-wet", "temp_base": 27.2, "rain_base": 1600, "aqi_base": 95, "soil_base": 0.45, "elev": 5},
    {"state": "Ladakh", "district": "Leh", "city": "Leh", "lat": 34.1526, "lng": 77.5771, "zone": "alpine", "temp_base": 6.5, "rain_base": 100, "aqi_base": 28, "soil_base": 0.08, "elev": 3500},
    {"state": "Lakshadweep", "district": "Lakshadweep", "city": "Kavaratti", "lat": 10.5667, "lng": 72.6369, "zone": "tropical-wet", "temp_base": 28.0, "rain_base": 1600, "aqi_base": 35, "soil_base": 0.40, "elev": 2},
    {"state": "Puducherry", "district": "Puducherry", "city": "Pondicherry", "lat": 11.9416, "lng": 79.8083, "zone": "tropical-wet", "temp_base": 28.2, "rain_base": 1300, "aqi_base": 75, "soil_base": 0.46, "elev": 3}
]

def find_location(state: Optional[str] = None, district: Optional[str] = None, city: Optional[str] = None) -> Dict[str, Any]:
    # Match as closely as possible, fallback to first location (Delhi) if no match
    if city:
        for loc in LOCATIONS:
            if loc["city"].lower() == city.lower():
                return loc
    if district:
        for loc in LOCATIONS:
            if loc["district"].lower() == district.lower():
                return loc
    if state:
        for loc in LOCATIONS:
            if loc["state"].lower() == state.lower():
                return loc
    return LOCATIONS[0]

def get_wind_direction_string(deg: float) -> str:
    directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    idx = int((deg + 11.25) / 22.5) % 16
    return directions[idx]

def get_weather_condition(temp: float, humidity: float, rain: float, cloud: float, state: str) -> str:
    # Logic to classify weather condition
    if rain > 5.0:
        if temp > 22 and humidity > 75 and random.random() > 0.4:
            return "thunderstorm"
        return "rain"
    if cloud > 70:
        return "cloudy"
    if humidity > 85 and temp < 18:
        return "fog"
    if temp < 0:
        return "snow"
    return "sunny"

def seed_based_random(seed_str: str) -> random.Random:
    # Use deterministic random number generator based on the location name + date to keep mock updates stable per hour
    current_hour_bucket = datetime.now().strftime("%Y-%m-%d-%H")
    final_seed = f"{seed_str}-{current_hour_bucket}"
    
    # Hash the seed string to an integer
    val = 0
    for char in final_seed:
        val = (val * 31 + ord(char)) & 0xFFFFFFFF
    return random.Random(val)

def generate_unified_climate_model(state: Optional[str], district: Optional[str], city: Optional[str]) -> Dict[str, Any]:
    loc = find_location(state, district, city)
    rng = seed_based_random(loc["city"])
    
    # Current date & time parameters
    now = datetime.now(timezone.utc)
    month = now.month
    hour = now.hour
    
    # --- 1. CURRENT WEATHER CALCULATION ---
    # Temperature sinusoidal diurnal swing + seasonal variation
    season_temp_shift = 10.0 * math.sin((month - 5) * math.pi / 6)  # Summer peak in May (5)
    diurnal_temp_shift = 5.0 * math.sin((hour - 14) * math.pi / 12)  # Afternoon peak at 2 PM (14)
    temp = round(loc["temp_base"] + season_temp_shift + diurnal_temp_shift + rng.uniform(-1.5, 1.5), 1)
    
    # Adjust for elevation (cooling effect)
    if loc["elev"] > 1000:
        temp = round(temp - (loc["elev"] - 1000) * 0.005, 1)

    min_temp = round(temp - rng.uniform(4.0, 7.0), 1)
    max_temp = round(temp + rng.uniform(3.0, 6.0), 1)
    
    # Humidity seasonal shift (monsoon high, summer low)
    season_hum_shift = 25.0 * math.sin((month - 8) * math.pi / 6)  # Monsoon peak in August (8)
    humidity = max(10, min(100, int(60 + season_hum_shift + rng.uniform(-10, 10))))
    
    # Cloud cover correlation with humidity
    cloud_cover = max(0, min(100, int(humidity + rng.uniform(-15, 15))))
    
    # Rainfall generation
    is_monsoon = month in [6, 7, 8, 9]
    rain_prob = 0.8 if is_monsoon else 0.15
    if loc["zone"] == "arid":
        rain_prob *= 0.2
    
    rainfall = 0.0
    if rng.random() < rain_prob:
        rainfall_base_amount = 35.0 if is_monsoon else 5.0
        rainfall = round(rng.uniform(0.5, rainfall_base_amount), 1)
    
    # Wind calculation
    wind_speed = round(rng.uniform(5.0, 25.0), 1)
    if is_monsoon:
        wind_speed = round(wind_speed * 1.5, 1)
    wind_direction_deg = int(rng.uniform(0, 360))
    wind_direction = get_wind_direction_string(wind_direction_deg)
    
    # Air pressure
    air_pressure = round(1013.0 - (loc["elev"] / 8.5) + rng.uniform(-3.0, 3.0), 1)
    
    # Visibility
    visibility = round(max(0.1, 10.0 - (humidity * 0.05) - (loc["aqi_base"] * 0.02) + rng.uniform(-1.0, 1.0)), 1)
    
    # UV Index
    uv_index = max(1, min(11, int((12 - abs(now.month - 6)) * 0.8 + diurnal_temp_shift * 0.4 + rng.uniform(-1, 1))))
    
    # AQI
    aqi_seasonal = 50 * math.sin((month - 11) * math.pi / 6)  # High in winter (November/December)
    aqi = int(max(10, loc["aqi_base"] + aqi_seasonal + rng.uniform(-15, 15)))
    
    # Soil Moisture (only for agricultural or wet zones)
    soil_moisture = None
    if loc["zone"] not in ["arid", "alpine"]:
        soil_moisture = round(max(0.0, min(1.0, loc["soil_base"] + (rainfall * 0.02) + (humidity - 50) * 0.005 + rng.uniform(-0.05, 0.05))), 2)
        
    # Heat Index & Dew Point
    # Simplistic approximation
    heat_index = round(temp + (0.5555 * (((6.11 * math.exp(5417.7530 * (1/273.16 - 1/(273.15 + (humidity/100 * temp))))) - 10))), 1)
    heat_index = max(temp, heat_index)
    dew_point = round(temp - ((100 - humidity) / 5), 1)
    
    # Sunrise & Sunset (approx based on latitude)
    sunrise_hour = 5.5 + (loc["lat"] * 0.02) * math.sin((month - 3) * math.pi / 6)
    sunset_hour = 18.5 - (loc["lat"] * 0.02) * math.sin((month - 3) * math.pi / 6)
    
    def format_hour(h: float) -> str:
        hours = int(h)
        mins = int((h - hours) * 60)
        return f"{hours:02d}:{mins:02d}"
        
    sunrise = format_hour(sunrise_hour)
    sunset = format_hour(sunset_hour)
    
    condition = get_weather_condition(temp, humidity, rainfall, cloud_cover, loc["state"])
    feels_like = round(temp + (humidity - 60) * 0.1, 1)

    current_data = {
        "temperature": temp,
        "feelsLike": feels_like,
        "minTemp": min_temp,
        "maxTemp": max_temp,
        "humidity": float(humidity),
        "rainfall": rainfall,
        "windSpeed": wind_speed,
        "windDirection": wind_direction,
        "windDirectionDeg": wind_direction_deg,
        "airPressure": air_pressure,
        "visibility": visibility,
        "uvIndex": uv_index,
        "cloudCover": float(cloud_cover),
        "aqi": aqi,
        "soilMoisture": soil_moisture,
        "heatIndex": heat_index,
        "dewPoint": dew_point,
        "sunrise": sunrise,
        "sunset": sunset,
        "condition": condition
    }
    
    # --- 2. TEMPERATURE TRAJECTORY PREDICTION (FORECAST) ---
    # 72 Hours Hourly Forecast
    hourly_forecasts = []
    for h in range(72):
        f_time = now + timedelta(hours=h)
        # Model diurnal pattern + random variation
        diurnal = 6.0 * math.sin((f_time.hour - 14) * math.pi / 12)
        trend_shift = h * 0.02  # Slight warming trend modeled
        hourly_temp = round(loc["temp_base"] + season_temp_shift + diurnal + trend_shift + rng.uniform(-1.0, 1.0), 1)
        
        # Lower and upper confidence bands
        uncertainty = 1.0 + (h * 0.05) # Uncertainty grows with time
        temp_lower = round(hourly_temp - uncertainty, 1)
        temp_upper = round(hourly_temp + uncertainty, 1)
        
        h_humidity = max(10, min(100, int(humidity + diurnal * -2 + rng.uniform(-5, 5))))
        h_rain_prob = max(0, min(100, int(rain_prob * 100 + (h * 0.1) + rng.uniform(-10, 10))))
        h_rain = 0.0
        if rng.random() * 100 < h_rain_prob * 0.3:
            h_rain = round(rng.uniform(0.1, 8.0), 1)
            
        h_condition = get_weather_condition(hourly_temp, h_humidity, h_rain, cloud_cover, loc["state"])
        
        hourly_forecasts.append({
            "time": f_time.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
            "temp": hourly_temp,
            "tempLower": temp_lower,
            "tempUpper": temp_upper,
            "condition": h_condition,
            "humidity": float(h_humidity),
            "rainProbability": float(h_rain_prob)
        })
        
    # 15 Days Daily Forecast
    daily_forecasts = []
    for d in range(15):
        f_day = now + timedelta(days=d)
        d_date = f_day.strftime("%Y-%m-%d")
        
        d_max = round(max_temp + rng.uniform(-2.0, 2.0) + d * 0.05, 1)
        d_min = round(min_temp + rng.uniform(-2.0, 2.0) + d * 0.05, 1)
        
        d_uncertainty = 1.5 + (d * 0.15)
        d_max_lower = round(d_max - d_uncertainty, 1)
        d_max_upper = round(d_max + d_uncertainty, 1)
        d_min_lower = round(d_min - d_uncertainty, 1)
        d_min_upper = round(d_min + d_uncertainty, 1)
        
        d_humidity = max(10, min(100, int(humidity + rng.uniform(-8, 8))))
        d_rain_prob = max(0, min(100, int(rain_prob * 100 + rng.uniform(-15, 15))))
        d_rain = round(rng.uniform(0.0, 15.0), 1) if rng.random() * 100 < d_rain_prob else 0.0
        d_condition = get_weather_condition((d_max + d_min)/2, d_humidity, d_rain, cloud_cover, loc["state"])
        
        daily_forecasts.append({
            "date": d_date,
            "maxTemp": d_max,
            "maxTempLower": d_max_lower,
            "maxTempUpper": d_max_upper,
            "minTemp": d_min,
            "minTempLower": d_min_lower,
            "minTempUpper": d_min_upper,
            "condition": d_condition,
            "humidity": float(d_humidity),
            "rainProbability": float(d_rain_prob),
            "rainfall": d_rain
        })
        
    forecast_data = {
        "hourly": hourly_forecasts,
        "daily": daily_forecasts,
        "weeklyTrend": f"Temperatures in {loc['city']} are expected to rise by {rng.uniform(0.5, 1.8):.1f}°C over the next week. Monsoon winds are expected to intensify, bringing moderate showers.",
        "seasonalOutlook": f"The seasonal model predicts above-normal temperatures by {rng.uniform(0.3, 1.2):.1f}°C, with normal monsoon precipitation levels expected across the district.",
        "forecastAccuracy": round(rng.uniform(92.5, 96.8), 1)
    }
    
    # --- 3. CLIMATE TREND ANALYSIS (LONG TERM) ---
    warming_rate = round(0.12 + rng.uniform(-0.04, 0.08), 3) # °C per decade
    
    temp_anoms = []
    rain_trends = []
    for y in range(1994, 2026):
        progress = (y - 1994) / 32.0
        # warming trend
        t_val = round(loc["temp_base"] + progress * warming_rate * 3.2 + rng.uniform(-0.8, 0.8), 2)
        t_anom = round(t_val - loc["temp_base"], 2)
        temp_anoms.append({"year": y, "value": t_val, "anomaly": t_anom})
        
        # rainfall variance
        r_val = round(loc["rain_base"] * (1.0 + rng.uniform(-0.25, 0.25) - progress * 0.03), 1)
        r_anom = round(r_val - loc["rain_base"], 1)
        rain_trends.append({"year": y, "value": r_val, "anomaly": r_anom})
        
    trend_data = {
        "warmingRateDecade": warming_rate * 10,
        "extremeHeatDaysTrend": f"Increasing by {round(rng.uniform(1.2, 3.5), 1)} days per year since 1994",
        "monsoonOnsetTrend": f"Delayed by average of {int(rng.uniform(3, 8))} days over past 3 decades",
        "annualRainfallAnomaly": round(rng.uniform(-80.0, 50.0), 1),
        "temperatureAnomalies": temp_anoms,
        "rainfallTrends": rain_trends
    }
    
    # --- 4. DISASTER RISK INTELLIGENCE ---
    # Calculate hazard probabilities based on geographic zone & current state
    hazards_config = [
        {"hazard": "flood", "zones": ["tropical-wet", "subtropical-wet"], "base_prob": 15, "precautions": ["Store drinking water and dry food", "Move electrical items to higher levels", "Stay tuned to local radio/news"]},
        {"hazard": "flash_flood", "zones": ["temperate", "subtropical-wet"], "base_prob": 10, "precautions": ["Avoid walking or driving through water currents", "Move to higher ground immediately", "Do not shelter near rivers"]},
        {"hazard": "cyclone", "zones": ["tropical-wet"], "coastal_only": True, "base_prob": 8, "precautions": ["Secure loose outdoor items", "Move to storm shelters if advised", "Prepare emergency response kit"]},
        {"hazard": "heatwave", "zones": ["arid", "semi-arid", "composite"], "base_prob": 20, "precautions": ["Avoid direct sun exposure between 11 AM - 4 PM", "Hydrate frequently with water and ORS", "Keep home interiors cool"]},
        {"hazard": "cold_wave", "zones": ["temperate", "composite"], "base_prob": 12, "precautions": ["Wear multiple layers of warm clothing", "Protect livestock from freezing drafts", "Consume hot fluids regularly"]},
        {"hazard": "heavy_rainfall", "zones": ["tropical-wet", "subtropical-wet", "temperate"], "base_prob": 30, "precautions": ["Avoid low-lying areas and open storm drains", "Maintain vehicle safety lights when driving", "Clear rooftop drainage outlets"]},
        {"hazard": "cloudburst", "zones": ["temperate"], "base_prob": 5, "precautions": ["Stay away from steep mountain slopes", "Avoid camping near mountain streams", "Seek concrete buildings for cover"]},
        {"hazard": "drought", "zones": ["arid", "semi-arid", "tropical-dry"], "base_prob": 18, "precautions": ["Implement water recycling measures", "Deploy drip irrigation in agriculture", "Mulch crops to conserve soil moisture"]},
        {"hazard": "landslide", "zones": ["temperate"], "mountain_only": True, "base_prob": 14, "precautions": ["Stay alert for cracking sounds in rocks/soil", "Avoid travel during heavy cloudbursts", "Keep clear of unstable retaining walls"]},
        {"hazard": "forest_fire", "zones": ["semi-arid", "tropical-dry", "temperate"], "base_prob": 10, "precautions": ["Avoid open burning near dry scrublands", "Report early smoke plumes to fire departments", "Clear buffer zones around rural dwellings"]},
        {"hazard": "lightning", "zones": ["subtropical", "composite", "tropical-wet"], "base_prob": 25, "precautions": ["Take shelter inside concrete structures", "Avoid tall trees and metal poles", "Unplug computers and electrical devices"]},
        {"hazard": "dust_storm", "zones": ["arid", "semi-arid"], "base_prob": 15, "precautions": ["Wear masks and protective eyewear", "Stay indoors during high-wind alerts", "Secure light-weight roofing sheets"]},
        {"hazard": "coastal_surge", "zones": ["tropical-wet"], "coastal_only": True, "base_prob": 6, "precautions": ["Evacuate seawall and shoreline zones", "Anchor small watercraft securely", "Avoid visiting beaches or harbor areas"]}
    ]
    
    active_alerts = []
    historical_risk_count = int(rng.uniform(4, 25))
    
    for hc in hazards_config:
        # Check geographic applicability
        is_applicable = (loc["zone"] in hc["zones"])
        if hc.get("coastal_only") and loc["elev"] > 30:
            is_applicable = False
        if hc.get("mountain_only") and loc["elev"] < 1000:
            is_applicable = False
            
        if is_applicable:
            # Modify probability based on current weather conditions
            prob = hc["base_prob"]
            if hc["hazard"] == "flood" and rainfall > 15.0:
                prob += 40
            elif hc["hazard"] == "heatwave" and temp > 40:
                prob += 50
            elif hc["hazard"] == "landslide" and rainfall > 25.0:
                prob += 45
            elif hc["hazard"] == "drought" and rainfall == 0.0 and humidity < 35:
                prob += 30
            elif hc["hazard"] == "forest_fire" and temp > 35 and humidity < 30:
                prob += 35
                
            prob = min(98.0, round(prob + rng.uniform(-5.0, 10.0), 1))
            
            if prob > 35:
                risk_level = "low"
                if prob > 80:
                    risk_level = "severe"
                elif prob > 65:
                    risk_level = "high"
                elif prob > 45:
                    risk_level = "moderate"
                    
                start_time = now + timedelta(hours=int(rng.uniform(2, 48)))
                duration_hours = int(rng.uniform(6, 120))
                severity_score = round(prob / 10 * rng.uniform(0.8, 1.1), 1)
                severity_score = min(10.0, max(1.0, severity_score))
                confidence_score = round(rng.uniform(78.0, 96.0), 1)
                
                advisory = f"IMD has issued a advisory for the {loc['district']} district due to expected {hc['hazard']} risks. Residents should take all necessary precautions."
                
                active_alerts.append({
                    "hazard": hc["hazard"],
                    "riskLevel": risk_level,
                    "probability": prob,
                    "expectedStart": start_time.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
                    "expectedDuration": f"{duration_hours} hours",
                    "affectedAreas": [loc["city"], f"{loc['district']} East", f"{loc['district']} Rural"],
                    "severityScore": severity_score,
                    "confidenceScore": confidence_score,
                    "precautions": hc["precautions"],
                    "governmentAdvisory": advisory
                })
                
    disaster_data = {
        "activeAlerts": sorted(active_alerts, key=lambda x: x["probability"], reverse=True),
        "historicalOccurrenceCount": historical_risk_count
    }
    
    # --- 5. HISTORICAL CLIMATE EXPLORER ---
    monthly_data = []
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    # Generate historical monthly averages for years 2015, 2020, 2025
    for year in [2015, 2020, 2025]:
        y_rng = seed_based_random(f"{loc['city']}-{year}")
        for i, m_name in enumerate(months):
            m_index = i + 1
            m_temp_shift = 8.0 * math.sin((m_index - 5) * math.pi / 6)
            m_rain_shift = 150.0 * math.sin((m_index - 8) * math.pi / 6) if loc["zone"] in ["tropical-wet", "subtropical-wet"] else 30.0 * math.sin((m_index - 8) * math.pi / 6)
            m_rain_shift = max(1.0, m_rain_shift)
            
            m_temp = round(loc["temp_base"] + m_temp_shift + (year - 2015) * 0.05 + y_rng.uniform(-1.0, 1.0), 1)
            m_rain = round(loc["rain_base"]/12 + m_rain_shift + y_rng.uniform(-20, 20), 1)
            m_rain = max(0.0, m_rain)
            m_humidity = max(20, min(100, int(60 + (m_rain * 0.05) + y_rng.uniform(-8, 8))))
            m_aqi = int(max(10, loc["aqi_base"] + 40 * math.sin((m_index - 11) * math.pi / 6) + y_rng.uniform(-10, 10)))
            
            monthly_data.append({
                "month": m_name,
                "year": year,
                "temperature": m_temp,
                "rainfall": m_rain,
                "humidity": float(m_humidity),
                "aqi": m_aqi
            })
            
    historical_disasters = [
        {"year": 2018, "date": "2018-08-15", "type": "flood", "severity": "severe", "description": "Severe flooding caused by heavy monsoon rainfall and dam releases, affecting 1.2 million citizens."},
        {"year": 2020, "date": "2020-05-20", "type": "cyclone", "severity": "severe", "description": "Super Cyclone caused high wind damage and sea water inundation along low elevation structures."},
        {"year": 2022, "date": "2022-04-28", "type": "heatwave", "severity": "extreme", "description": "Extreme heatwave spanning 12 days with temperatures peaking at +4.5C above typical averages."}
    ]
    
    historical_data = {
        "yearsAvailable": [2015, 2020, 2025],
        "monthlyAverages": monthly_data,
        "previousDisasters": historical_disasters
    }
    
    # --- 6. AI SUMMARY panels ---
    summary_text = ""
    # Try calling the Gemini API first
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        prompt = (
            f"Write a concise climate assessment for {loc['city']}, {loc['state']}. "
            f"Here is current telemetry: Temperature {temp}°C, Humidity {humidity}%, Rainfall {rainfall}mm, Weather condition {condition}, AQI {aqi}. "
            f"Upcoming forecast shows temperature trajectory max {max_temp}°C, min {min_temp}°C. "
            f"Primary active hazards: {', '.join([a['hazard'] + ' (' + str(a['probability']) + '%)' for a in active_alerts[:2]]) or 'None'}. "
            f"Ensure tone is professional and covers current state, forecast outlook, and necessary public precautions."
        )
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "systemInstruction": {"parts": [{"text": "You are a precise weather meteorology system. Summarize details in 2-3 sentences. No markdown headers."}]}
        }
        try:
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
            with urllib.request.urlopen(req, timeout=5) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                summary_text = res_body['candidates'][0]['content']['parts'][0]['text'].strip()
        except Exception:
            summary_text = ""
            
    # Fallback to localized robust template generator if Gemini fails or is missing
    if not summary_text:
        alerts_str = ""
        if active_alerts:
            top_alerts = sorted(active_alerts, key=lambda x: x["probability"], reverse=True)[:2]
            alerts_str = f" A {top_alerts[0]['riskLevel']} risk of {top_alerts[0]['hazard']} is present ({top_alerts[0]['probability']}% probability), expected to begin in {top_alerts[0]['expectedStart'][:10]}. "
            if len(top_alerts) > 1:
                alerts_str += f"Additionally, there is a {top_alerts[1]['probability']}% probability of a {top_alerts[1]['hazard']} event. "
        else:
            alerts_str = " No significant climate hazard threats are anticipated over the short term. "
            
        summary_text = (
            f"The climate command center for {loc['city']}, {loc['state']} reports a current temperature of {temp}°C (feels like {feels_like}°C) with {condition} conditions. "
            f"Humidity levels are at {humidity}%, and the AQI is {aqi}, indicating a '{'Moderate' if aqi > 100 else 'Good'}' air quality state. "
            f"Over the next 72 hours, temperatures are predicted to swing between a minimum of {min_temp}°C and a maximum of {max_temp}°C.{alerts_str}"
            f"Residents are advised to monitor the active command alerts and follow recommendations: {', '.join(active_alerts[0]['precautions'][:2]) if active_alerts else 'Stay hydrated and check daily alerts.'}"
        )
        
    return {
        "location": loc,
        "current": current_data,
        "forecast": forecast_data,
        "trends": trend_data,
        "disasterRisk": disaster_data,
        "aiSummary": summary_text,
        "historical": historical_data
    }
