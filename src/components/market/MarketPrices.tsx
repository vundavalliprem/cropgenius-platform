import { useState, useMemo } from "react";
import { Card } from "@/components/ui/dashboard/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const crops = [
  { id: "corn", name: "Corn" },
  { id: "wheat", name: "Wheat" },
  { id: "rice", name: "Rice" },
];

const yearRanges = [
  { id: "1", name: "Last Year" },
  { id: "3", name: "Last 3 Years" },
  { id: "5", name: "Last 5 Years" },
];

// Mock data generator
const generateMockData = (crop: string, years: string) => {
  const basePrice = crop === "corn" ? 400 : crop === "wheat" ? 300 : 500;
  const monthsData = [];
  const monthCount = parseInt(years) * 12;
  
  for (let i = 0; i < monthCount; i++) {
    const month = new Date();
    month.setMonth(month.getMonth() - i);
    monthsData.unshift({
      name: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      price: basePrice + Math.random() * 100 - 50,
    });
  }
  
  return monthsData;
};

const getMarketPrediction = (crop: string) => {
  const predictions = {
    corn: "Corn prices expected to rise by 5% next month",
    wheat: "Wheat demand stable, prices likely to remain steady",
    rice: "Rice prices projected to increase due to export restrictions",
  };
  return predictions[crop as keyof typeof predictions] || "";
};

const getPlantingTime = (crop: string) => {
  const plantingTimes = {
    corn: "Optimal planting window: Late April to early May",
    wheat: "Best planting time: Early October for winter wheat",
    rice: "Recommended planting: Late March to April",
  };
  return plantingTimes[crop as keyof typeof plantingTimes] || "";
};

export function MarketPrices() {
  const [selectedCrop, setSelectedCrop] = useState("corn");
  const [yearRange, setYearRange] = useState("1");

  const data = useMemo(
    () => generateMockData(selectedCrop, yearRange),
    [selectedCrop, yearRange]
  );

  return (
    <div className="space-y-6">
      <Card
        title="Market Prices"
        description="Current crop market trends"
        className="col-span-full lg:col-span-2"
      >
        <div className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select crop" />
              </SelectTrigger>
              <SelectContent>
                {crops.map((crop) => (
                  <SelectItem key={crop.id} value={crop.id}>
                    {crop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={yearRange} onValueChange={setYearRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {yearRanges.map((range) => (
                  <SelectItem key={range.id} value={range.id}>
                    {range.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#2D5A27"
                  strokeWidth={2}
                  dot={{ fill: "#2D5A27" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <Card title="AI Insights" description="Smart recommendations">
        <div className="space-y-4">
          <div className="p-4 bg-primary-100 rounded-md">
            <p className="text-primary-600 font-medium">Optimal Planting Time</p>
            <p className="text-sm text-primary-700 mt-1">
              {getPlantingTime(selectedCrop)}
            </p>
          </div>
          <div className="p-4 bg-primary-100 rounded-md">
            <p className="text-primary-600 font-medium">Market Prediction</p>
            <p className="text-sm text-primary-700 mt-1">
              {getMarketPrediction(selectedCrop)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}