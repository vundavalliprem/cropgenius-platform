
import { Progress } from "@/components/ui/progress";
import { MapPin, AlertTriangle } from "lucide-react";

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

interface RouteListProps {
  routes: Route[];
}

export function RouteList({ routes }: RouteListProps) {
  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const calculateEfficiency = (distance: number | null, duration: number | null) => {
    if (!distance || !duration) return 75; // Default efficiency
    const averageSpeed = distance / (duration / 60);
    const optimalSpeed = 60;
    return Math.min(100, Math.round((optimalSpeed / Math.abs(averageSpeed - optimalSpeed)) * 100));
  };

  const calculateSavings = (distance: number | null) => {
    if (!distance) return 0;
    const fuelCost = 100;
    const efficiency = 75; // Default efficiency
    return Math.round((distance * fuelCost * efficiency) / 100);
  };

  return (
    <div className="grid gap-4">
      {routes.map((route) => (
        <div key={route.id} className="p-4 bg-accent rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-medium text-primary-600">
                <MapPin className="inline-block mr-1 h-4 w-4" />
                {route.from_location} → {route.to_location}
              </h4>
              <p className="text-sm text-gray-500">
                Status: Active • Distance: {route.distance || 0}km • ETA: {formatDuration(route.duration)}
              </p>
            </div>
            <span className="text-sm font-medium text-green-600">
              ₹{calculateSavings(route.distance).toLocaleString()} saved
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Route Efficiency</span>
              <span>{calculateEfficiency(route.distance, route.duration)}%</span>
            </div>
            <Progress value={calculateEfficiency(route.distance, route.duration)} className="h-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
