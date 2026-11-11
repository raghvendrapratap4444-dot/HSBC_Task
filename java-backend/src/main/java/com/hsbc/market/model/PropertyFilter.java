package com.hsbc.market.model;

public record PropertyFilter(
        Double minPrice,
        Double maxPrice,
        Double minBedrooms,
        Double maxBedrooms,
        Double minSquareFootage,
        Double maxSquareFootage,
        Double minSchoolRating,
        Integer minYearBuilt,
        Integer maxYearBuilt,
        String sortBy,
        String sortDir
) {
}
