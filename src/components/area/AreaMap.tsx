import React from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { Card } from "@/components/ui/dashboard/Card";
import { Button } from "@/components/ui/button";
import { useMapInitialization } from './hooks/useMapInitialization';
import { useAreaCalculation } from './hooks/useAreaCalculation';
import { useMapSetup } from './hooks/useMapSetup';
import { MapControls } from './components/MapControls';
import { AreaDisplay } from './components/AreaDisplay';
import { MapContainer } from './components/MapContainer';
import { Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface AreaMapProps {
  className?: string;
}

export function AreaMap({ className }: AreaMapProps) {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const { isReady, error: mapError } = useMapInitialization();
  const { toast } = useToast();
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

  const handleStartDrawing = React.useCallback(() => {
    if (!drawRef.current) return;
    const drawControl = document.querySelector('.tt-draw_polygon');
    if (drawControl) {
      (drawControl as HTMLElement).click();
    }
  }, [drawRef]);

  const handleClear = React.useCallback(() => {
    if (!drawRef.current) return;
    const trashControl = document.querySelector('.tt-draw_trash');
    if (trashControl) {
      (trashControl as HTMLElement).click();
      setCalculatedArea(null);
    }
  }, [drawRef, setCalculatedArea]);

  const handleLocationRequest = React.useCallback(async () => {
    try {
      const coords = await requestLocation();
      if (!coords || !mapRef.current) return;

      mapRef.current.setCenter(coords);
      mapRef.current.setZoom(15);

      // Add marker for current location
      new tt.Marker()
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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('saved_areas').insert({
        user_id: user.id,
        area: calculatedArea,
        unit: selectedUnit,
        name: `Area ${new Date().toLocaleString()}`,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Area saved successfully!",
      });
    } catch (error) {
      console.error('Save area error:', error);
      toast({
        title: "Error",
        description: "Failed to save area. Please try again.",
        variant: "destructive",
      });
    }
  }, [calculatedArea, selectedUnit, toast]);

  return (
    <Card title="Area Calculator" description="Draw or track field boundaries" className={className}>
      <div className="space-y-4">
        <MapControls
          isReady={isReady}
          selectedUnit={selectedUnit}
          onUnitChange={setSelectedUnit}
          onStartDrawing={handleStartDrawing}
          onLocationRequest={handleLocationRequest}
          onClear={handleClear}
        />
        <AreaDisplay
          calculatedArea={calculatedArea}
          selectedUnit={selectedUnit}
        />
        {calculatedArea && (
          <Button 
            onClick={handleSaveArea}
            className="w-full sm:w-auto"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Area
          </Button>
        )}
        <MapContainer
          mapError={mapError}
          mapRef={mapContainer}
          className="map-container"
        />
      </div>
    </Card>
  );
}