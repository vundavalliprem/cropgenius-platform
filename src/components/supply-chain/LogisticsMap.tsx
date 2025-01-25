import { Card } from "@/components/ui/dashboard/Card";
import { useMapInitialization } from '../area/hooks/useMapInitialization';
import { LocationInputs } from "./map/LocationInputs";
import { RouteInfo } from "./map/RouteInfo";
import { MapDisplay } from "./map/MapDisplay";
import { useRouteManagement } from "@/hooks/useRouteManagement";

interface LogisticsMapProps {
  className?: string;
}

export function LogisticsMap({ className }: LogisticsMapProps) {
  const { isReady, error } = useMapInitialization();
  const {
    route,
    isLoading,
    sourceLocation,
    destinationLocation,
    setSourceLocation,
    setDestinationLocation,
    handlePlanRoute,
    handleMapLoad
  } = useRouteManagement();

  return (
    <Card 
      title="Logistics Tracking" 
      description="Real-time shipment tracking and route visualization"
      className={className}
    >
      <div className="space-y-4">
        <LocationInputs
          sourceLocation={sourceLocation}
          destinationLocation={destinationLocation}
          onSourceChange={setSourceLocation}
          onDestinationChange={setDestinationLocation}
          onPlanRoute={handlePlanRoute}
          isLoading={isLoading}
        />

        {route && <RouteInfo route={route} />}

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {isReady && <MapDisplay onMapLoad={handleMapLoad} />}
      </div>
    </Card>
  );
}