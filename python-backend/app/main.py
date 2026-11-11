from collections import deque
from datetime import datetime, timezone
from typing import Deque

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .ml_client import MLClientError, health_check, predict_prices
from .schemas import (
    CompareItem,
    CompareRequest,
    CompareResponse,
    EstimateRecord,
    EstimateResponse,
    PropertyInput,
    new_id,
)

HISTORY: Deque[EstimateRecord] = deque(maxlen=50)

app = FastAPI(
    title="Property Value Estimator API",
    description="Python backend for the Property Value Estimator portal app.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _feature_payload(item: PropertyInput) -> dict:
    return item.model_dump(exclude={"label"})


@app.get("/health")
async def health():
    ml_ok = await health_check()
    return {"status": "ok" if ml_ok else "degraded", "ml_api": ml_ok}


@app.get("/history", response_model=list[EstimateRecord])
def get_history():
    return list(HISTORY)


@app.delete("/history")
def clear_history():
    HISTORY.clear()
    return {"cleared": True}


@app.post("/estimate", response_model=EstimateResponse)
async def create_estimate(payload: PropertyInput):
    try:
        prices = await predict_prices([_feature_payload(payload)])
    except MLClientError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc

    record = EstimateRecord(
        id=new_id(),
        created_at=datetime.now(timezone.utc),
        label=payload.label or f"Property {len(HISTORY) + 1}",
        features=payload,
        predicted_price=prices[0],
    )
    HISTORY.appendleft(record)
    return EstimateResponse(estimate=record, history=list(HISTORY))


@app.post("/compare", response_model=CompareResponse)
async def compare_properties(payload: CompareRequest):
    try:
        prices = await predict_prices([_feature_payload(p) for p in payload.properties])
    except MLClientError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc

    items: list[CompareItem] = []
    for idx, (prop, price) in enumerate(zip(payload.properties, prices), start=1):
        items.append(
            CompareItem(
                label=prop.label or f"Property {idx}",
                features=prop,
                predicted_price=price,
            )
        )

    highest = max(items, key=lambda x: x.predicted_price)
    lowest = min(items, key=lambda x: x.predicted_price)
    average = sum(i.predicted_price for i in items) / len(items)

    return CompareResponse(
        items=items,
        highest=highest,
        lowest=lowest,
        average_price=round(average, 2),
    )
