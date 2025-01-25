import { LocationSearch } from "@/components/ui/location-search";
import { Button } from "@/components/ui/button";

interface LocationInputsProps {
  sourceLocation: string;
  destinationLocation: string;
  onSourceChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onPlanRoute: () => void;
  isLoading: boolean;
}

export function LocationInputs({
  sourceLocation,
  destinationLocation,
  onSourceChange,
  onDestinationChange,
  onPlanRoute,
  isLoading
}: LocationInputsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium mb-1 block">Source Location</label>
          <LocationSearch
            value={sourceLocation}
            onChange={onSourceChange}
            placeholder="Enter source location"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Destination</label>
          <LocationSearch
            value={destinationLocation}
            onChange={onDestinationChange}
            placeholder="Enter destination"
          />
        </div>
      </div>

      <Button 
        onClick={onPlanRoute} 
        disabled={isLoading || !sourceLocation || !destinationLocation}
        className="w-full md:w-auto"
      >
        {isLoading ? "Planning Route..." : "Plan Route"}
      </Button>
    </div>
  );
}