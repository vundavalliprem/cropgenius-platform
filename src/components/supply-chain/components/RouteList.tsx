
import { Progress } from "@/components/ui/progress";
import { MapPin, AlertTriangle } from "lucide-react";

interface Route {
  id: number;
  from_location: string;
  to_location: string;
  efficiency: number;
  savings: number;
  status: string;
  alerts: string[];
  distance: number;
  estimated_duration: number;
}

interface RouteListProps {
  routes: Route[];
}

export function RouteList({ routes }: RouteListProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
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
                Status: {route.status} • Distance: {route.distance}km • ETA: {formatDuration(route.estimated_duration)}
              </p>
            </div>
            <span className="text-sm font-medium text-green-600">
              ₹{route.savings.toLocaleString()} saved
            </span>
          </div>
          
          {route.alerts && route.alerts.length > 0 && (
            <div className="mb-2 p-2 bg-yellow-50 rounded text-sm">
              <AlertTriangle className="inline-block mr-1 h-4 w-4 text-yellow-500" />
              {route.alerts.join(", ")}
            </div>
          )}

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
  );
}
