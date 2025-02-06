
import { Card } from "@/components/ui/dashboard/Card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, AlertTriangle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
      setMapboxToken(data);
    }
    fetchMapboxToken();
  }, []);

  // Fetch routes from Supabase
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
    // Basic efficiency calculation based on distance and duration
    const averageSpeed = distance / (duration / 60); // km/h
    const optimalSpeed = 60; // Assumed optimal speed
    const efficiency = Math.min(100, Math.round((optimalSpeed / Math.abs(averageSpeed - optimalSpeed)) * 100));
    return efficiency;
  };

  const calculateSavings = (distance: number, efficiency: number) => {
    // Basic savings calculation based on distance and efficiency
    const fuelCost = 100; // Cost per km in rupees
    return Math.round((distance * fuelCost * efficiency) / 100);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
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

    if (!mapboxToken) {
      toast({
        title: "Error",
        description: "Map service is not configured properly. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setIsPlanning(true);

    try {
      // Get coordinates for source
      const sourceRes = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(source)}.json?access_token=${mapboxToken}`
      );
      const sourceData = await sourceRes.json();
      const [sourceLng, sourceLat] = sourceData.features[0].center;

      // Get coordinates for destination
      const destRes = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${mapboxToken}`
      );
      const destData = await destRes.json();
      const [destLng, destLat] = destData.features[0].center;

      // Get route details using Mapbox Directions API
      const routeRes = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${sourceLng},${sourceLat};${destLng},${destLat}?access_token=${mapboxToken}`
      );
      const routeData = await routeRes.json();

      const distance = Math.round(routeData.routes[0].distance / 1000); // Convert to km
      const duration = Math.round(routeData.routes[0].duration / 60); // Convert to minutes
      const efficiency = calculateEfficiency(distance, duration);
      const savings = calculateSavings(distance, efficiency);

      // Insert new route into Supabase
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
        });

      if (error) throw error;

      // Clear inputs and refetch routes
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
            <div>
              <label className="text-sm font-medium mb-1 block">Source Location</label>
              <Input 
                placeholder="Enter source location" 
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Destination</label>
              <Input 
                placeholder="Enter destination location" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
          </div>
          <Button 
            className="w-full md:w-auto"
            onClick={handlePlanRoute}
            disabled={isPlanning || !mapboxToken}
          >
            {isPlanning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Truck className="mr-2 h-4 w-4" />
            )}
            {isPlanning ? "Planning Route..." : "Plan Route"}
          </Button>
        </div>

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

        {routes.length > 0 && (
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
        )}
      </div>
    </Card>
  );
}
