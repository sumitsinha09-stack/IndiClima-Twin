# IndiClima Twin India

**AI-Powered Digital Twin of India's Climate**

IndiClima Twin India is a full-stack, real-time climate intelligence platform that creates a digital twin of India's climate. It simulates weather and climate patterns, predicts future scenarios using AI models, visualises data on interactive maps, and provides decision-support tools for policymakers, researchers, farmers, and disaster management authorities.

---

## Features

- **Live Command Center** — national-level climate metrics auto-refreshed every 60 seconds with a visible countdown timer
- **Interactive India Map** — SVG-based climate map with switchable layers (temperature, rainfall, wind, humidity, flood zones, AQI)
- **Climate Explorer & Forecast Intelligence** — search any state, district, or city in India (using autocomplete query hierarchy or interactive state selector SVG map) to analyze current weather telemetry, 72-hour temperature predictions with Area confidence bounds, 15-day outlooks, 30-year anomalies, disaster risk timelines, split screen GIS layer comparators, and export PDF reports/CSV data.
- **AI Climate Predictions** — risk-score rings for flood, cyclone, heatwave, drought, landslide, and forest fire with confidence and trend indicators
- **Disaster Prediction Module** — severity-coded alerts with per-district affected areas, population at risk, meteorological parameters, and sortable/searchable tables
- **Digital Twin Scenario Simulator** — sliders for temperature change, rainfall, deforestation, urban expansion, sea-level rise, and carbon emissions; live-updating impact scores
- **Climate Analytics** — 30-year temperature and rainfall trend charts with moving averages and anomaly visualisation
- **Agriculture Dashboard** — crop suitability scores, sowing advisory, soil moisture gauge, and yield predictions
- **Water Resources Dashboard** — 8 major reservoir fill levels, river danger-level status, groundwater depletion statistics
- **60-Second Auto-Refresh** — centralized React Query refresh manager; all widgets, charts, and maps update silently on a 60-second cycle with manual "Refresh Now" override
- **Dark Futuristic UI** — glassmorphism cards, animated gradients, monospace type, neon accents, command-center aesthetic

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Routing | Wouter |
| Data fetching | TanStack React Query v5 |
| Charts | Recharts |
| Backend | Express 5, Node.js 24, TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod v4, drizzle-zod |
| API contract | OpenAPI 3.1 (Orval codegen → React Query hooks + Zod schemas) |
| Logging | Pino + pino-http |
| Package manager | pnpm workspaces (monorepo) |

---

## Repository Structure

```
climatetwin-india/
├── backend/                 # Python FastAPI API server
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   └── endpoints/   # Endpoint routers (health, climate, alerts, etc.)
│   │   ├── core/            # Configuration and settings
│   │   ├── database/        # Database sessions and setup
│   │   ├── models/          # SQLAlchemy database models
│   │   └── schemas/         # Pydantic validation/serialization schemas
│   └── requirements.txt
├── artifacts/
│   └── climate-twin/        # React + Vite frontend
│       └── src/
│           ├── App.tsx
│           ├── components/
│           │   ├── layout.tsx
│           │   ├── refresh-timer.tsx
│           │   └── ui/           # shadcn/ui components
│           ├── hooks/
│           │   ├── use-refresh-manager.ts
│           │   └── use-mobile.tsx
│           └── pages/
│               ├── landing.tsx
│               ├── dashboard.tsx
│               ├── map.tsx
│               ├── ai-predictions.tsx
│               ├── simulator.tsx
│               ├── analytics.tsx
│               ├── disasters.tsx
│               ├── agriculture.tsx
│               ├── water.tsx
│               └── settings.tsx
├── lib/
│   ├── api-spec/            # OpenAPI 3.1 specification (source of truth)
│   │   └── openapi.yaml
│   ├── api-client-react/    # Generated React Query hooks (do not edit)
│   ├── api-zod/             # Generated Zod schemas (do not edit)
│   └── db/                  # Drizzle ORM – schema, client, migrations
│       └── src/
│           └── schema/
│               ├── climate.ts
│               ├── alerts.ts
│               └── predictions.ts
├── scripts/
│   └── src/
│       └── seed-climate.ts  # DB seeder
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## Prerequisites

- **Node.js** v20 or later (v24 recommended)
- **pnpm** v9 or later — `npm install -g pnpm`
- **PostgreSQL** v14 or later running locally or via a cloud provider

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd climatetwin-india
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/climatetwin
SESSION_SECRET=your-long-random-secret
NODE_ENV=development
```

### 4. Create the PostgreSQL database

```bash
createdb climatetwin
```

Or use psql:

```sql
CREATE DATABASE climatetwin;
```

### 5. Push the database schema

```bash
pnpm --filter @workspace/db run push
```

### 6. Seed the database with initial climate data

```bash
pnpm --filter @workspace/scripts run seed-climate
```

---

## Running in Development

Open two terminals (or use a process manager):

**Terminal 1 — API Server (Python FastAPI):**

```bash
PYTHONPATH=backend backend/.venv/bin/python backend/app/main.py
```

The API server starts on port **8080** (or `$PORT`) and is available at `http://localhost:8080/api`.

**Terminal 2 — Frontend:**

```bash
pnpm --filter @workspace/climate-twin run dev
```

The frontend starts on port **3000** (or `$VITE_PORT`) and is available at `http://localhost:3000`.

---

## API Endpoints

All routes are prefixed with `/api`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/healthz` | Health check |
| GET | `/climate/current` | Live climate metrics (temperature, humidity, AQI, etc.) |
| GET | `/climate/map-layers?layer=rainfall` | Map layer data points (rainfall, temperature, wind, humidity, flood_zones, aqi) |
| GET | `/climate/trends?metric=temperature` | 30-year trend data |
| GET | `/climate/summary` | Dashboard summary statistics |
| GET | `/alerts` | Active disaster alerts |
| GET | `/alerts/detailed` | Full alerts with per-district affected area breakdown |
| GET | `/alerts/recent` | Recent alert event feed |
| GET | `/predictions/risks` | AI risk scores for all hazard types |
| GET | `/predictions/forecast` | 7-day weather forecast |
| GET | `/predictions/monsoon` | Monsoon status |
| POST | `/scenarios/simulate` | Run a digital twin scenario (request body: ScenarioInput) |
| GET | `/agriculture/dashboard` | Agriculture dashboard data |
| GET | `/water/dashboard` | Water resource dashboard data |
| GET | `/climate/explorer/locations` | Get list of available states, districts, and cities in India |
| GET | `/climate/explorer/data` | Get unified climate explorer details for selected location |
| GET | `/climate/explorer/report` | Download PDF climate report for specific location |

The full API contract is defined in `lib/api-spec/openapi.yaml`.

---

## Regenerating API Client Code

If you modify `lib/api-spec/openapi.yaml`, regenerate the client hooks and Zod schemas:

```bash
pnpm --filter @workspace/api-spec run codegen
```

This regenerates files in `lib/api-client-react/` and `lib/api-zod/`. Do not edit these files manually.

---

## Database Schema

Managed with Drizzle ORM. To push schema changes:

```bash
# Development (direct push, no migration files)
pnpm --filter @workspace/db run push

# If column conflicts occur
pnpm --filter @workspace/db run push-force
```

Tables:

| Table | Description |
|-------|-------------|
| `climate_snapshots` | Live climate sensor readings |
| `climate_summary` | Aggregated national-level summary |
| `disaster_alerts` | Active disaster alerts |
| `alert_events` | Rolling event feed |
| `risk_predictions` | AI hazard risk scores |
| `monsoon_status` | Current monsoon phase and progression |

---

## Typecheck

```bash
# Full frontend and script typecheck
pnpm run typecheck

# Per-package
pnpm --filter @workspace/climate-twin run typecheck
```

---

## Build

```bash
# Build frontend (produces dist/ bundle)
pnpm --filter @workspace/climate-twin run build
```

---

## Production Deployment

### API Server (Python FastAPI)

```bash
# Create python virtual environment and install packages
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt

# Run using uvicorn or gunicorn in production
PYTHONPATH=backend PORT=8080 DATABASE_URL=postgresql://... backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8080
```

### Frontend

```bash
pnpm --filter @workspace/climate-twin run build
# Serve dist/ with nginx, Caddy, or any static file server
```

### Nginx example (serves both on the same domain)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # API routes
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
    }

    # Frontend static files
    location / {
        root /path/to/climate-twin/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Plugging in Real APIs

The architecture is designed to swap simulated data for real API sources. Each endpoint in `backend/app/api/endpoints/` fetches from the database; replace the DB reads with live API calls:

- **IMD Weather** — set `IMD_API_KEY` in `.env`, call `https://api.imd.gov.in/`
- **OpenWeather** — set `OPENWEATHER_API_KEY`, call `https://api.openweathermap.org/data/3.0/`
- **NASA POWER** — no key needed for basic use, call `https://power.larc.nasa.gov/api/`
- **CPCB AQI** — set `CPCB_API_KEY`, call the CPCB data portal
- **CWC Reservoir data** — set `CWC_API_KEY`, call India-WRIS

---

## 60-Second Auto-Refresh

The refresh system is centralized in `artifacts/climate-twin/src/hooks/use-refresh-manager.ts`.

- On mount, a 1-second interval counts down from 60
- At 0, `queryClient.invalidateQueries()` and `refetchQueries({ type: "active" })` are called — all active React Query hooks re-fetch simultaneously
- A deduplication guard prevents concurrent refresh cycles
- The "Refresh Now" button triggers the same flow immediately and resets the countdown
- React Query's `staleTime: 55_000` ensures data is always treated as stale when the timer fires
- Failed requests retry up to 2 times with exponential backoff; last successful data is displayed on failure

---

## Contributing

1. Branch from `main`
2. Make changes — run `pnpm run typecheck` before committing
3. If you change the OpenAPI spec, run `pnpm --filter @workspace/api-spec run codegen`
4. If you change the DB schema, run `pnpm --filter @workspace/db run push` in dev

---

## License

MIT
