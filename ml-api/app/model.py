from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

from .schemas import FEATURE_NAMES, HousingFeatures

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "housing.csv"
ARTIFACT_DIR = BASE_DIR / "artifacts"
MODEL_PATH = ARTIFACT_DIR / "model.joblib"
METRICS_PATH = ARTIFACT_DIR / "metrics.json"


class HousingPriceModel:
    def __init__(self) -> None:
        self.model: LinearRegression | None = None
        self.metrics: dict[str, Any] = {}
        self.training_samples: int = 0

    @property
    def is_loaded(self) -> bool:
        return self.model is not None

    def train(self, data_path: Path | None = None) -> dict[str, Any]:
        path = data_path or DATA_PATH
        df = pd.read_csv(path)
        X = df[FEATURE_NAMES]
        y = df["price"]
        self.training_samples = len(df)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        model = LinearRegression()
        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)
        self.metrics = {
            "r2_score": float(r2_score(y_test, y_pred)),
            "mae": float(mean_absolute_error(y_test, y_pred)),
            "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
            "train_size": int(len(X_train)),
            "test_size": int(len(X_test)),
        }
        self.model = model
        return self.metrics

    def save(self) -> None:
        if self.model is None:
            raise RuntimeError("Model has not been trained.")
        ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
        joblib.dump(
            {
                "model": self.model,
                "metrics": self.metrics,
                "training_samples": self.training_samples,
                "feature_names": FEATURE_NAMES,
            },
            MODEL_PATH,
        )
        METRICS_PATH.write_text(json.dumps(self.metrics, indent=2))

    def load(self) -> None:
        if not MODEL_PATH.exists():
            self.train()
            self.save()
            return
        artifact = joblib.load(MODEL_PATH)
        self.model = artifact["model"]
        self.metrics = artifact.get("metrics", {})
        self.training_samples = artifact.get("training_samples", 0)

    def predict(self, features: list[HousingFeatures]) -> list[float]:
        if self.model is None:
            raise RuntimeError("Model is not loaded.")
        rows = [[getattr(item, name) for name in FEATURE_NAMES] for item in features]
        preds = self.model.predict(np.array(rows, dtype=float))
        return [float(round(p, 2)) for p in preds]

    def get_info(self) -> dict[str, Any]:
        if self.model is None:
            raise RuntimeError("Model is not loaded.")
        return {
            "model_type": type(self.model).__name__,
            "feature_names": FEATURE_NAMES,
            "intercept": float(self.model.intercept_),
            "coefficients": [
                {"feature": name, "coefficient": float(coef)}
                for name, coef in zip(FEATURE_NAMES, self.model.coef_)
            ],
            "metrics": self.metrics,
            "training_samples": self.training_samples,
        }


housing_model = HousingPriceModel()
