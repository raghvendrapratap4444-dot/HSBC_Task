package com.hsbc.market.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record WhatIfRequest(
        @NotNull @Positive Double squareFootage,
        @NotNull @Min(0) @Max(20) Double bedrooms,
        @NotNull @Min(0) @Max(20) Double bathrooms,
        @NotNull @Min(1800) @Max(2100) Integer yearBuilt,
        @NotNull @Positive Double lotSize,
        @NotNull @Min(0) Double distanceToCityCenter,
        @NotNull @Min(0) @Max(10) Double schoolRating,
        Double squareFootageDelta,
        Double schoolRatingDelta,
        Double distanceDelta
) {
}
