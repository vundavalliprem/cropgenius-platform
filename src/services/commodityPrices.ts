import { useQuery } from "@tanstack/react-query";

const API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
const BASE_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

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
    }
  });
};