import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function EnvironmentalImpact() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-primary-600 mb-4">Environmental Impact</h3>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Carbon Footprint Reduction</span>
            <span className="text-primary-600">45%</span>
          </div>
          <Progress value={45} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Water Usage Optimization</span>
            <span className="text-primary-600">60%</span>
          </div>
          <Progress value={60} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Soil Health Improvement</span>
            <span className="text-primary-600">75%</span>
          </div>
          <Progress value={75} className="h-2" />
        </div>
        
        <div className="mt-4 p-4 bg-primary-100 rounded-md">
          <h4 className="font-medium text-primary-600 mb-2">Environmental Benefits</h4>
          <ul className="text-sm text-primary-700 space-y-2">
            <li>• Reduced chemical runoff by 45%</li>
            <li>• Improved soil biodiversity by 30%</li>
            <li>• Decreased water consumption by 25%</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}