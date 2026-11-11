from typing import List, Optional, Union

from pydantic import BaseModel, Field


FEATURE_NAMES = [
    "square_footage",
    "bedrooms",
    "bathrooms",
    "year_built",
    "lot_size",
    "distance_to_city_center",
    "school_rating",
]


class HousingFeatures(BaseModel):
    square_footage: float = Field(..., gt=0, description="Living area in square feet")
    bedrooms: float = Field(..., ge=0, description="Number of bedrooms")
    bathrooms: float = Field(..., ge=0, description="Number of bathrooms")
    year_built: int = Field(..., ge=1800, le=2100, description="Year the property was built")
    lot_size: float = Field(..., gt=0, description="Lot size in square feet")
    distance_to_city_center: float = Field(
        ..., ge=0, description="Distance to city center in miles"
    )
    school_rating: float = Field(..., ge=0, le=10, description="School rating (0-10)")


class PredictionRequest(BaseModel):
    """Single property or a batch of properties."""

    features: Optional[HousingFeatures] = None
    batch: Optional[List[HousingFeatures]] = None

    def resolve(self) -> List[HousingFeatures]:
        if self.batch is not None and len(self.batch) > 0:
            return self.batch
        if self.features is not None:
            return [self.features]
        raise ValueError("Provide either 'features' (single) or 'batch' (list).")


class PredictionItem(BaseModel):
    index: int
    predicted_price: float
    features: HousingFeatures


class PredictionResponse(BaseModel):
    count: int
    predictions: List[PredictionItem]


class CoefficientInfo(BaseModel):
    feature: str
    coefficient: float


class ModelInfoResponse(BaseModel):
    model_type: str
    feature_names: List[str]
    intercept: float
    coefficients: List[CoefficientInfo]
    metrics: dict
    training_samples: int


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
