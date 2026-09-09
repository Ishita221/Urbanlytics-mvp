"""
Urbanlytics MVP — FastAPI backend.

Single-file app: dashboard, forecast, and simulation endpoints, plus the
mock data that drives them. AQI and source-mix values shift with the
time of day so the dashboard feels like a live feed rather than a
static demo: traffic dominates during the morning rush, industrial
output peaks midday, and stubble burning takes over in the evening.
"""

import random
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Mock data
# ---------------------------------------------------------------------------

# Baseline AQI per period. Kept in the "Very Unhealthy" / "Hazardous" band
# throughout, reflecting Delhi's actual peak-pollution-season readings —
# the scenario this MVP is built to demo.
BASE_AQI_BY_PERIOD = {
    "morning": 320,   # rush hour traffic
    "midday": 295,    # industry-driven, slightly clearer
    "evening": 355,   # stubble burning peaks after fieldwork
    "night": 340,     # settles, but stagnant air traps pollutants
}

# Source breakdown per period — each set sums to 100.
SOURCE_PROFILES = {
    "morning": {"traffic": 55, "industry": 25, "stubble": 20},
    "midday": {"traffic": 35, "industry": 40, "stubble": 25},
    "evening": {"traffic": 25, "industry": 20, "stubble": 55},
    "night": {"traffic": 20, "industry": 30, "stubble": 50},
}

FORECAST_DATA = [
    {"day": "Mon", "aqi": 330},
    {"day": "Tue", "aqi": 345},
    {"day": "Wed", "aqi": 360},
    {"day": "Thu", "aqi": 380, "alert": True},
    {"day": "Fri", "aqi": 355},
    {"day": "Sat", "aqi": 310},
    {"day": "Sun", "aqi": 295},
]

RECOMMENDATIONS = {
    "low": "Encourage public transport usage",
    "medium": "Implement odd-even scheme",
    "high": "Enforce construction ban and industrial shutdown",
}


def get_time_period(hour: int) -> str:
    """Bucket an hour (0-23) into a time-of-day period."""
    if 5 <= hour < 10:
        return "morning"
    elif 10 <= hour < 16:
        return "midday"
    elif 16 <= hour < 20:
        return "evening"
    else:
        return "night"


def get_aqi_status(aqi: int) -> str:
    """Map a numeric AQI reading to a standard descriptive status band."""
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 200:
        return "Unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"


def get_dashboard_data(now: datetime | None = None) -> dict:
    """
    Build a dashboard snapshot for the current moment. AQI and source
    mix are derived from the time of day, with a small random jitter
    on top so the numbers move slightly between requests.
    """
    now = now or datetime.now()
    period = get_time_period(now.hour)

    jitter = random.randint(-10, 10)
    aqi = max(0, BASE_AQI_BY_PERIOD[period] + jitter)

    return {
        "aqi": aqi,
        "status": get_aqi_status(aqi),
        "location": "Delhi, India",
        "time_period": period,
        "sources": SOURCE_PROFILES[period],
    }


def get_recommendation(traffic_reduction: float) -> str:
    """Pick a recommendation based on how aggressive the traffic reduction is."""
    if traffic_reduction < 15:
        return RECOMMENDATIONS["low"]
    elif traffic_reduction < 35:
        return RECOMMENDATIONS["medium"]
    else:
        return RECOMMENDATIONS["high"]


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Urbanlytics API",
    description="Backend API for the Urbanlytics MVP — air quality dashboard, forecast, and traffic simulation.",
    version="1.0.0",
)

# CORS configuration — allows the frontend (e.g. a Vite/React dev server or
# a deployed Vercel app) to call this API. Restrict allow_origins to your
# actual frontend domain in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For MVP; restrict to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request/response models
# ---------------------------------------------------------------------------

class SimulationRequest(BaseModel):
    traffic_reduction: float = Field(
        ...,
        ge=0,
        le=50,
        description="Percentage reduction in traffic, between 0 and 50."
    )


class SimulationResponse(BaseModel):
    current_aqi: float
    new_aqi: float
    reduction_percent: float
    recommendation: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
def root():
    return {"message": "Urbanlytics API is running", "docs": "/docs"}


@app.get("/api/dashboard", tags=["Dashboard"])
def get_dashboard():
    """
    Returns a live-feeling AQI snapshot for the dashboard: current
    reading, status, location, and a source breakdown that shifts
    with the time of day (traffic-heavy mornings, stubble-heavy
    evenings), plus a small jitter so it never looks static.
    """
    return get_dashboard_data()


@app.get("/api/forecast", tags=["Forecast"])
def get_forecast():
    """
    Returns a 7-day AQI forecast. Any day crossing the hazardous
    threshold is flagged with "alert": true.
    """
    return FORECAST_DATA


@app.post("/api/simulation", response_model=SimulationResponse, tags=["Simulation"])
def run_simulation(payload: SimulationRequest):
    """
    Simulates the effect of reducing traffic on AQI.

    new_aqi = current_aqi * (1 - (traffic_reduction * 0.0125))
    """
    current_aqi = get_dashboard_data()["aqi"]
    traffic_reduction = payload.traffic_reduction

    new_aqi = current_aqi * (1 - (traffic_reduction * 0.0125))
    reduction_percent = round(((current_aqi - new_aqi) / current_aqi) * 100, 2)

    return SimulationResponse(
        current_aqi=current_aqi,
        new_aqi=round(new_aqi, 2),
        reduction_percent=reduction_percent,
        recommendation=get_recommendation(traffic_reduction),
    )
