import { Card } from "@/components/ui/dashboard/Card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

const mockForecastData = [
  { month: "Jan", actual: 4000, forecast: 4400, confidence: 95 },
  { month: "Feb", actual: 4500, forecast: 4600, confidence: 93 },
  { month: "Mar", actual: 5100, forecast: 5000, confidence: 94 },
  { month: "Apr", actual: 4800, forecast: 5200, confidence: 92 },
  { month: "May", actual: 5300, forecast: 5500, confidence: 90 },
  { month: "Jun", actual: null, forecast: 5800, confidence: 88 },
  { month: "Jul", actual: null, forecast: 6000, confidence: 85 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
        {payload[0].payload.confidence && (
          <p className="text-sm text-gray-500 mt-1">
            Confidence: {payload[0].payload.confidence}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function DemandForecast() {
  const [timeframe, setTimeframe] = useState("6months");
  const [selectedCrop, setSelectedCrop] = useState("all");

  return (
    <Card title="AI-Powered Demand Forecast" description="Predict crop demand and optimize your harvests">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select crop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Crops</SelectItem>
              <SelectItem value="wheat">Wheat</SelectItem>
              <SelectItem value="rice">Rice</SelectItem>
              <SelectItem value="corn">Corn</SelectItem>
            </SelectContent>
          </Select>

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
            <LineChart data={mockForecastData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
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

        <div className="grid gap-4 mt-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-700 mb-2">AI Insights</h4>
            <ul className="space-y-2 text-sm text-green-600">
              <li className="flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
                Expected 15% increase in demand over next 3 months
              </li>
              <li className="flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
                Optimal harvest timing: Late June to early July
              </li>
              <li className="flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
                Consider increasing storage capacity by 20%
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}