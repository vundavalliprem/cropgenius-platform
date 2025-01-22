import { Card } from "@/components/ui/dashboard/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export function FinancialDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial-records', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('financial_records')
        .select('*')
        .order('record_date', { ascending: true });
      
      if (selectedCategory !== "all") {
        query = query.eq('category', selectedCategory);
      }
      
      const { data, error } = await query;
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

  const categories = ["all", "seeds", "fertilizer", "equipment", "labor", "sales", "other"];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card title="Income vs Expenses" description="Monthly financial overview">
      <div className="space-y-4">
        <div className="w-48">
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

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
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