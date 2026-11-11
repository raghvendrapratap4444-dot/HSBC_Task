from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from pydantic import BaseModel, Field


class PropertyInput(BaseModel):
    square_footage: float = Field(..., gt=200, lt=20000)
    bedrooms: float = Field(..., ge=0, le=20)
    bathrooms: float = Field(..., ge=0, le=20)
    year_built: int = Field(..., ge=1800, le=2100)
    lot_size: float = Field(..., gt=500, lt=500000)
    distance_to_city_center: float = Field(..., ge=0, le=100)
    school_rating: float = Field(..., ge=0, le=10)
    label: Optional[str] = Field(default=None, max_length=80)


class EstimateRecord(BaseModel):
    id: str
    created_at: datetime
    label: Optional[str]
    features: PropertyInput
    predicted_price: float


class EstimateResponse(BaseModel):
    estimate: EstimateRecord
    history: List[EstimateRecord]


class CompareRequest(BaseModel):
    properties: List[PropertyInput] = Field(..., min_length=2, max_length=6)


class CompareItem(BaseModel):
    label: str
    features: PropertyInput
    predicted_price: float


class CompareResponse(BaseModel):
    items: List[CompareItem]
    highest: CompareItem
    lowest: CompareItem
    average_price: float


def new_id() -> str:
    return str(uuid4())
