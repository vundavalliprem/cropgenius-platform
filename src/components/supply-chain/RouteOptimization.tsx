import { Card } from "@/components/ui/dashboard/Card";
import { Progress } from "@/components/ui/progress";

const routes = [
  {
    id: 1,
    from: "San Francisco, CA",
    to: "Dallas, TX",
    efficiency: 92,
    savings: 1200,
    status: "In Transit",
  },
  {
    id: 2,
    from: "Seattle, WA",
    to: "Phoenix, AZ",
    efficiency: 88,
    savings: 800,
    status: "Scheduled",
  },
  {
    id: 3,
    from: "Chicago, IL",
    to: "Houston, TX",
    efficiency: 95,
    savings: 1500,
    status: "Completed",
  },
];

export function RouteOptimization() {
  return (
    <Card title="Route Optimization" description="Cost-efficient route analysis and savings">
      <div className="space-y-6">
        <div className="grid gap-4">
          {routes.map((route) => (
            <div key={route.id} className="p-4 bg-accent rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-primary-600">
                    {route.from} → {route.to}
                  </h4>
                  <p className="text-sm text-gray-500">{route.status}</p>
                </div>
                <span className="text-sm font-medium text-green-600">
                  ${route.savings} saved
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Route Efficiency</span>
                  <span>{route.efficiency}%</span>
                </div>
                <Progress value={route.efficiency} className="h-2" />
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-primary-100 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-primary-600">Total Projected Savings</span>
            <span className="text-lg font-bold text-primary-600">
              ${routes.reduce((acc, route) => acc + route.savings, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}