import React from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { useMapInitialization } from './hooks/useMapInitialization';
import { useAreaCalculation } from './hooks/useAreaCalculation';
import { useMapSetup } from './hooks/useMapSetup';
import { MapControls } from './components/MapControls';
import { AreaDisplay } from './components/AreaDisplay';
import { MapContainer } from './components/MapContainer';

interface AreaMapProps {
  className?: string;
}

export function AreaMap({ className }: AreaMapProps) {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const { isReady, error: mapError } = useMapInitialization();
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

  const handleStartDrawing = () => {
    if (drawRef.current) {
      const drawControl = document.querySelector('.mapbox-gl-draw_polygon');
      if (drawControl) {
        (drawControl as HTMLElement).click();
      }
    }
  };

  const handleClear = () => {
    if (drawRef.current) {
      const trashControl = document.querySelector('.mapbox-gl-draw_trash');
      if (trashControl) {
        (trashControl as HTMLElement).click();
        setCalculatedArea(null);
      }
    }
  };

  const handleLocationRequest = async () => {
    try {
      const coords = await requestLocation();
      if (!coords || !mapRef.current) return;

      mapRef.current.setCenter(coords);
      mapRef.current.setZoom(15);
    } catch (error) {
      console.error('Location request error:', error);
    }
  };

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
        <MapContainer
          mapError={mapError}
          mapRef={mapContainer}
        />
      </div>
    </Card>
  );
}