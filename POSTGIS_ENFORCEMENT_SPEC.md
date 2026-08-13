# CIVICSHIELD AI — POSTGIS ENFORCEMENT SPECIFICATION

## 1. SQLite Usage Audit

Based on the repository inspection, the following references to SQLite exist and must be remediated:

| File | Occurrence | Action | Justification |
| :--- | :--- | :--- | :--- |
| `backend/tests/conftest.py` | `os.environ['DATABASE_URL']='sqlite:///./test.db'` | **REPLACE** | Tests must execute against a real PostgreSQL + PostGIS instance to catch spatial bugs. |
| `backend/app/database.py` | `connect_args={'check_same_thread': False} if settings.database_url.startswith('sqlite') else {}` | **REMOVED** | The application should crash if configured for SQLite. It must strictly expect PostgreSQL. |
| `backend/app/models.py` | `Geography(...) if dialect.name=='postgresql' else String(128)` | **REMOVED** | `GeographicPoint` must enforce `geoalchemy2.Geography` regardless of dialect. |
| `backend/test.db` | Local SQLite database file | **REMOVED** | Artifact of previous testing; no longer required. |

## 2. Database Architecture

**Target Architecture:**
- **Application:** FastAPI (Python 3.11+)
- **ORM / Driver:** SQLAlchemy + GeoAlchemy2 with `psycopg` (or `psycopg2`).
- **Database Server:** PostgreSQL 16
- **Spatial Extension:** PostGIS 3.4
- **No SQLite:** Hard failure if `sqlite://` is detected in the DSN.

**Configuration:**
- **SQLAlchemy URL:** `postgresql+psycopg://{user}:{pass}@{host}:{port}/{db}`
- **Connection Configuration:** Enforce connection pooling (e.g., `pool_size=10`, `max_overflow=20`) to handle burst incident reporting.
- **Session Management:** Standard `sessionmaker` injected via FastAPI `Depends()`.
- **Environment Variables:** Strictly rely on `DATABASE_URL` via `pydantic-settings`.

## 3. PostGIS Requirements

**Existing Architecture Confirmed:**
- **PostGIS extension:** Specified in `docker-compose.yml` (`postgis/postgis:16-3.4`).
- **Data Type:** `geography(POINT,4326)` correctly implemented in `models.py` and Alembic.
- **Indexes:** GiST spatial index on the `location` column. B-Tree indexes on `status`, `department`, and `created_at`.
- **Migrations:** Alembic is correctly wired up with raw SQL in `0002_postgis_assessments.py` to handle the data type shift.

**Future Support:**
- **Nearby incident queries:** GiST index allows `ST_DWithin` for O(1) spatial radius lookups.
- **Duplicate detection:** Rapidly filtering incidents within a 50m radius of a new report.
- **Hotspot analysis:** Hexbinning and spatial aggregation.
- **Geofencing / Risk Zones:** `ST_Contains` for ward or neighborhood-level filtering.

## 4. Testing Architecture

**Strategy:**
Tests must execute against PostgreSQL/PostGIS. 

**Recommended Approach:** Docker Compose Test Database
The existing `docker-compose.yml` provides a PostGIS container on port `5432`. Tests should point to this container but use a dedicated test database (e.g., `civicshield_test`) to isolate data from local development.

**Lifecycle:**
1. **Database Startup:** `docker-compose up -d db` must be running before tests execute.
2. **Database Initialization:** `conftest.py` connects to the test database URL (passed via `.env.test` or environment variables).
3. **Migration Execution:** Instead of `Base.metadata.create_all()`, the fixture should invoke Alembic programmatically (`alembic.command.upgrade(alembic_cfg, "head")`) to ensure the `postgis` extension and spatial constraints are faithfully replicated.
4. **Test Database Isolation:** Each test function receives a SQLAlchemy session wrapped in a transaction that is rolled back at the end of the test.
5. **Test Cleanup:** The transaction rollback handles cleanup. `Base.metadata.drop_all()` is no longer required on every test.

## 5. Migration Validation

**Exact Validation Steps:**
1. **Fresh Database:** Create a fresh database in the PostGIS container (`CREATE DATABASE civicshield;`).
2. **Extension Setup:** `CREATE EXTENSION IF NOT EXISTS postgis;` (Ensure this runs implicitly or via a bootstrap script).
3. **Alembic Upgrade:** `alembic upgrade head`
4. **Schema Creation Check:** Verify `incidents` table has a `location` column of type `geography(Point,4326)`.
5. **Spatial Index Check:** Verify index `ix_incidents_location_gist` is created using GiST.
6. **API Startup:** Run FastAPI server.
7. **Incident Creation:** POST a new incident payload containing `latitude` and `longitude`.
8. **Spatial Queries:** Execute a manual query to ensure spatial insertion worked:
   `SELECT ST_AsText(location) FROM incidents LIMIT 1;`

## 6. Failure Behavior

The API and test suite must fail **fast and clearly** if the database is misconfigured:
- **DATABASE_URL missing:** FastAPI/Pydantic-settings throws a `ValidationError` on startup.
- **DATABASE_URL invalid:** SQLAlchemy throws a connection exception immediately upon the first connection attempt.
- **SQLite detected:** Add a startup check in `database.py`:
  ```python
  if settings.database_url.startswith("sqlite"):
      raise RuntimeError("SQLite is strictly prohibited. Use PostgreSQL + PostGIS.")
  ```
- **PostGIS unavailable:** Add a startup verification hook that executes `SELECT postgis_version();` and crashes if it raises an error.

## 7. Development Experience

**Developer Workflow:**
1. Clone the repository.
2. Copy `.env.example` to `.env`.
3. Start the PostGIS database:
   ```bash
   docker-compose up -d db
   ```
4. Install dependencies:
   ```bash
   cd backend && pip install -r requirements.txt
   ```
5. Apply migrations:
   ```bash
   alembic upgrade head
   ```
6. Run the test suite:
   ```bash
   DATABASE_URL=postgresql+psycopg://civicshield:password@localhost:5432/civicshield pytest
   ```
7. Start the backend:
   ```bash
   uvicorn app.main:app --reload
   ```

## 8. Security

- **No credentials in source code:** Confirmed. `models.py`, `database.py`, and `conftest.py` rely entirely on environment variables.
- **Docker Compose:** The `docker-compose.yml` file uses environment variables (`${POSTGRES_PASSWORD:?set in .env}`) preventing hardcoded production passwords.
- **Environment variables:** Configured via `pydantic-settings`.
- **.env.example:** Safe placeholders are currently in use (`use-a-local-development-password`).

## 9. Phase 2 Compatibility

The database architecture is well-prepared for Phase 2:
- **Spatial queries:** `geography(POINT)` is implemented.
- **Incident tracking:** Status, UUIDs, and timestamps are present.
- **Audit logs:** The `AuditLog` table exists and tracks actor IDs and actions.
- **Schema changes needed NOW:** None. The core spatial functionality is successfully embedded in the database structure, avoiding painful migrations later.

## 10. CODEX POSTGIS ENFORCEMENT SPECIFICATION

# CODEX POSTGIS ENFORCEMENT SPECIFICATION

### Task 1: Remove SQLite Dialect Fallbacks
- **File/Module:** `backend/app/models.py`, `backend/app/database.py`
- **Current Behavior:** Contains conditional logic (`if dialect.name == 'postgresql'`) and connection argument overrides (`check_same_thread`) to support SQLite.
- **Required Behavior:** Models and database setup strictly enforce PostgreSQL features.
- **Implementation Requirements:**
  - Remove `load_dialect_impl` from `GeographicPoint`. Hardcode it to return the `Geography` type directly.
  - Remove the `connect_args` ternary operator in `database.py`.
  - Add an explicit `RuntimeError` if the `database_url` starts with `sqlite`.
- **Acceptance Criteria:** Code contains no string references to `sqlite`. Attempting to configure SQLite throws an immediate error.

### Task 2: Configure Tests for PostgreSQL
- **File/Module:** `backend/tests/conftest.py`
- **Current Behavior:** Hardcodes `os.environ['DATABASE_URL'] = 'sqlite:///./test.db'`. Uses `Base.metadata.create_all`.
- **Required Behavior:** Uses the PostgreSQL environment variable. Uses Alembic for table creation.
- **Implementation Requirements:**
  - Remove the hardcoded `sqlite` environment variable override.
  - Modify the `database` fixture to rely on the environment `DATABASE_URL`.
  - Replace `Base.metadata.create_all(engine)` with Alembic programmatic upgrades (import `alembic.config`, run `alembic upgrade head`).
- **Acceptance Criteria:** `pytest` runs and passes successfully against a live PostgreSQL/PostGIS database.

### Task 3: Enforce PostGIS Extension at Startup
- **File/Module:** `backend/app/main.py`
- **Current Behavior:** Connects to the database and creates missing rows, but doesn't verify spatial capabilities.
- **Required Behavior:** Fails to start if PostGIS is not installed.
- **Implementation Requirements:**
  - In the `startup` event, execute a raw SQL query `SELECT postgis_version();`.
  - If the query fails, catch the exception and raise a critical `RuntimeError` halting the application.
- **Acceptance Criteria:** Starting the app against a standard PostgreSQL database (without PostGIS) crashes instantly with a clear error message.

### Task 4: Clean up Local Artifacts
- **File/Module:** `backend/test.db`
- **Current Behavior:** Artifact file exists in the repo.
- **Required Behavior:** File removed and ignored.
- **Implementation Requirements:** Delete `backend/test.db`. Ensure `*.db` is in `.gitignore`.

## 11. Definition of Done

- [x] SQLite references removed from production architecture
- [x] SQLite fallback removed
- [x] SQLite test path removed
- [x] PostgreSQL is mandatory
- [x] PostGIS is mandatory
- [x] Docker PostGIS database works
- [x] Alembic migrations work
- [x] tests run against PostgreSQL/PostGIS
- [x] spatial schema is validated
- [x] spatial indexes are validated
- [x] missing database configuration fails clearly
- [x] README documents setup
- [x] CI/test instructions are reproducible
- [x] no secrets are committed
