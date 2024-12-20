import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

export function SoilQualityInput() {
  const [soilData, setSoilData] = useState({
    ph: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Soil data submitted",
      description: "Our AI is analyzing your soil quality data.",
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-primary-600 mb-4">Soil Quality Data</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ph">Soil pH Level</Label>
          <Input
            id="ph"
            type="number"
            step="0.1"
            placeholder="Enter pH level (0-14)"
            value={soilData.ph}
            onChange={(e) => setSoilData({ ...soilData, ph: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nitrogen">Nitrogen (N) Content</Label>
          <Input
            id="nitrogen"
            type="number"
            placeholder="Enter N content (mg/kg)"
            value={soilData.nitrogen}
            onChange={(e) => setSoilData({ ...soilData, nitrogen: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phosphorus">Phosphorus (P) Content</Label>
          <Input
            id="phosphorus"
            type="number"
            placeholder="Enter P content (mg/kg)"
            value={soilData.phosphorus}
            onChange={(e) => setSoilData({ ...soilData, phosphorus: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="potassium">Potassium (K) Content</Label>
          <Input
            id="potassium"
            type="number"
            placeholder="Enter K content (mg/kg)"
            value={soilData.potassium}
            onChange={(e) => setSoilData({ ...soilData, potassium: e.target.value })}
          />
        </div>
        <Button type="submit" className="w-full">Analyze Soil Quality</Button>
      </form>
    </Card>
  );
}