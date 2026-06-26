# ClimateTwin India — Python FastAPI Backend

This directory contains the Python FastAPI backend, which is a complete, drop-in replacement for the original Node.js Express API server. It preserves 100% of the endpoint routing, request/response formats, database models, and logic.

## Prerequisites

- **Python** v3.9 or later (recommended)
- **PostgreSQL** (running locally or via a cloud instance)

## Setup & Installation

### 1. Create a Python Virtual Environment
Navigate to the root directory and run:

```bash
python3 -m venv backend/.venv
```

### 2. Activate the Virtual Environment and Install Dependencies
Activate the virtual environment:

- **macOS/Linux**:
  ```bash
  source backend/.venv/bin/activate
  ```
- **Windows**:
  ```bash
  backend\.venv\Scripts\activate
  ```

Then install the required dependencies:

```bash
pip install -r backend/requirements.txt
```

### 3. Configuration
The backend automatically reads configuration parameters from the parent `.env` file at the project root directory. Ensure that at minimum `DATABASE_URL` is set:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/climatetwin
PORT=8080
HOST=0.0.0.0
```

*Note: The database URL is automatically parsed and mapped to use the asynchronous `asyncpg` driver (`postgresql+asyncpg://...`), so you can keep the same format as the Node.js project.*

## Running the Backend

Start the FastAPI development server:

```bash
PYTHONPATH=backend backend/.venv/bin/python backend/app/main.py
```

The server will start on port `8080` (or the port specified by `$PORT`) with auto-reload enabled. You can access the auto-generated Swagger API documentation at `http://localhost:8080/docs`.

## Project Structure

```text
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/        # FastAPI endpoints corresponding to Express routes
│   │   └── api.py            # APIRouter grouping all endpoint routers
│   ├── core/
│   │   └── config.py         # Configuration settings & environment loading
│   ├── database/
│   │   ├── base.py           # SQLAlchemy declarative base
│   │   └── session.py        # Database sessions & engine initialization
│   ├── models/
│   │   └── base.py           # SQLAlchemy database models mapped to PostgreSQL tables
│   ├── schemas/              # Pydantic validation & serialization models
│   └── main.py               # FastAPI entry point & middleware (CORS, logs)
├── .env.example
├── README.md
├── requirements.txt
└── verify_endpoints.py       # Verification script to test backend endpoints
```
