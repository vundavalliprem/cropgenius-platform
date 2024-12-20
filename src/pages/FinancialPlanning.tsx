import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FinancialDashboard } from "@/components/financial/FinancialDashboard";
import { ROICalculator } from "@/components/financial/ROICalculator";
import { BudgetPlanner } from "@/components/financial/BudgetPlanner";

const FinancialPlanning = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-600 mb-2">Financial Planning</h1>
          <p className="text-gray-600">Manage your farm's finances and plan for the future</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FinancialDashboard />
          <ROICalculator />
          <BudgetPlanner className="lg:col-span-2" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FinancialPlanning;