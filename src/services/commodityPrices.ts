import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      const { data, error } = await supabase.functions.invoke('get-commodity-prices');
      
      if (error) {
        throw new Error('Failed to fetch commodity prices');
      }

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