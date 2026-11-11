package com.hsbc.market.controller;

import com.hsbc.market.model.HousingProperty;
import com.hsbc.market.model.MarketStats;
import com.hsbc.market.model.PropertyFilter;
import com.hsbc.market.model.WhatIfRequest;
import com.hsbc.market.model.WhatIfResponse;
import com.hsbc.market.service.ExportService;
import com.hsbc.market.service.MarketAnalysisService;
import com.hsbc.market.service.MlClientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MarketController {

    private final MarketAnalysisService marketAnalysisService;
    private final ExportService exportService;
    private final MlClientService mlClientService;

    public MarketController(
            MarketAnalysisService marketAnalysisService,
            ExportService exportService,
            MlClientService mlClientService) {
        this.marketAnalysisService = marketAnalysisService;
        this.exportService = exportService;
        this.mlClientService = mlClientService;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        boolean mlOk = mlClientService.isHealthy();
        return Map.of(
                "status", mlOk ? "ok" : "degraded",
                "mlApi", mlOk
        );
    }

    @GetMapping("/stats")
    public MarketStats stats() {
        return marketAnalysisService.getMarketStats();
    }

    @GetMapping("/properties")
    public List<HousingProperty> properties(
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minBedrooms,
            @RequestParam(required = false) Double maxBedrooms,
            @RequestParam(required = false) Double minSquareFootage,
            @RequestParam(required = false) Double maxSquareFootage,
            @RequestParam(required = false) Double minSchoolRating,
            @RequestParam(required = false) Integer minYearBuilt,
            @RequestParam(required = false) Integer maxYearBuilt,
            @RequestParam(required = false, defaultValue = "price") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {

        PropertyFilter filter = new PropertyFilter(
                minPrice, maxPrice, minBedrooms, maxBedrooms,
                minSquareFootage, maxSquareFootage, minSchoolRating,
                minYearBuilt, maxYearBuilt, sortBy, sortDir);
        return marketAnalysisService.filterProperties(filter);
    }

    @GetMapping("/segment-stats")
    public MarketStats segmentStats(
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minBedrooms,
            @RequestParam(required = false) Double maxBedrooms,
            @RequestParam(required = false) Double minSquareFootage,
            @RequestParam(required = false) Double maxSquareFootage,
            @RequestParam(required = false) Double minSchoolRating,
            @RequestParam(required = false) Integer minYearBuilt,
            @RequestParam(required = false) Integer maxYearBuilt) {

        PropertyFilter filter = new PropertyFilter(
                minPrice, maxPrice, minBedrooms, maxBedrooms,
                minSquareFootage, maxSquareFootage, minSchoolRating,
                minYearBuilt, maxYearBuilt, "price", "asc");
        return marketAnalysisService.getSegmentStats(filter);
    }

    @PostMapping("/what-if")
    public WhatIfResponse whatIf(@Valid @RequestBody WhatIfRequest request) {
        return marketAnalysisService.whatIf(request);
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minBedrooms,
            @RequestParam(required = false) Double maxBedrooms,
            @RequestParam(required = false) Double minSquareFootage,
            @RequestParam(required = false) Double maxSquareFootage,
            @RequestParam(required = false) Double minSchoolRating,
            @RequestParam(required = false) Integer minYearBuilt,
            @RequestParam(required = false) Integer maxYearBuilt,
            @RequestParam(required = false, defaultValue = "price") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) throws Exception {

        PropertyFilter filter = new PropertyFilter(
                minPrice, maxPrice, minBedrooms, maxBedrooms,
                minSquareFootage, maxSquareFootage, minSchoolRating,
                minYearBuilt, maxYearBuilt, sortBy, sortDir);
        List<HousingProperty> properties = marketAnalysisService.filterProperties(filter);
        byte[] csv = exportService.exportCsv(properties);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=market-export.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minBedrooms,
            @RequestParam(required = false) Double maxBedrooms,
            @RequestParam(required = false) Double minSquareFootage,
            @RequestParam(required = false) Double maxSquareFootage,
            @RequestParam(required = false) Double minSchoolRating,
            @RequestParam(required = false) Integer minYearBuilt,
            @RequestParam(required = false) Integer maxYearBuilt) throws Exception {

        PropertyFilter filter = new PropertyFilter(
                minPrice, maxPrice, minBedrooms, maxBedrooms,
                minSquareFootage, maxSquareFootage, minSchoolRating,
                minYearBuilt, maxYearBuilt, "price", "asc");
        List<HousingProperty> properties = marketAnalysisService.filterProperties(filter);
        MarketStats stats = marketAnalysisService.getSegmentStats(filter);
        byte[] pdf = exportService.exportPdf(properties, stats);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=market-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
