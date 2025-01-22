import { Card } from "@/components/ui/dashboard/Card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ["#2D5A27", "#557751", "#8BA888", "#C5D9C3", "#E8F1E7", "#F5F9F4"];

interface BudgetPlannerProps {
  className?: string;
}

export function BudgetPlanner({ className }: BudgetPlannerProps) {
  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses-by-category'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_records')
        .select('*')
        .eq('type', 'expense');
      
      if (error) throw error;

      const categoryTotals = data.reduce((acc: Record<string, number>, record) => {
        acc[record.category] = (acc[record.category] || 0) + record.amount;
        return acc;
      }, {});

      return Object.entries(categoryTotals).map(([name, value]) => ({
        name,
        value,
      }));
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card
      title="Budget Allocation"
      description="Expense distribution by category"
      className={className}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenses}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {expenses?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => ["$" + value.toLocaleString(), "Budget"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-primary-600">Budget Summary</h3>
          {expenses?.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between p-3 bg-primary-100 rounded-md">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-medium capitalize">{item.name}</span>
              </div>
              <span className="text-primary-600">${item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}