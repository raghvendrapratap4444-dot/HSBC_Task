package com.hsbc.market.service;

import com.hsbc.market.model.HousingProperty;
import com.hsbc.market.model.MarketStats;
import com.hsbc.market.model.PropertyFilter;
import com.hsbc.market.model.WhatIfRequest;
import com.hsbc.market.model.WhatIfResponse;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MarketAnalysisService {

    private final HousingDataService housingDataService;
    private final MlClientService mlClientService;

    public MarketAnalysisService(HousingDataService housingDataService, MlClientService mlClientService) {
        this.housingDataService = housingDataService;
        this.mlClientService = mlClientService;
    }

    @Cacheable("marketStats")
    public MarketStats getMarketStats() {
        return computeStats(housingDataService.findAll());
    }

    @Cacheable(value = "filteredProperties", key = "#filter.toString()")
    public List<HousingProperty> filterProperties(PropertyFilter filter) {
        return housingDataService.findAll().stream()
                .filter(p -> filter.minPrice() == null || p.price() >= filter.minPrice())
                .filter(p -> filter.maxPrice() == null || p.price() <= filter.maxPrice())
                .filter(p -> filter.minBedrooms() == null || p.bedrooms() >= filter.minBedrooms())
                .filter(p -> filter.maxBedrooms() == null || p.bedrooms() <= filter.maxBedrooms())
                .filter(p -> filter.minSquareFootage() == null || p.squareFootage() >= filter.minSquareFootage())
                .filter(p -> filter.maxSquareFootage() == null || p.squareFootage() <= filter.maxSquareFootage())
                .filter(p -> filter.minSchoolRating() == null || p.schoolRating() >= filter.minSchoolRating())
                .filter(p -> filter.minYearBuilt() == null || p.yearBuilt() >= filter.minYearBuilt())
                .filter(p -> filter.maxYearBuilt() == null || p.yearBuilt() <= filter.maxYearBuilt())
                .sorted(buildComparator(filter.sortBy(), filter.sortDir()))
                .toList();
    }

    @Cacheable(value = "segmentStats", key = "#filter.toString()")
    public MarketStats getSegmentStats(PropertyFilter filter) {
        return computeStats(filterProperties(filter));
    }

    public WhatIfResponse whatIf(WhatIfRequest request) {
        Map<String, Object> baselineFeatures = MlClientService.toFeatureMap(
                request.squareFootage(),
                request.bedrooms(),
                request.bathrooms(),
                request.yearBuilt(),
                request.lotSize(),
                request.distanceToCityCenter(),
                request.schoolRating()
        );

        double baseline = mlClientService.predict(baselineFeatures);
        List<WhatIfResponse.ScenarioResult> scenarios = new ArrayList<>();
        scenarios.add(new WhatIfResponse.ScenarioResult("Baseline", baseline, 0));

        double sqDelta = request.squareFootageDelta() != null ? request.squareFootageDelta() : 200;
        double schoolDelta = request.schoolRatingDelta() != null ? request.schoolRatingDelta() : 0.5;
        double distDelta = request.distanceDelta() != null ? request.distanceDelta() : 1.0;

        List<Map<String, Object>> batch = List.of(
                MlClientService.toFeatureMap(
                        request.squareFootage() + sqDelta,
                        request.bedrooms(),
                        request.bathrooms(),
                        request.yearBuilt(),
                        request.lotSize(),
                        request.distanceToCityCenter(),
                        request.schoolRating()),
                MlClientService.toFeatureMap(
                        request.squareFootage(),
                        request.bedrooms(),
                        request.bathrooms(),
                        request.yearBuilt(),
                        request.lotSize(),
                        request.distanceToCityCenter(),
                        Math.min(10, request.schoolRating() + schoolDelta)),
                MlClientService.toFeatureMap(
                        request.squareFootage(),
                        request.bedrooms(),
                        request.bathrooms(),
                        request.yearBuilt(),
                        request.lotSize(),
                        Math.max(0, request.distanceToCityCenter() - distDelta),
                        request.schoolRating())
        );

        List<Double> prices = mlClientService.predictBatch(batch);
        scenarios.add(new WhatIfResponse.ScenarioResult(
                "Larger home (+" + (int) sqDelta + " sqft)", prices.get(0), prices.get(0) - baseline));
        scenarios.add(new WhatIfResponse.ScenarioResult(
                "Better schools (+" + schoolDelta + ")", prices.get(1), prices.get(1) - baseline));
        scenarios.add(new WhatIfResponse.ScenarioResult(
                "Closer to city (-" + distDelta + " mi)", prices.get(2), prices.get(2) - baseline));

        return new WhatIfResponse(baseline, scenarios);
    }

    private MarketStats computeStats(List<HousingProperty> properties) {
        if (properties.isEmpty()) {
            return new MarketStats(0, 0, 0, 0, 0, 0, 0, 0, Map.of(), Map.of(), List.of());
        }

        List<Double> prices = properties.stream().map(HousingProperty::price).sorted().toList();
        double avgPrice = prices.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        double median = prices.size() % 2 == 0
                ? (prices.get(prices.size() / 2 - 1) + prices.get(prices.size() / 2)) / 2.0
                : prices.get(prices.size() / 2);

        Map<String, Double> byBedrooms = properties.stream()
                .collect(Collectors.groupingBy(
                        p -> String.valueOf((int) p.bedrooms()),
                        Collectors.averagingDouble(HousingProperty::price)));

        Map<String, Double> byDecade = properties.stream()
                .collect(Collectors.groupingBy(
                        p -> (p.yearBuilt() / 10 * 10) + "s",
                        Collectors.averagingDouble(HousingProperty::price)));

        Map<String, Double> sortedDecades = byDecade.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                        (a, b) -> a, LinkedHashMap::new));

        List<MarketStats.PriceBucket> buckets = List.of(
                bucket(properties, 0, 200000, "< $200k"),
                bucket(properties, 200000, 300000, "$200k–$300k"),
                bucket(properties, 300000, 400000, "$300k–$400k"),
                bucket(properties, 400000, Double.MAX_VALUE, "$400k+")
        );

        return new MarketStats(
                properties.size(),
                round(avgPrice),
                round(median),
                prices.get(0),
                prices.get(prices.size() - 1),
                round(properties.stream().mapToDouble(HousingProperty::squareFootage).average().orElse(0)),
                round(properties.stream().mapToDouble(HousingProperty::schoolRating).average().orElse(0)),
                round(properties.stream().mapToDouble(HousingProperty::bedrooms).average().orElse(0)),
                byBedrooms.entrySet().stream()
                        .sorted(Map.Entry.comparingByKey())
                        .collect(Collectors.toMap(Map.Entry::getKey, e -> round(e.getValue()),
                                (a, b) -> a, LinkedHashMap::new)),
                sortedDecades.entrySet().stream()
                        .collect(Collectors.toMap(Map.Entry::getKey, e -> round(e.getValue()),
                                (a, b) -> a, LinkedHashMap::new)),
                buckets
        );
    }

    private MarketStats.PriceBucket bucket(List<HousingProperty> properties, double min, double max, String label) {
        long count = properties.stream().filter(p -> p.price() >= min && p.price() < max).count();
        return new MarketStats.PriceBucket(label, count);
    }

    private Comparator<HousingProperty> buildComparator(String sortBy, String sortDir) {
        String field = sortBy == null ? "price" : sortBy;
        boolean asc = !"desc".equalsIgnoreCase(sortDir);
        Comparator<HousingProperty> comparator = switch (field) {
            case "squareFootage", "square_footage" -> Comparator.comparingDouble(HousingProperty::squareFootage);
            case "bedrooms" -> Comparator.comparingDouble(HousingProperty::bedrooms);
            case "yearBuilt", "year_built" -> Comparator.comparingInt(HousingProperty::yearBuilt);
            case "schoolRating", "school_rating" -> Comparator.comparingDouble(HousingProperty::schoolRating);
            case "lotSize", "lot_size" -> Comparator.comparingDouble(HousingProperty::lotSize);
            default -> Comparator.comparingDouble(HousingProperty::price);
        };
        return asc ? comparator : comparator.reversed();
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
