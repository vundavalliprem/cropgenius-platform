
import { useQuery } from "@tanstack/react-query";

// Mock data to use instead of the CORS-blocked API
const mockCommodityPrices = [
  {
    commodity: "Rice",
    market: "Delhi",
    price: 42.50,
    unit: "kg",
    date: "2025-01-15"
  },
  {
    commodity: "Wheat",
    market: "Mumbai",
    price: 28.75,
    unit: "kg",
    date: "2025-01-15"
  },
  {
    commodity: "Potato",
    market: "Kolkata",
    price: 15.20,
    unit: "kg",
    date: "2025-01-15"
  },
  {
    commodity: "Onion",
    market: "Bangalore",
    price: 22.80,
    unit: "kg",
    date: "2025-01-16"
  },
  {
    commodity: "Tomato",
    market: "Chennai",
    price: 35.40,
    unit: "kg",
    date: "2025-01-16"
  },
  {
    commodity: "Cotton",
    market: "Ahmedabad",
    price: 125.30,
    unit: "quintal",
    date: "2025-01-14"
  },
  {
    commodity: "Soybean",
    market: "Indore",
    price: 60.75,
    unit: "kg",
    date: "2025-01-17"
  },
  {
    commodity: "Sugarcane",
    market: "Lucknow",
    price: 3.25,
    unit: "kg",
    date: "2025-01-17"
  },
  {
    commodity: "Maize",
    market: "Patna",
    price: 18.90,
    unit: "kg",
    date: "2025-01-16"
  }
];

interface CommodityPrice {
  commodity: string;
  market: string;
  price: number;
  unit: string;
  date: string;
}

export const useCommodityPrices = () => {
  return useQuery({
    queryKey: ['commodity-prices'],
    queryFn: async (): Promise<CommodityPrice[]> => {
      // Using mock data instead of making the API call that's being blocked by CORS
      return mockCommodityPrices;

      /* Original API call code that's causing CORS issues:
      const response = await fetch(`${BASE_URL}?api-key=${API_KEY}&format=json`);
      if (!response.ok) {
        throw new Error('Failed to fetch commodity prices');
      }
      const data = await response.json();
      return data.records.map((record: any) => ({
        commodity: record.commodity,
        market: record.market,
        price: parseFloat(record.modal_price),
        unit: record.unit,
        date: record.arrival_date
      }));
      */
    }
  });
};
