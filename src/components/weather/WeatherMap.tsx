import React from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "@/components/ui/dashboard/Card";
import { useMapInitialization } from '../area/hooks/useMapInitialization';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useWeatherData } from '@/services/openWeather';
import { AlertCircle, MapPin, Search } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import mapboxgl from 'mapbox-gl';

interface WeatherMapProps {
  className?: string;
  onLocationChange?: (lat: number, lng: number) => void;
}

export function WeatherMap({ className, onLocationChange }: WeatherMapProps) {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const navigationControlRef = React.useRef<mapboxgl.NavigationControl | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
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

  const handleLocationChange = React.useCallback((lat: number, lng: number) => {
    setCurrentLocation({ lat, lng });
    if (onLocationChange) {
      onLocationChange(lat, lng);
    }
  }, [onLocationChange]);

  const handleSearch = React.useCallback(async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${mapboxgl.accessToken}`
      );
      
      if (!response.ok) throw new Error('Failed to search location');
      
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        handleLocationChange(lat, lng);
        
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: 12
          });
        }
        
        toast({
          title: "Location found",
          description: `Showing weather for ${data.features[0].place_name}`,
        });
      } else {
        toast({
          title: "Location not found",
          description: "Please try a different search term",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search location. Please try again.",
        variant: "destructive",
      });
    }
  }, [searchQuery, handleLocationChange, toast]);

  const handleLocationRequest = React.useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        handleLocationChange(newLocation.lat, newLocation.lng);
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
  }, [handleLocationChange, toast]);

  const handleMapClick = React.useCallback((e: mapboxgl.MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    handleLocationChange(lat, lng);
  }, [handleLocationChange]);

  React.useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      if (!isReady || !mapContainer.current || !isMounted) return;

      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
        if (navigationControlRef.current) {
          mapRef.current.removeControl(navigationControlRef.current);
          navigationControlRef.current = null;
        }
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [currentLocation.lng, currentLocation.lat],
        zoom: 4
      });

      if (!isMounted) {
        map.remove();
        return;
      }

      mapRef.current = map;

      const navControl = new mapboxgl.NavigationControl();
      navigationControlRef.current = navControl;
      map.addControl(navControl, 'top-right');

      map.on('click', handleMapClick);

      return () => {
        if (map) {
          map.off('click', handleMapClick);
          if (navControl) {
            map.removeControl(navControl);
          }
          map.remove();
        }
      };
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
        if (navigationControlRef.current) {
          mapRef.current.removeControl(navigationControlRef.current);
          navigationControlRef.current = null;
        }
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isReady, currentLocation.lat, currentLocation.lng, handleMapClick]);

  return (
    <Card 
      title="Weather Map" 
      description="Real-time weather conditions visualization" 
      className={className}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="flex gap-2">
              <Input
                placeholder="Search for a city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button 
            onClick={handleLocationRequest}
            variant="outline"
            className="whitespace-nowrap"
          >
            <MapPin className="mr-2 h-4 w-4" />
            My Location
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