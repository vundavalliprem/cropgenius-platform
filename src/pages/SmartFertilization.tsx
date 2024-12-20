import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SoilQualityInput } from "@/components/fertilization/SoilQualityInput";
import { RecommendationsChart } from "@/components/fertilization/RecommendationsChart";
import { YieldSimulator } from "@/components/fertilization/YieldSimulator";
import { EnvironmentalImpact } from "@/components/fertilization/EnvironmentalImpact";

const SmartFertilization = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-600 mb-2">Smart Fertilization</h1>
          <p className="text-gray-600">Optimize your soil quality and crop yield with AI-powered recommendations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SoilQualityInput />
          <RecommendationsChart />
          <YieldSimulator />
          <EnvironmentalImpact />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SmartFertilization;