package com.hsbc.market.model;

import java.util.List;
import java.util.Map;

public record MarketStats(
        int totalProperties,
        double avgPrice,
        double medianPrice,
        double minPrice,
        double maxPrice,
        double avgSquareFootage,
        double avgSchoolRating,
        double avgBedrooms,
        Map<String, Double> avgPriceByBedrooms,
        Map<String, Double> avgPriceByYearDecade,
        List<PriceBucket> priceDistribution
) {
    public record PriceBucket(String range, long count) {
    }
}
