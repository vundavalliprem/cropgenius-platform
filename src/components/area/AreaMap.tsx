import React from 'react';
import mapboxgl from 'mapbox-gl';
import { Card } from "@/components/ui/dashboard/Card";
import { Button } from "@/components/ui/button";
import { useMapInitialization } from './hooks/useMapInitialization';
import { useAreaCalculation } from './hooks/useAreaCalculation';
import { useMapSetup } from './hooks/useMapSetup';
import { MapControls } from './components/MapControls';
import { AreaConversions } from './components/AreaConversions';
import { MapContainer } from './components/MapContainer';
import { MapLayerSwitcher, MapStyle } from './components/MapLayerSwitcher';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface AreaMapProps {
  className?: string;
}

export function AreaMap({ className }: AreaMapProps) {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const { isReady, error: mapError } = useMapInitialization();
  const { toast } = useToast();
  const [areaName, setAreaName] = React.useState("");
  const [mapStyle, setMapStyle] = React.useState<MapStyle>('streets');
  const {
    selectedUnit,
    setSelectedUnit,
    calculatedArea,
    setCalculatedArea,
    requestLocation,
  } = useAreaCalculation();

  const { mapRef, drawRef } = useMapSetup({
    isReady,
    selectedUnit,
    setCalculatedArea,
    mapContainer,
  });

  const handleStyleChange = React.useCallback((style: MapStyle) => {
    if (!mapRef.current) return;
    setMapStyle(style);
    
    const styleUrls: Record<MapStyle, string> = {
      streets: 'mapbox://styles/mapbox/outdoors-v12',
      satellite: 'mapbox://styles/mapbox/satellite-v9',
      hybrid: 'mapbox://styles/mapbox/satellite-streets-v12',
    };
    
    mapRef.current.setStyle(styleUrls[style]);
  }, [mapRef]);

  const handleStartDrawing = React.useCallback(() => {
    if (!drawRef.current) return;
    const drawControl = document.querySelector('.mapbox-gl-draw_polygon');
    if (drawControl) {
      (drawControl as HTMLElement).click();
    }
  }, [drawRef]);

  const handleClear = React.useCallback(() => {
    if (!drawRef.current || !mapRef.current) return;
    
    // Delete all features from draw
    drawRef.current.deleteAll();
    
    // Remove all markers (including distance labels)
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());
    
    // Reset calculated area
    setCalculatedArea(null);
    
    toast({
      title: "Cleared",
      description: "All drawings and measurements have been cleared.",
    });
  }, [drawRef, mapRef, setCalculatedArea, toast]);

  const handleLocationRequest = React.useCallback(async () => {
    try {
      const coords = await requestLocation();
      if (!coords || !mapRef.current) return;

      mapRef.current.setCenter(coords);
      mapRef.current.setZoom(15);

      // Add marker for current location
      new mapboxgl.Marker()
        .setLngLat(coords)
        .addTo(mapRef.current);
    } catch (error) {
      console.error('Location request error:', error);
      toast({
        title: "Error",
        description: "Failed to get current location. Please check your location permissions.",
        variant: "destructive",
      });
    }
  }, [requestLocation, mapRef, toast]);

  const handleSaveArea = React.useCallback(async () => {
    if (!calculatedArea) {
      toast({
        title: "Error",
        description: "Please draw an area first before saving.",
        variant: "destructive",
      });
      return;
    }

    if (!areaName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for this area.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('saved_areas').insert({
        user_id: user.id,
        area: calculatedArea,
        unit: selectedUnit,
        name: areaName.trim(),
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Area saved successfully!",
      });
      
      setAreaName("");
    } catch (error) {
      console.error('Save area error:', error);
      toast({
        title: "Error",
        description: "Failed to save area. Please try again.",
        variant: "destructive",
      });
    }
  }, [calculatedArea, selectedUnit, areaName, toast]);

  return (
    <Card 
      title="Interactive Field Map" 
      description="Draw or track your field boundaries"
      className={className}
    >
      <div className="space-y-4 sm:space-y-6">
        <MapControls
          isReady={isReady}
          selectedUnit={selectedUnit}
          onUnitChange={setSelectedUnit}
          onStartDrawing={handleStartDrawing}
          onLocationRequest={handleLocationRequest}
          onClear={handleClear}
        />

        <div className="relative">
          <div className="absolute top-4 right-4 z-10">
            <MapLayerSwitcher 
              currentStyle={mapStyle}
              onStyleChange={handleStyleChange}
            />
          </div>
          <MapContainer
            mapError={mapError}
            mapRef={mapContainer}
            className="map-container h-[400px] sm:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden map-glow"
          />
        </div>
        
        <AreaConversions
          calculatedArea={calculatedArea}
          selectedUnit={selectedUnit}
        />
        
        {calculatedArea && (
          <div className="glass-panel p-4 sm:p-6 rounded-xl sm:rounded-2xl">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Save className="h-4 w-4 sm:h-5 sm:w-5 text-[hsl(var(--neon-blue))]" />
              Save This Area
            </h3>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Input
                placeholder="Enter area name (e.g., North Field, Plot A)"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                className="flex-1 glass-panel border-[hsl(var(--neon-blue))]/30 text-sm sm:text-base"
              />
              <Button 
                onClick={handleSaveArea}
                className="glass-panel bg-gradient-to-r from-[hsl(var(--neon-blue))] to-[hsl(var(--neon-purple))] hover:opacity-90 transition-all hover:scale-105 border-0 w-full sm:w-auto text-sm sm:text-base"
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
