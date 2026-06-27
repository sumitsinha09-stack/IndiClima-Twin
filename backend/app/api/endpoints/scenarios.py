from fastapi import APIRouter
from app.schemas.scenarios import ScenarioInput, ScenarioResult

router = APIRouter()

@router.post("/scenarios/simulate", response_model=ScenarioResult)
async def simulate_scenario(payload: ScenarioInput):
    t_change = payload.temperatureChange
    r_change = payload.rainfallChange
    def_pct = payload.deforestationPercent
    urb_pct = payload.urbanExpansionPercent
    sl_rise = payload.seaLevelRise
    co2_change = payload.carbonEmissionsChange
    green_pct = payload.urbanGreenCoverPercent
    albedo = payload.albedoIndex

    base_flood_risk = 38.0
    base_drought_risk = 30.0
    base_heatwave_risk = 45.0

    # Compute scenario impacts based on parameter interactions
    flood_inc = r_change * 0.8 if r_change > 0 else r_change * 0.3
    flood_risk = min(100.0, max(0.0,
        base_flood_risk
        + flood_inc
        + sl_rise * 12.0
        + def_pct * 0.6
        + urb_pct * 0.4
    ))

    drought_inc = abs(r_change) * 0.9 if r_change < 0 else -r_change * 0.3
    drought_risk = min(100.0, max(0.0,
        base_drought_risk
        + drought_inc
        + t_change * 3.5
        + def_pct * 0.5
    ))

    # Heatwave risk adjusted by green cover and albedo
    heat_dec = r_change * 0.2 if r_change > 0 else 0.0
    heatwave_risk = min(100.0, max(0.0,
        base_heatwave_risk
        + t_change * 8.0
        + urb_pct * 0.7
        + co2_change * 0.2
        - heat_dec
        - green_pct * 0.2
        - albedo * 10.0
    ))

    agriculture_impact = min(100.0, max(-100.0,
        -(t_change * 6.0)
        + (r_change * 0.5)
        - (def_pct * 1.2)
        - (drought_risk - base_drought_risk) * 0.4
    ))

    water_availability = min(50.0, max(-70.0,
        r_change * 0.6
        - t_change * 4.0
        - def_pct * 0.8
        - urb_pct * 0.5
        + sl_rise * (-5.0)
    ))

    affected_population = int(round(
        (flood_risk * 4.2 + drought_risk * 3.8 + heatwave_risk * 5.1) / 3.0 * 0.8
    ))

    def_co2 = abs(def_pct) * 1.5 if def_pct < 0 else def_pct * 2.0
    co2_concentration = 422.6 + co2_change * 0.8 - def_co2
    
    # Surface temperature offset by urban green cover and albedo reflectivity
    surface_temp = 34.2 + t_change + urb_pct * 0.05 + co2_change * 0.02 - (green_pct * 0.04) - (albedo * 1.5)

    # UHI Index ranges from 1.0 (very low) to 10.0 (extremely critical urban heat island effect)
    uhi_index = max(1.0, min(10.0,
        5.0 + (urb_pct * 0.15) - (green_pct * 0.06) - (albedo * 2.5) + (t_change * 0.2)
    ))

    return ScenarioResult(
        floodRisk=round(flood_risk, 1),
        droughtRisk=round(drought_risk, 1),
        heatwaveRisk=round(heatwave_risk, 1),
        agricultureImpact=round(agriculture_impact, 1),
        waterAvailability=round(water_availability, 1),
        affectedPopulation=affected_population,
        co2Concentration=round(co2_concentration, 1),
        surfaceTemp=round(surface_temp, 1),
        uhiIndex=round(uhi_index, 1)
    )
