import { z } from "zod";

export const propertySchema = z.object({
  label: z.string().max(80).optional().or(z.literal("")),
  square_footage: z.coerce.number().min(200, "Min 200 sq ft").max(20000, "Max 20,000 sq ft"),
  bedrooms: z.coerce.number().min(0, "Cannot be negative").max(20, "Max 20 bedrooms"),
  bathrooms: z.coerce.number().min(0, "Cannot be negative").max(20, "Max 20 bathrooms"),
  year_built: z.coerce.number().int().min(1800, "Min year 1800").max(2100, "Max year 2100"),
  lot_size: z.coerce.number().min(500, "Min 500 sq ft").max(500000, "Max 500,000 sq ft"),
  distance_to_city_center: z.coerce.number().min(0, "Cannot be negative").max(100, "Max 100 miles"),
  school_rating: z.coerce.number().min(0, "Min 0").max(10, "Max 10"),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;

export const emptyPropertyForm: PropertyFormValues = {
  label: "",
  square_footage: 1550,
  bedrooms: 3,
  bathrooms: 2,
  year_built: 1997,
  lot_size: 6800,
  distance_to_city_center: 4.1,
  school_rating: 7.6,
};

export const FIELD_META: Array<{
  name: keyof PropertyFormValues;
  label: string;
  step?: string;
  type?: string;
}> = [
  { name: "label", label: "Label (optional)", type: "text" },
  { name: "square_footage", label: "Square Footage", step: "1" },
  { name: "bedrooms", label: "Bedrooms", step: "1" },
  { name: "bathrooms", label: "Bathrooms", step: "0.5" },
  { name: "year_built", label: "Year Built", step: "1" },
  { name: "lot_size", label: "Lot Size", step: "1" },
  { name: "distance_to_city_center", label: "Distance to City Center (mi)", step: "0.1" },
  { name: "school_rating", label: "School Rating (0–10)", step: "0.1" },
];
