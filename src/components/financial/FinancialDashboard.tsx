import { Card } from "@/components/ui/dashboard/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, endOfMonth } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function FinancialDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const { toast } = useToast();

  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial-records', selectedCategory, selectedMonth],
    queryFn: async () => {
      let query = supabase
        .from('financial_records')
        .select('*')
        .order('record_date', { ascending: true });
      
      if (selectedCategory !== "all") {
        query = query.eq('category', selectedCategory);
      }

      if (selectedMonth) {
        const startDate = `${selectedMonth}-01`;
        const endDate = format(endOfMonth(new Date(startDate)), 'yyyy-MM-dd');
        query = query.gte('record_date', startDate).lte('record_date', endDate);
      }
      
      const { data, error } = await query;
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch financial records",
          variant: "destructive",
        });
        throw error;
      }
      
      return data;
    }
  });

  const chartData = financialData?.reduce((acc: any[], record) => {
    const date = format(new Date(record.record_date), 'MMM dd');
    const existingDate = acc.find(item => item.date === date);
    
    if (existingDate) {
      existingDate[record.type] = (existingDate[record.type] || 0) + record.amount;
    } else {
      acc.push({
        date,
        [record.type]: record.amount,
      });
    }
    
    return acc;
  }, []) || [];

  const categories = ["all", "seeds", "fertilizer", "equipment", "labor", "sales", "subsidies", "other"];
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(new Date().getFullYear(), i, 1);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy')
    };
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card title="Income vs Expenses" description="Monthly financial overview">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-primary-600">Filter by Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-primary-600">Filter by Month</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                label={{ value: "Date", position: "bottom", offset: -5 }}
              />
              <YAxis 
                label={{ value: "Amount (₹)", angle: -90, position: "left" }}
              />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend />
              <Bar dataKey="income" fill="#2D5A27" name="Income" />
              <Bar dataKey="expense" fill="#8BA888" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}