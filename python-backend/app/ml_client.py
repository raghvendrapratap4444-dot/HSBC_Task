import os
from typing import Any

import httpx

ML_API_URL = os.getenv("ML_API_URL", "http://localhost:8000")


class MLClientError(Exception):
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


async def predict_prices(features_list: list[dict[str, Any]]) -> list[float]:
    payload = {"batch": features_list} if len(features_list) > 1 else {"features": features_list[0]}
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(f"{ML_API_URL}/predict", json=payload)
        except httpx.RequestError as exc:
            raise MLClientError(f"Unable to reach ML API: {exc}") from exc

    if response.status_code >= 400:
        detail = response.text
        raise MLClientError(f"ML API error: {detail}", status_code=response.status_code)

    data = response.json()
    return [item["predicted_price"] for item in data["predictions"]]


async def health_check() -> bool:
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            response = await client.get(f"{ML_API_URL}/health")
            return response.status_code == 200 and response.json().get("status") == "ok"
        except httpx.RequestError:
            return False
