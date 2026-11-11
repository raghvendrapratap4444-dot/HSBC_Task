package com.hsbc.market.model;

import java.util.List;

public record WhatIfResponse(
        double baselinePrice,
        List<ScenarioResult> scenarios
) {
    public record ScenarioResult(String name, double predictedPrice, double deltaFromBaseline) {
    }
}
