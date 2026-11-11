# HSBC Interview Task — Housing Price Portal

Complete solution for:

1. **Task 1** — Housing Price Prediction Model API (FastAPI + scikit-learn + Docker)
2. **Task 2** — Multi-application Next.js portal with Python and Java backends

## Architecture

```
┌─────────────────┐
│  Next.js Portal │  :3000
│  /estimator     │
│  /market        │
└────────┬────────┘
         │
    ┌────┴─────┐
    ▼          ▼
Python BFF   Java API
:8001        :8080
    │          │
    └────┬─────┘
         ▼
   ML Predict API
      :8000
```

| Service | Tech | Port | Role |
|---------|------|------|------|
| `ml-api` | Python 3.12, FastAPI, scikit-learn | 8000 | Regression model (`/predict`, `/model-info`, `/health`) |
| `python-backend` | Python 3.12, FastAPI | 8001 | Property Value Estimator BFF |
| `java-backend` | Java 21, Spring Boot 3.4.4 | 8080 | Market analysis, caching, CSV/PDF export |
| `portal` | Next.js 15 App Router + Tailwind | 3000 | Unified UI |

## Quick start (Docker)

```bash
docker compose up --build
```

Then open:

- Portal: http://localhost:3000
- ML Swagger: http://localhost:8000/docs
- Python API docs: http://localhost:8001/docs
- Java API: http://localhost:8080/api/stats

## Local development

### 1. ML API

```bash
cd ml-api
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
python train.py
uvicorn app.main:app --reload --port 8000
```

### 2. Python backend

```bash
cd python-backend
python -m venv .venv
pip install -r requirements.txt
set ML_API_URL=http://localhost:8000
uvicorn app.main:app --reload --port 8001
```

### 3. Java backend

```bash
cd java-backend
# requires JDK 21 + Maven
mvn spring-boot:run
```

### 4. Next.js portal

```bash
cd portal
npm install
npm run dev
```

## Task 1 endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/model-info` | Coefficients + R² / MAE / RMSE |
| `POST` | `/predict` | Single (`features`) or batch (`batch`) |
| `POST` | `/predict/single` | Convenience single predict |
| `POST` | `/predict/batch` | Convenience batch predict |

Example single prediction:

```json
{
  "features": {
    "square_footage": 1550,
    "bedrooms": 3,
    "bathrooms": 2,
    "year_built": 1997,
    "lot_size": 6800,
    "distance_to_city_center": 4.1,
    "school_rating": 7.6
  }
}
```

## Task 2 features

### App 1 — Property Value Estimator (`/estimator`)

- Validated property form (all model fields)
- Prediction table + history chart
- Estimate history (persisted in Python BFF memory)
- Side-by-side comparison

### App 2 — Property Market Analysis (`/market`)

- Aggregate market dashboard
- Segment filters
- Sortable/filterable data table
- What-if analysis via ML model
- CSV and PDF export
- Caffeine caching on Java stats/filter endpoints

## Dataset

Training data lives in:

- `ml-api/data/housing.csv`
- `java-backend/src/main/resources/housing.csv`
