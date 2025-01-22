import { Card } from "@/components/ui/dashboard/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function FinancialDashboard() {
  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_records')
        .select('*')
        .order('record_date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const chartData = financialData?.reduce((acc: any[], record) => {
    const month = format(new Date(record.record_date), 'MMM');
    const existingMonth = acc.find(item => item.month === month);
    
    if (existingMonth) {
      existingMonth[record.type] = (existingMonth[record.type] || 0) + record.amount;
    } else {
      acc.push({
        month,
        [record.type]: record.amount,
      });
    }
    
    return acc;
  }, []) || [];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card title="Income vs Expenses" description="Monthly financial overview">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value}`} />
            <Bar dataKey="income" fill="#2D5A27" name="Income" />
            <Bar dataKey="expense" fill="#8BA888" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}