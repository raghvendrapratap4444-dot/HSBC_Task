from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .model import housing_model
from .schemas import (
    HealthResponse,
    HousingFeatures,
    ModelInfoResponse,
    PredictionItem,
    PredictionRequest,
    PredictionResponse,
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    housing_model.load()
    yield


app = FastAPI(
    title="Housing Price Prediction API",
    description="Linear regression model for predicting housing prices.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health() -> HealthResponse:
    return HealthResponse(status="ok", model_loaded=housing_model.is_loaded)


@app.get("/model-info", response_model=ModelInfoResponse, tags=["Model"])
def model_info() -> ModelInfoResponse:
    if not housing_model.is_loaded:
        raise HTTPException(status_code=503, detail="Model is not loaded.")
    return ModelInfoResponse(**housing_model.get_info())


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
def predict(payload: PredictionRequest) -> PredictionResponse:
    try:
        items = payload.resolve()
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    if not housing_model.is_loaded:
        raise HTTPException(status_code=503, detail="Model is not loaded.")

    prices = housing_model.predict(items)
    predictions = [
        PredictionItem(index=i, predicted_price=price, features=feat)
        for i, (feat, price) in enumerate(zip(items, prices))
    ]
    return PredictionResponse(count=len(predictions), predictions=predictions)


@app.post("/predict/single", response_model=PredictionResponse, tags=["Prediction"])
def predict_single(features: HousingFeatures) -> PredictionResponse:
    return predict(PredictionRequest(features=features))


@app.post("/predict/batch", response_model=PredictionResponse, tags=["Prediction"])
def predict_batch(batch: list[HousingFeatures]) -> PredictionResponse:
    if not batch:
        raise HTTPException(status_code=422, detail="Batch cannot be empty.")
    return predict(PredictionRequest(batch=batch))
