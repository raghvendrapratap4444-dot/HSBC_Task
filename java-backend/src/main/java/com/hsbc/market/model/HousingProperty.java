package com.hsbc.market.model;

public record HousingProperty(
        int id,
        double squareFootage,
        double bedrooms,
        double bathrooms,
        int yearBuilt,
        double lotSize,
        double distanceToCityCenter,
        double schoolRating,
        double price
) {
}
