import React from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "@/components/ui/dashboard/Card";
import { useMapInitialization } from '../area/hooks/useMapInitialization';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useWeatherData } from '@/services/openWeather';
import { AlertCircle, MapPin, Search, Star } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FavoriteCities } from './FavoriteCities';
import { supabase } from "@/integrations/supabase/client";
import mapboxgl from 'mapbox-gl';

interface WeatherMapProps {
  className?: string;
  onLocationChange?: (lat: number, lng: number) => void;
}

interface SearchSuggestion {
  place_name: string;
  center: [number, number];
}

export function WeatherMap({ className, onLocationChange }: WeatherMapProps) {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentLocation, setCurrentLocation] = React.useState<{ 
    lat: number; 
    lng: number;
    cityName?: string;
  }>({
    lat: 37.0902,
    lng: -95.7129,
  });
  const { isReady, error: mapError } = useMapInitialization();
  const { toast } = useToast();
  
  const { data: weatherData, error: weatherError } = useWeatherData({
    lat: currentLocation.lat,
    lng: currentLocation.lng,
  });

  const [searchSuggestions, setSearchSuggestions] = React.useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  
  const handleLocationChange = React.useCallback((lat: number, lng: number, cityName?: string) => {
    setCurrentLocation({ lat, lng, cityName });
    if (onLocationChange) {
      onLocationChange(lat, lng);
    }
  }, [onLocationChange]);

  const handleSearchInput = React.useCallback(async (value: string) => {
    setSearchQuery(value);
    if (value.trim().length < 3) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          value
        )}.json?access_token=${mapboxgl.accessToken}&types=place`
      );
      
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      
      const data = await response.json();
      setSearchSuggestions(data.features);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search suggestion error:', error);
      setSearchSuggestions([]);
    }
  }, []);

  const handleSuggestionClick = React.useCallback((suggestion: SearchSuggestion) => {
    const [lng, lat] = suggestion.center;
    handleLocationChange(lat, lng, suggestion.place_name);
    
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 12
      });
    }
    
    setSearchQuery(suggestion.place_name);
    setShowSuggestions(false);
    
    toast({
      title: "Location found",
      description: `Showing weather for ${suggestion.place_name}`,
    });
  }, [handleLocationChange, toast]);

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
        const cityName = data.features[0].place_name;
        handleLocationChange(lat, lng, cityName);
        
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: 12
          });
        }
        
        toast({
          title: "Location found",
          description: `Showing weather for ${cityName}`,
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

  const handleAddToFavorites = async () => {
    if (!currentLocation.cityName) {
      toast({
        title: "Error",
        description: "Please search for a city first",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to add favorites",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('favorite_cities')
        .insert({
          city_name: currentLocation.cityName,
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "City added to favorites",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add city to favorites",
        variant: "destructive",
      });
    }
  };

  const handleLocationRequest = React.useCallback(() => {
    if ('geolocation' in navigator) {
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
    }
  }, [handleLocationChange, toast]);

  const handleMapClick = React.useCallback((e: mapboxgl.MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    handleLocationChange(lat, lng);
  }, [handleLocationChange]);

  React.useEffect(() => {
    if (!isReady || !mapContainer.current) return;

    const initMap = () => {
      if (mapRef.current) return;

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [currentLocation.lng, currentLocation.lat],
        zoom: 4
      });

      const navControl = new mapboxgl.NavigationControl();
      map.addControl(navControl, 'top-right');

      map.on('click', handleMapClick);
      mapRef.current = map;
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
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
          <div className="flex-1 relative">
            <div className="flex gap-2">
              <Input
                placeholder="Search for a city..."
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
              {currentLocation.cityName && (
                <Button onClick={handleAddToFavorites} variant="outline">
                  <Star className="h-4 w-4" />
                </Button>
              )}
            </div>
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full px-4 py-2 text-left hover:bg-accent first:rounded-t-md last:rounded-b-md"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.place_name}
                  </button>
                ))}
              </div>
            )}
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

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-2">Favorite Cities</h3>
          <FavoriteCities onCitySelect={(lat, lng, cityName) => {
            handleLocationChange(lat, lng, cityName);
            if (mapRef.current) {
              mapRef.current.flyTo({
                center: [lng, lat],
                zoom: 12
              });
            }
          }} />
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
