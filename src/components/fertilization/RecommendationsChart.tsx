import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const mockData = [
  { name: "Nitrogen", value: 35 },
  { name: "Phosphorus", value: 25 },
  { name: "Potassium", value: 40 },
];

const COLORS = ["#2D5A27", "#557751", "#8BA888"];

export function RecommendationsChart() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-primary-600 mb-4">Fertilizer Recommendations</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={mockData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {mockData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>Based on your soil analysis, we recommend the following fertilizer ratio:</p>
        <ul className="list-disc list-inside mt-2">
          <li>35% Nitrogen-based fertilizers</li>
          <li>25% Phosphorus-based fertilizers</li>
          <li>40% Potassium-based fertilizers</li>
        </ul>
      </div>
    </Card>
  );
}