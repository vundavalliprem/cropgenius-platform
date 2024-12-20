import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

const generateYieldData = (fertilizationLevel: number) => {
  return Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    yield: Math.round(((Math.sin(i / 2) + 1) * 50) * (1 + fertilizationLevel / 100)),
  }));
};

export function YieldSimulator() {
  const [fertilizationLevel, setFertilizationLevel] = useState([50]);
  const data = generateYieldData(fertilizationLevel[0]);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-primary-600 mb-4">Yield Simulator</h3>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Fertilization Level (%)</Label>
          <Slider
            value={fertilizationLevel}
            onValueChange={setFertilizationLevel}
            max={100}
            step={1}
          />
          <p className="text-sm text-gray-600">Current level: {fertilizationLevel}%</p>
        </div>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="yield"
                stroke="#2D5A27"
                strokeWidth={2}
                dot={{ fill: "#2D5A27" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>Projected yield improvement: +{Math.round(fertilizationLevel[0] * 0.8)}%</p>
          <p>Based on historical data and current soil conditions</p>
        </div>
      </div>
    </Card>
  );
}