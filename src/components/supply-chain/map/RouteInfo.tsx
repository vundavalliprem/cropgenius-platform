import type { HereRoute } from "@/services/here";

interface RouteInfoProps {
  route: HereRoute | null;
}

export function RouteInfo({ route }: RouteInfoProps) {
  if (!route) return null;

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="p-3 bg-accent rounded-lg">
        <p className="text-sm text-muted-foreground">Estimated Time</p>
        <p className="text-lg font-semibold">
          {Math.round(route.sections[0].summary.duration / 60)} min
        </p>
      </div>
      <div className="p-3 bg-accent rounded-lg">
        <p className="text-sm text-muted-foreground">Distance</p>
        <p className="text-lg font-semibold">
          {(route.sections[0].summary.length / 1000).toFixed(1)} km
        </p>
      </div>
    </div>
  );
}