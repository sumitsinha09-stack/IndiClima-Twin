from sqlalchemy import Column, Integer, Float, String, DateTime, func
from sqlalchemy.dialects.postgresql import ARRAY
from app.database.base import Base

class ClimateSnapshot(Base):
    __tablename__ = "climate_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    rainfall = Column(Float, nullable=False)
    wind_speed = Column(Float, nullable=False)
    air_pressure = Column(Float, nullable=False)
    cloud_cover = Column(Float, nullable=False)
    aqi = Column(Integer, nullable=False)
    cyclone_active = Column(String, nullable=False, default="false")
    monsoon_phase = Column(String, nullable=False, default="active")
    reservoir_level = Column(Float, nullable=False)
    drought_index = Column(Float, nullable=False)
    forest_fire_risk = Column(String, nullable=False, default="moderate")
    heatwave_risk = Column(String, nullable=False, default="low")
    flood_probability = Column(Float, nullable=False)
    recorded_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

class ClimateSummary(Base):
    __tablename__ = "climate_summary"

    id = Column(Integer, primary_key=True, index=True)
    avg_temp = Column(Float, nullable=False)
    total_rainfall = Column(Float, nullable=False)
    active_cyclones = Column(Integer, nullable=False, default=0)
    active_alerts = Column(Integer, nullable=False, default=0)
    affected_districts = Column(Integer, nullable=False, default=0)
    co2_level = Column(Float, nullable=False)
    temp_anomaly_from_baseline = Column(Float, nullable=False)
    rainfall_deficit = Column(Float, nullable=False)
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

class DisasterAlert(Base):
    __tablename__ = "disaster_alerts"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    affected_districts = Column(ARRAY(String), nullable=False, default=list)
    probability = Column(Float, nullable=False)
    expected_date = Column(String, nullable=True)
    recommended_actions = Column(ARRAY(String), nullable=False, default=list)
    issued_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    active = Column(String, nullable=False, default="true")

class AlertEvent(Base):
    __tablename__ = "alert_events"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)
    message = Column(String, nullable=False)
    region = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    hazard = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    trend = Column(String, nullable=False, default="stable")
    top_regions = Column(ARRAY(String), nullable=False, default=list)
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

class MonsoonStatus(Base):
    __tablename__ = "monsoon_status"

    id = Column(Integer, primary_key=True, index=True)
    phase = Column(String, nullable=False, default="active")
    onset_date = Column(String, nullable=True)
    predicted_onset_date = Column(String, nullable=True)
    current_coverage = Column(Float, nullable=False)
    rainfall_deficit = Column(Float, nullable=False)
    progression_percent = Column(Float, nullable=False)
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
