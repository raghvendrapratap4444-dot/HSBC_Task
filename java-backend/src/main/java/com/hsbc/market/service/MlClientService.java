package com.hsbc.market.service;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MlClientService {

    private final RestClient mlRestClient;

    public MlClientService(RestClient mlRestClient) {
        this.mlRestClient = mlRestClient;
    }

    public double predict(Map<String, Object> features) {
        Map<String, Object> body = Map.of("features", features);
        Map<String, Object> response = postPredict(body);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> predictions = (List<Map<String, Object>>) response.get("predictions");
        return ((Number) predictions.get(0).get("predicted_price")).doubleValue();
    }

    public List<Double> predictBatch(List<Map<String, Object>> featuresList) {
        Map<String, Object> body = Map.of("batch", featuresList);
        Map<String, Object> response = postPredict(body);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> predictions = (List<Map<String, Object>>) response.get("predictions");
        return predictions.stream()
                .map(p -> ((Number) p.get("predicted_price")).doubleValue())
                .toList();
    }

    public boolean isHealthy() {
        try {
            Map<String, Object> response = mlRestClient.get()
                    .uri("/health")
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
            return response != null && "ok".equals(response.get("status"));
        } catch (RestClientException ex) {
            return false;
        }
    }

    private Map<String, Object> postPredict(Map<String, Object> body) {
        try {
            Map<String, Object> response = mlRestClient.post()
                    .uri("/predict")
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
            if (response == null) {
                throw new IllegalStateException("Empty response from ML API");
            }
            return response;
        } catch (RestClientException ex) {
            throw new IllegalStateException("ML API request failed: " + ex.getMessage(), ex);
        }
    }

    public static Map<String, Object> toFeatureMap(
            double squareFootage,
            double bedrooms,
            double bathrooms,
            int yearBuilt,
            double lotSize,
            double distanceToCityCenter,
            double schoolRating) {
        Map<String, Object> map = new HashMap<>();
        map.put("square_footage", squareFootage);
        map.put("bedrooms", bedrooms);
        map.put("bathrooms", bathrooms);
        map.put("year_built", yearBuilt);
        map.put("lot_size", lotSize);
        map.put("distance_to_city_center", distanceToCityCenter);
        map.put("school_rating", schoolRating);
        return map;
    }
}
