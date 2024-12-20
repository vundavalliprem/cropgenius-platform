import { Card } from "@/components/ui/dashboard/Card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const mockForecastData = [
  { month: "Jan", actual: 4000, forecast: 4400 },
  { month: "Feb", actual: 4500, forecast: 4600 },
  { month: "Mar", actual: 5100, forecast: 5000 },
  { month: "Apr", actual: 4800, forecast: 5200 },
  { month: "May", actual: 5300, forecast: 5500 },
  { month: "Jun", actual: null, forecast: 5800 },
  { month: "Jul", actual: null, forecast: 6000 },
];

export function DemandForecast() {
  const [timeframe, setTimeframe] = useState("6months");

  return (
    <Card title="Demand Forecast" description="Predicted demand trends based on historical data">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Next 3 months</SelectItem>
              <SelectItem value="6months">Next 6 months</SelectItem>
              <SelectItem value="12months">Next 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockForecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#2D5A27"
                strokeWidth={2}
                dot={{ fill: "#2D5A27" }}
                name="Actual Demand"
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#8BA888"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={{ fill: "#8BA888" }}
                name="Forecasted Demand"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}