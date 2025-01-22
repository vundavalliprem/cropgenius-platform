import { useState, useMemo } from "react";
import { Card } from "@/components/ui/dashboard/Card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { HelpCircle, Plus } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const DEFAULT_CROP_YIELDS = {
  corn: { min: 15, max: 20, unit: "bags/acre" },
  wheat: { min: 4, max: 8, unit: "bags/acre" },
  soybeans: { min: 4.5, max: 6.5, unit: "bags/acre" },
};

export function ROICalculator() {
  const [investment, setInvestment] = useState(10000);
  const [cropType, setCropType] = useState("corn");
  const [marketPrice, setMarketPrice] = useState(500);
  const [yield_per_acre, setYieldPerAcre] = useState(DEFAULT_CROP_YIELDS.corn.min);
  const [acres, setAcres] = useState(100);
  const [customCrops, setCustomCrops] = useState<Record<string, { min: number; max: number; unit: string }>>({});
  const [newCropName, setNewCropName] = useState("");
  const [newCropMinYield, setNewCropMinYield] = useState("");
  const [newCropMaxYield, setNewCropMaxYield] = useState("");

  const CROP_YIELDS = { ...DEFAULT_CROP_YIELDS, ...customCrops };

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

  const handleAddNewCrop = () => {
    if (newCropName && newCropMinYield && newCropMaxYield) {
      setCustomCrops(prev => ({
        ...prev,
        [newCropName.toLowerCase()]: {
          min: Number(newCropMinYield),
          max: Number(newCropMaxYield),
          unit: "bags/acre"
        }
      }));
      setNewCropName("");
      setNewCropMinYield("");
      setNewCropMaxYield("");
    }
  };

  return (
    <Card title="ROI Calculator" description="Project your investment returns">
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-primary-600">Investment Amount (₹)</label>
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
            <span className="text-sm text-gray-500">₹{investment.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-primary-600">Crop Type</label>
              <Select value={cropType} onValueChange={handleCropChange}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CROP_YIELDS).map(([key, _]) => (
                    <SelectItem key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mt-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Crop
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Crop Type</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Crop Name</label>
                    <Input
                      value={newCropName}
                      onChange={(e) => setNewCropName(e.target.value)}
                      placeholder="Enter crop name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Minimum Yield (bags/acre)</label>
                    <Input
                      type="number"
                      value={newCropMinYield}
                      onChange={(e) => setNewCropMinYield(e.target.value)}
                      placeholder="Enter minimum yield"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Maximum Yield (bags/acre)</label>
                    <Input
                      type="number"
                      value={newCropMaxYield}
                      onChange={(e) => setNewCropMaxYield(e.target.value)}
                      placeholder="Enter maximum yield"
                    />
                  </div>
                  <Button onClick={handleAddNewCrop}>Add Crop</Button>
                </div>
              </DialogContent>
            </Dialog>
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
              step={0.1}
              className="mt-2"
            />
            <span className="text-sm text-gray-500">
              {yield_per_acre} {CROP_YIELDS[cropType as keyof typeof CROP_YIELDS].unit}
            </span>
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
            <label className="text-sm font-medium text-primary-600">Market Price (₹ per Quintal)</label>
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
              <XAxis 
                dataKey="month" 
                label={{ value: "Months", position: "bottom", offset: -5 }}
              />
              <YAxis 
                label={{ value: "Value (₹)", angle: -90, position: "left" }} 
              />
              <Tooltip formatter={(value) => ["₹" + value.toLocaleString(), "Projected Value"]} />
              <Line type="monotone" dataKey="value" stroke="#2D5A27" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}