import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/dashboard/Card";
import { MarketPrices } from "@/components/market/MarketPrices";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-600 mb-2">Welcome to AgriSmart</h1>
          <p className="text-gray-600">Your intelligent farming assistant</p>
        </div>

        <MarketPrices />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            title="Weather Forecast"
            description="7-day prediction"
            className="col-span-full md:col-span-1"
          >
            <div className="space-y-3">
              {["Mon", "Tue", "Wed"].map((day) => (
                <div key={day} className="flex items-center justify-between p-2 border-b">
                  <span className="font-medium">{day}</span>
                  <span className="text-primary-600">23°C</span>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Tasks"
            description="Upcoming activities"
            className="col-span-full md:col-span-1"
          >
            <div className="space-y-3">
              {["Check soil moisture", "Apply fertilizer", "Inspect crops"].map((task) => (
                <div key={task} className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-primary-300" />
                  <span>{task}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;