
interface Route {
  id: number;
  distance: number;
  savings: number;
}

interface RouteStatsProps {
  routes: Route[];
}

export function RouteStats({ routes }: RouteStatsProps) {
  if (routes.length === 0) return null;

  return (
    <div className="p-4 bg-primary-100 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="font-medium text-primary-600">Total Savings</span>
        <span className="text-lg font-bold text-primary-600">
          ₹{routes.reduce((acc, route) => acc + route.savings, 0).toLocaleString()}
        </span>
      </div>
      <p className="text-sm text-primary-700 mt-2">
        Total Distance: {routes.reduce((acc, route) => acc + route.distance, 0).toLocaleString()}km
      </p>
    </div>
  );
}
