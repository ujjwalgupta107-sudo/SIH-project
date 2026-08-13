# CivicShield AI — Phase 1

CivicShield AI turns citizen evidence into structured civic incidents and gives city operators a geospatial command center. Phase 1 provides the UX, API, database, authentication, contracts, and integration seams; ML predictions remain explicitly simulated development data.

## Architecture

```
frontend/
  citizen/          mobile-first Vite + React citizen experience
  command-center/   desktop-first Vite + React operations interface
  shared/           TypeScript API contracts shared by both clients
backend/
  app/              FastAPI routers, schemas, services, repositories, models
  alembic/          PostgreSQL/PostGIS migrations
  tests/            API and permissions tests
```

The backend owns persistence and returns canonical contracts. `services/ai.py` is a replaceable development adapter, not a production ML claim. Both frontends keep seed data isolated in `src/data/demo.ts` until API wiring is enabled.

## Setup

Copy `.env.example` to `.env` and set values appropriate for your environment. Never commit `.env`.

### Database

```bash
docker compose up -d db
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
alembic upgrade head
```

PostGIS is provided by `postgis/postgis`; use `DATABASE_URL` from the example file.

### Backend

```bash
cd backend
uvicorn app.main:app --reload
pytest
```

API docs are available at `http://localhost:8000/docs`. The initial routes are `GET /health`, incident create/list/read/update routes, and `GET /api/v1/departments`.

### Frontends

```bash
cd frontend/citizen && npm install && npm run dev
cd frontend/command-center && npm install && npm run dev
```

Citizen routes: `/home`, `/report`, `/analysis`, `/incident/:id`, `/history`, `/profile`.
Command Center routes: `/dashboard`, `/incidents`, `/predictive`, `/departments`.

## Environment variables

`DATABASE_URL`, `JWT_SECRET`, `AI_SERVICE_URL`, `VITE_API_URL`, and `VITE_MAP_STYLE_URL` are documented in `.env.example`. Map tiles are optional: when absent, the map abstraction presents a deliberate development state, with no hard-coded key.

## Testing

Run backend checks with `cd backend && pytest`. Frontends include type-check/build commands: `npm run build`. Phase 1 does not run a deployed database, tile service, camera, microphone, GPS, or ML model in CI; each has an explicit interface and user-facing state.

## Phase 1 limitations / Phase 2

Implement a real identity provider, object storage, MapLibre tile source, WebSockets, offline queue, real media upload, PostGIS spatial clustering, ML inference, duplicate matching, prediction training, and human-assisted resolution verification. The current development AI adapter produces deterministic labelled sample analysis only after user evidence is provided.
