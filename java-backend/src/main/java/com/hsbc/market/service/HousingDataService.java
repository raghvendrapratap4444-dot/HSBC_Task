package com.hsbc.market.service;

import com.hsbc.market.model.HousingProperty;
import jakarta.annotation.PostConstruct;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class HousingDataService {

    private final ResourceLoader resourceLoader;
    private final String dataPath;
    private List<HousingProperty> properties = List.of();

    public HousingDataService(
            ResourceLoader resourceLoader,
            @Value("${housing.data.path}") String dataPath) {
        this.resourceLoader = resourceLoader;
        this.dataPath = dataPath;
    }

    @PostConstruct
    public void load() throws Exception {
        Resource resource = resourceLoader.getResource(dataPath);
        try (Reader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
             CSVParser parser = CSVFormat.DEFAULT.builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .build()
                     .parse(reader)) {

            List<HousingProperty> loaded = new ArrayList<>();
            for (CSVRecord record : parser) {
                loaded.add(new HousingProperty(
                        Integer.parseInt(record.get("id")),
                        Double.parseDouble(record.get("square_footage")),
                        Double.parseDouble(record.get("bedrooms")),
                        Double.parseDouble(record.get("bathrooms")),
                        Integer.parseInt(record.get("year_built")),
                        Double.parseDouble(record.get("lot_size")),
                        Double.parseDouble(record.get("distance_to_city_center")),
                        Double.parseDouble(record.get("school_rating")),
                        Double.parseDouble(record.get("price"))
                ));
            }
            properties = Collections.unmodifiableList(loaded);
        }
    }

    public List<HousingProperty> findAll() {
        return properties;
    }
}
