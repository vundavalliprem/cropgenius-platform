import { Card } from "@/components/ui/dashboard/Card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["#2D5A27", "#557751", "#8BA888", "#C5D9C3"];

const mockData = [
  { name: "Seeds", value: 4000 },
  { name: "Fertilizer", value: 3000 },
  { name: "Equipment", value: 2000 },
  { name: "Labor", value: 2780 },
];

interface BudgetPlannerProps {
  className?: string;
}

export function BudgetPlanner({ className }: BudgetPlannerProps) {
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
                data={mockData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {mockData.map((entry, index) => (
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
          {mockData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between p-3 bg-primary-100 rounded-md">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-medium">{item.name}</span>
              </div>
              <span className="text-primary-600">${item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}