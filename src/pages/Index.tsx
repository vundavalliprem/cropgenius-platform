import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/dashboard/Card";
import { MarketPrices } from "@/components/market/MarketPrices";
import { useCommodityPrices } from "@/services/commodityPrices";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: commodityPrices, isLoading } = useCommodityPrices();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-600 mb-2">Welcome to AgriSmart</h1>
          <p className="text-gray-600">Your intelligent farming assistant</p>
        </div>

        <MarketPrices />

        <Card
          title="Daily Commodity Prices"
          description="Latest prices from various markets"
          className="col-span-full"
        >
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {commodityPrices?.map((price, index) => (
                <div
                  key={index}
                  className="p-4 bg-background rounded-lg border shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-primary-600">
                        {price.commodity}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {price.market}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-primary">
                      ₹{price.price}/{price.unit}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Updated: {new Date(price.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

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