import React, { useRef, useEffect, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "@/components/ui/dashboard/Card";
import { useMapInitialization } from '../area/hooks/useMapInitialization';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useWeatherData } from '@/services/stormGlass';
import { AlertCircle, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import mapboxgl from 'mapbox-gl';

interface WeatherMapProps {
  className?: string;
}

export function WeatherMap({ className }: WeatherMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number }>({
    lat: 37.0902,
    lng: -95.7129,
  });
  const { isReady, error: mapError } = useMapInitialization();
  const apiKeyRef = useRef(localStorage.getItem('STORMGLASS_API_KEY') || '');
  const { toast } = useToast();
  
  const { data: weatherData, error: weatherError } = useWeatherData({
    lat: currentLocation.lat,
    lng: currentLocation.lng,
  });

  const handleLocationRequest = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(newLocation);
        if (mapInstance.current) {
          mapInstance.current.flyTo({
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
  };

  useEffect(() => {
    if (!isReady || !mapContainer.current) return;

    mapInstance.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [currentLocation.lng, currentLocation.lat],
      zoom: 4
    });

    mapInstance.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add click handler to update location
    mapInstance.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      setCurrentLocation({ lat, lng });
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isReady]);

  const handleSaveApiKey = () => {
    const newApiKey = apiKeyRef.current;
    localStorage.setItem('STORMGLASS_API_KEY', newApiKey);
    toast({
      title: "API Key Saved",
      description: "Your Storm Glass API key has been saved successfully.",
    });
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    apiKeyRef.current = e.target.value;
  };

  return (
    <Card 
      title="Weather Map" 
      description="Real-time weather conditions visualization" 
      className={className}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="password"
            placeholder="Enter Storm Glass API Key"
            defaultValue={apiKeyRef.current}
            onChange={handleApiKeyChange}
          />
          <Button onClick={handleSaveApiKey}>Save Key</Button>
        </div>
        
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
                {weatherData.airTemperature?.noaa?.toFixed(1)}°C
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground">Wind Speed</p>
              <p className="text-lg font-semibold">
                {weatherData.windSpeed?.noaa?.toFixed(1)} m/s
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