import React, { useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "@/components/ui/dashboard/Card";
import { useMapInitialization } from '../area/hooks/useMapInitialization';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useWeatherData } from '@/services/stormGlass';

interface WeatherMapProps {
  className?: string;
}

export function WeatherMap({ className }: WeatherMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { isReady, error: mapError, getMap } = useMapInitialization(mapContainer);
  const [apiKey, setApiKey] = useState(localStorage.getItem('STORMGLASS_API_KEY') || '');
  const { toast } = useToast();
  
  const { data: weatherData, error: weatherError } = useWeatherData({
    lat: 37.0902,
    lng: -95.7129,
  });

  const handleSaveApiKey = () => {
    localStorage.setItem('STORMGLASS_API_KEY', apiKey);
    toast({
      title: "API Key Saved",
      description: "Your Storm Glass API key has been saved successfully.",
    });
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
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <Button onClick={handleSaveApiKey}>Save Key</Button>
        </div>
        
        {weatherData && (
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

        {(mapError || weatherError) && (
          <div className="text-red-500 text-sm mb-4">
            {mapError || weatherError?.message}
          </div>
        )}

        <div className="h-[500px] relative rounded-lg overflow-hidden">
          <div ref={mapContainer} className="absolute inset-0" />
        </div>
      </div>
    </Card>
  );
}