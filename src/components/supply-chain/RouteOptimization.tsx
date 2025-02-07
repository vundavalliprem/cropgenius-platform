
import { Card } from "@/components/ui/dashboard/Card";
import { Button } from "@/components/ui/button";
import { Truck, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { LocationInput } from "./components/LocationInput";
import { RouteList } from "./components/RouteList";
import { RouteStats } from "./components/RouteStats";

interface LocationSuggestion {
  place_name: string;
  center: [number, number];
}

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

export function RouteOptimization() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [sourceSuggestions, setSourceSuggestions] = useState<LocationSuggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  useEffect(() => {
    async function fetchMapboxToken() {
      const { data, error } = await supabase.rpc('get_mapbox_token');
      if (error) {
        console.error('Error fetching Mapbox token:', error);
        toast({
          title: "Error",
          description: "Failed to load map configuration. Please try again later.",
          variant: "destructive",
        });
        return;
      }
      if (data) {
        setMapboxToken(data);
      }
    }
    fetchMapboxToken();
  }, []);

  const fetchSuggestions = useCallback(async (value: string, type: 'source' | 'destination') => {
    if (!mapboxToken || value.trim().length < 3) {
      type === 'source' ? setSourceSuggestions([]) : setDestinationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          value
        )}.json?access_token=${mapboxToken}&types=place`
      );
      
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      
      const data = await response.json();
      const suggestions = data.features.map((feature: any) => ({
        place_name: feature.place_name,
        center: feature.center,
      }));

      if (type === 'source') {
        setSourceSuggestions(suggestions);
        setShowSourceSuggestions(true);
      } else {
        setDestinationSuggestions(suggestions);
        setShowDestinationSuggestions(true);
      }
    } catch (error) {
      console.error('Search suggestion error:', error);
      type === 'source' ? setSourceSuggestions([]) : setDestinationSuggestions([]);
    }
  }, [mapboxToken]);

  const { data: routes = [], refetch } = useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Route[];
    }
  });

  const calculateEfficiency = (distance: number, duration: number) => {
    const averageSpeed = distance / (duration / 60);
    const optimalSpeed = 60;
    const efficiency = Math.min(100, Math.round((optimalSpeed / Math.abs(averageSpeed - optimalSpeed)) * 100));
    return efficiency;
  };

  const calculateSavings = (distance: number, efficiency: number) => {
    const fuelCost = 100;
    return Math.round((distance * fuelCost * efficiency) / 100);
  };

  const handlePlanRoute = async () => {
    if (!source || !destination) {
      toast({
        title: "Error",
        description: "Please enter both source and destination locations.",
        variant: "destructive",
      });
      return;
    }

    setIsPlanning(true);

    try {
      const sourceRes = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(source)}.json?access_token=${mapboxToken}`
      );
      const sourceData = await sourceRes.json();
      const [sourceLng, sourceLat] = sourceData.features[0].center;

      const destRes = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${mapboxToken}`
      );
      const destData = await destRes.json();
      const [destLng, destLat] = destData.features[0].center;

      const routeRes = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${sourceLng},${sourceLat};${destLng},${destLat}?access_token=${mapboxToken}`
      );
      const routeData = await routeRes.json();

      const distance = Math.round(routeData.routes[0].distance / 1000);
      const duration = Math.round(routeData.routes[0].duration / 60);
      const efficiency = calculateEfficiency(distance, duration);
      const savings = calculateSavings(distance, efficiency);

      const { error } = await supabase
        .from('routes')
        .insert({
          from_location: source,
          to_location: destination,
          distance,
          estimated_duration: duration,
          efficiency,
          savings,
          from_coordinates: `(${sourceLng},${sourceLat})`,
          to_coordinates: `(${destLng},${destLat})`,
          alerts: [],
          status: 'planned'
        });

      if (error) throw error;

      setSource("");
      setDestination("");
      refetch();

      toast({
        title: "Route Planned",
        description: "New route has been successfully planned.",
      });
    } catch (error) {
      console.error('Error planning route:', error);
      toast({
        title: "Error",
        description: "Failed to plan route. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <Card title="Route Optimization" description={`${routes.length} routes planned`}>
      <div className="space-y-6">
        <div className="grid gap-4 p-4 bg-accent rounded-lg">
          <h3 className="font-medium text-primary-600">Plan New Delivery</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <LocationInput
              label="Source Location"
              value={source}
              onChange={(value) => {
                setSource(value);
                fetchSuggestions(value, 'source');
              }}
              onLocationSelect={(suggestion) => setSource(suggestion.place_name)}
              suggestions={sourceSuggestions}
              showSuggestions={showSourceSuggestions}
              setShowSuggestions={setShowSourceSuggestions}
            />
            <LocationInput
              label="Destination"
              value={destination}
              onChange={(value) => {
                setDestination(value);
                fetchSuggestions(value, 'destination');
              }}
              onLocationSelect={(suggestion) => setDestination(suggestion.place_name)}
              suggestions={destinationSuggestions}
              showSuggestions={showDestinationSuggestions}
              setShowSuggestions={setShowDestinationSuggestions}
            />
          </div>
          <Button 
            className="w-full md:w-auto"
            onClick={handlePlanRoute}
            disabled={!source || !destination || isPlanning}
          >
            {isPlanning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Truck className="mr-2 h-4 w-4" />
            )}
            {isPlanning ? "Planning Route..." : "Plan Route"}
          </Button>
        </div>

        <RouteList routes={routes} />
        <RouteStats routes={routes} />
      </div>
    </Card>
  );
}
