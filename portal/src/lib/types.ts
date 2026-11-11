export type PropertyFeatures = {
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  lot_size: number;
  distance_to_city_center: number;
  school_rating: number;
  label?: string;
};

export type EstimateRecord = {
  id: string;
  created_at: string;
  label: string | null;
  features: PropertyFeatures;
  predicted_price: number;
};

export type CompareResponse = {
  items: Array<{
    label: string;
    features: PropertyFeatures;
    predicted_price: number;
  }>;
  highest: { label: string; predicted_price: number };
  lowest: { label: string; predicted_price: number };
  average_price: number;
};

export type HousingProperty = {
  id: number;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  lotSize: number;
  distanceToCityCenter: number;
  schoolRating: number;
  price: number;
};

export type MarketStats = {
  totalProperties: number;
  avgPrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  avgSquareFootage: number;
  avgSchoolRating: number;
  avgBedrooms: number;
  avgPriceByBedrooms: Record<string, number>;
  avgPriceByYearDecade: Record<string, number>;
  priceDistribution: Array<{ range: string; count: number }>;
};

export type WhatIfResponse = {
  baselinePrice: number;
  scenarios: Array<{
    name: string;
    predictedPrice: number;
    deltaFromBaseline: number;
  }>;
};

export type PropertyFilterParams = {
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minSquareFootage?: number;
  maxSquareFootage?: number;
  minSchoolRating?: number;
  minYearBuilt?: number;
  maxYearBuilt?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};
