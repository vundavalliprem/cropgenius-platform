
interface Route {
  id: string;
  user_id: string;
  from_location: string;
  to_location: string;
  distance: number | null;
  duration: number | null;
  created_at: string;
  updated_at: string;
}

interface RouteStatsProps {
  routes: Route[];
}

export function RouteStats({ routes }: RouteStatsProps) {
  if (routes.length === 0) return null;

  const calculateSavings = (distance: number | null) => {
    if (!distance) return 0;
    const fuelCost = 100;
    const efficiency = 75; // Default efficiency
    return Math.round((distance * fuelCost * efficiency) / 100);
  };

  const totalSavings = routes.reduce((acc, route) => acc + calculateSavings(route.distance), 0);
  const totalDistance = routes.reduce((acc, route) => acc + (route.distance || 0), 0);

  return (
    <div className="p-4 bg-primary-100 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="font-medium text-primary-600">Total Savings</span>
        <span className="text-lg font-bold text-primary-600">
          ₹{totalSavings.toLocaleString()}
        </span>
      </div>
      <p className="text-sm text-primary-700 mt-2">
        Total Distance: {totalDistance.toLocaleString()}km
      </p>
    </div>
  );
}
