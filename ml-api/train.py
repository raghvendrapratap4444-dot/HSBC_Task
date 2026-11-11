"""Train the housing price model and persist artifacts."""

from app.model import housing_model


def main() -> None:
    metrics = housing_model.train()
    housing_model.save()
    print("Training complete.")
    for key, value in metrics.items():
        print(f"  {key}: {value}")


if __name__ == "__main__":
    main()
