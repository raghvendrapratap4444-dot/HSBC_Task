package com.hsbc.market.service;

import com.hsbc.market.model.HousingProperty;
import com.hsbc.market.model.MarketStats;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class ExportService {

    public byte[] exportCsv(List<HousingProperty> properties) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVPrinter printer = new CSVPrinter(
                new OutputStreamWriter(out, StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.builder()
                        .setHeader("id", "square_footage", "bedrooms", "bathrooms", "year_built",
                                "lot_size", "distance_to_city_center", "school_rating", "price")
                        .build())) {
            for (HousingProperty p : properties) {
                printer.printRecord(
                        p.id(), p.squareFootage(), p.bedrooms(), p.bathrooms(), p.yearBuilt(),
                        p.lotSize(), p.distanceToCityCenter(), p.schoolRating(), p.price());
            }
        }
        return out.toByteArray();
    }

    public byte[] exportPdf(List<HousingProperty> properties, MarketStats stats) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9);

        document.add(new Paragraph("Property Market Analysis Report", titleFont));
        document.add(new Paragraph(" "));
        document.add(new Paragraph(
                String.format("Properties: %d | Avg Price: $%,.0f | Median: $%,.0f | Range: $%,.0f – $%,.0f",
                        stats.totalProperties(), stats.avgPrice(), stats.medianPrice(),
                        stats.minPrice(), stats.maxPrice()),
                bodyFont));
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        addHeader(table, "ID", headerFont);
        addHeader(table, "Sq Ft", headerFont);
        addHeader(table, "Beds", headerFont);
        addHeader(table, "Year", headerFont);
        addHeader(table, "Price", headerFont);

        for (HousingProperty p : properties) {
            table.addCell(new Phrase(String.valueOf(p.id()), bodyFont));
            table.addCell(new Phrase(String.valueOf((int) p.squareFootage()), bodyFont));
            table.addCell(new Phrase(String.valueOf(p.bedrooms()), bodyFont));
            table.addCell(new Phrase(String.valueOf(p.yearBuilt()), bodyFont));
            table.addCell(new Phrase(String.format("$%,.0f", p.price()), bodyFont));
        }

        document.add(table);
        document.close();
        return out.toByteArray();
    }

    private void addHeader(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(new Color(230, 230, 230));
        table.addCell(cell);
    }
}
