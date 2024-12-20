import { useState, useMemo } from "react";
import { Card } from "@/components/ui/dashboard/Card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function ROICalculator() {
  const [investment, setInvestment] = useState(10000);
  const [cropType, setCropType] = useState("corn");

  const roiData = useMemo(() => {
    const baseMultiplier = cropType === "corn" ? 1.5 : cropType === "wheat" ? 1.3 : 1.4;
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      value: investment * (1 + (baseMultiplier * (i + 1)) / 100),
    }));
  }, [investment, cropType]);

  return (
    <Card title="ROI Calculator" description="Project your investment returns">
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-primary-600">Investment Amount</label>
            <Slider
              value={[investment]}
              onValueChange={(value) => setInvestment(value[0])}
              min={1000}
              max={100000}
              step={1000}
              className="mt-2"
            />
            <span className="text-sm text-gray-500">${investment.toLocaleString()}</span>
          </div>

          <div>
            <label className="text-sm font-medium text-primary-600">Crop Type</label>
            <Select value={cropType} onValueChange={setCropType}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="corn">Corn</SelectItem>
                <SelectItem value="wheat">Wheat</SelectItem>
                <SelectItem value="soybeans">Soybeans</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={roiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" label={{ value: "Months", position: "bottom" }} />
              <YAxis label={{ value: "Value ($)", angle: -90, position: "left" }} />
              <Tooltip formatter={(value) => ["$" + value.toLocaleString(), "Projected Value"]} />
              <Line type="monotone" dataKey="value" stroke="#2D5A27" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}