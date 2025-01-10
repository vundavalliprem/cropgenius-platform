import React from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "@/components/ui/dashboard/Card";
import { useMapInitialization } from '../area/hooks/useMapInitialization';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useWeatherData } from '@/services/openWeather';
import { AlertCircle, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import mapboxgl from 'mapbox-gl';

interface WeatherMapProps {
  className?: string;
}

export function WeatherMap({ className }: WeatherMapProps) {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const [currentLocation, setCurrentLocation] = React.useState<{ lat: number; lng: number }>({
    lat: 37.0902,
    lng: -95.7129,
  });
  const { isReady, error: mapError } = useMapInitialization();
  const { toast } = useToast();
  
  const { data: weatherData, error: weatherError } = useWeatherData({
    lat: currentLocation.lat,
    lng: currentLocation.lng,
  });

  const handleLocationRequest = React.useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(newLocation);
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [newLocation.lng, newLocation.lat],
            zoom: 12
          });
        }
      },
      (error) => {
        toast({
          title: "Location Error",
          description: "Unable to get your location. Please enable location services.",
          variant: "destructive",
        });
      }
    );
  }, [toast]);

  React.useEffect(() => {
    if (!isReady || !mapContainer.current) return;

    // Cleanup any existing instances
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Initialize new map instance
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [currentLocation.lng, currentLocation.lat],
      zoom: 4
    });

    const map = mapRef.current;
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add click handler to update location
    const clickHandler = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      setCurrentLocation({ lat, lng });
    };
    
    map.on('click', clickHandler);

    // Return cleanup function
    return () => {
      if (mapRef.current) {
        map.off('click', clickHandler);
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isReady, currentLocation.lat, currentLocation.lng]);

  return (
    <Card 
      title="Weather Map" 
      description="Real-time weather conditions visualization" 
      className={className}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={handleLocationRequest}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <MapPin className="mr-2 h-4 w-4" />
            Go to My Location
          </Button>
        </div>
        
        {weatherError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {weatherError instanceof Error ? weatherError.message : 'Failed to fetch weather data'}
            </AlertDescription>
          </Alert>
        )}
        
        {weatherData && !weatherError && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground">Temperature</p>
              <p className="text-lg font-semibold">
                {weatherData.temp.toFixed(1)}°C
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground">Wind Speed</p>
              <p className="text-lg font-semibold">
                {weatherData.windSpeed.toFixed(1)} m/s
              </p>
            </div>
          </div>
        )}

        {mapError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{mapError}</AlertDescription>
          </Alert>
        )}

        <div className="h-[500px] relative rounded-lg overflow-hidden">
          <div ref={mapContainer} className="absolute inset-0" />
        </div>
      </div>
    </Card>
  );
}