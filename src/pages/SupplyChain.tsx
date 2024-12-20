import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LogisticsMap } from "@/components/supply-chain/LogisticsMap";
import { DemandForecast } from "@/components/supply-chain/DemandForecast";
import { RouteOptimization } from "@/components/supply-chain/RouteOptimization";

const SupplyChain = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-600 mb-2">Supply Chain Management</h1>
          <p className="text-gray-600">Track shipments and optimize your logistics operations</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LogisticsMap className="lg:col-span-2" />
          <DemandForecast />
          <RouteOptimization />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SupplyChain;