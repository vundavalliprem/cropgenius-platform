import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import { UNITS, AreaUnit } from './useAreaCalculation';

interface UseMapSetupProps {
  isReady: boolean;
  selectedUnit: AreaUnit;
  setCalculatedArea: (area: number | null) => void;
  mapContainer: React.RefObject<HTMLDivElement>;
}

export function useMapSetup({
  isReady,
  selectedUnit,
  setCalculatedArea,
  mapContainer
}: UseMapSetupProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  const calculateArea = useCallback(() => {
    if (!drawRef.current) return;
    
    const data = drawRef.current.getAll();
    if (!data?.features.length) {
      setCalculatedArea(null);
      return;
    }
    const area = turf.area(data);
    const multiplier = UNITS[selectedUnit].multiplier;
    setCalculatedArea(Number((area * multiplier).toFixed(2)));
  }, [selectedUnit, setCalculatedArea]);

  useEffect(() => {
    let map: mapboxgl.Map | null = null;
    let draw: MapboxDraw | null = null;

    if (mapContainer.current && isReady) {
      // Initialize map
      map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-95.7129, 37.0902],
        zoom: 15,
      });

      // Initialize draw control
      draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        }
      });

      // Add controls
      map.addControl(draw);
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Set refs after initialization
      mapRef.current = map;
      drawRef.current = draw;

      // Event handlers
      const handleDrawCreate = () => calculateArea();
      const handleDrawDelete = () => calculateArea();
      const handleDrawUpdate = () => calculateArea();

      // Add event listeners
      map.on('draw.create', handleDrawCreate);
      map.on('draw.delete', handleDrawDelete);
      map.on('draw.update', handleDrawUpdate);

      // Cleanup function
      return () => {
        map?.off('draw.create', handleDrawCreate);
        map?.off('draw.delete', handleDrawDelete);
        map?.off('draw.update', handleDrawUpdate);
        
        if (draw && map) {
          map.removeControl(draw);
        }
        
        if (map) {
          map.remove();
        }

        // Clear refs
        mapRef.current = null;
        drawRef.current = null;
      };
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [isReady, calculateArea, mapContainer]);

  return {
    mapRef,
    drawRef,
  };
}