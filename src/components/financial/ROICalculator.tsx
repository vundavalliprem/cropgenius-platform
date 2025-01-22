import { useState, useMemo } from "react";
import { Card } from "@/components/ui/dashboard/Card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { HelpCircle } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CROP_YIELDS = {
  corn: { min: 150, max: 200, unit: "bushels/acre" },
  wheat: { min: 40, max: 80, unit: "bushels/acre" },
  soybeans: { min: 45, max: 65, unit: "bushels/acre" },
};

export function ROICalculator() {
  const [investment, setInvestment] = useState(10000);
  const [cropType, setCropType] = useState("corn");
  const [marketPrice, setMarketPrice] = useState(5);
  const [yield_per_acre, setYieldPerAcre] = useState(CROP_YIELDS.corn.min);
  const [acres, setAcres] = useState(100);

  const roiData = useMemo(() => {
    const totalRevenue = yield_per_acre * acres * marketPrice;
    const profitMargin = (totalRevenue - investment) / investment * 100;
    
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      value: investment * (1 + (profitMargin * (i + 1)) / 100),
    }));
  }, [investment, yield_per_acre, acres, marketPrice]);

  const handleCropChange = (value: string) => {
    setCropType(value);
    setYieldPerAcre(CROP_YIELDS[value as keyof typeof CROP_YIELDS].min);
  };

  return (
    <Card title="ROI Calculator" description="Project your investment returns">
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-primary-600">Investment Amount</label>
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total investment required for the crop</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
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
            <Select value={cropType} onValueChange={handleCropChange}>
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

          <div>
            <label className="text-sm font-medium text-primary-600">
              Yield per Acre ({CROP_YIELDS[cropType as keyof typeof CROP_YIELDS].unit})
            </label>
            <Slider
              value={[yield_per_acre]}
              onValueChange={(value) => setYieldPerAcre(value[0])}
              min={CROP_YIELDS[cropType as keyof typeof CROP_YIELDS].min}
              max={CROP_YIELDS[cropType as keyof typeof CROP_YIELDS].max}
              step={1}
              className="mt-2"
            />
            <span className="text-sm text-gray-500">{yield_per_acre} {CROP_YIELDS[cropType as keyof typeof CROP_YIELDS].unit}</span>
          </div>

          <div>
            <label className="text-sm font-medium text-primary-600">Number of Acres</label>
            <Input
              type="number"
              value={acres}
              onChange={(e) => setAcres(Number(e.target.value))}
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-primary-600">Market Price ($ per unit)</label>
            <Input
              type="number"
              value={marketPrice}
              onChange={(e) => setMarketPrice(Number(e.target.value))}
              className="mt-2"
            />
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