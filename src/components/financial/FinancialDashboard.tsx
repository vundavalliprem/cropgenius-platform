import { Card } from "@/components/ui/dashboard/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

export function FinancialDashboard() {
  const mockData = useMemo(() => [
    { month: "Jan", income: 4000, expenses: 2400 },
    { month: "Feb", income: 3000, expenses: 1398 },
    { month: "Mar", income: 2000, expenses: 9800 },
    { month: "Apr", income: 2780, expenses: 3908 },
    { month: "May", income: 1890, expenses: 4800 },
    { month: "Jun", income: 2390, expenses: 3800 },
  ], []);

  return (
    <Card title="Income vs Expenses" description="Monthly financial overview">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="income" fill="#2D5A27" name="Income" />
            <Bar dataKey="expenses" fill="#8BA888" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}