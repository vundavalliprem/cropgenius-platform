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
    const draw = drawRef.current;
    if (!draw) return;
    
    const data = draw.getAll();
    if (!data?.features.length) {
      setCalculatedArea(null);
      return;
    }
    const area = turf.area(data);
    const multiplier = UNITS[selectedUnit].multiplier;
    setCalculatedArea(Number((area * multiplier).toFixed(2)));
  }, [selectedUnit, setCalculatedArea]);

  useEffect(() => {
    if (!mapContainer.current || !isReady) return;

    let localMap: mapboxgl.Map | null = null;
    let localDraw: MapboxDraw | null = null;

    try {
      // Initialize map
      localMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-95.7129, 37.0902],
        zoom: 15,
      });

      // Initialize draw control
      localDraw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        }
      });

      // Add controls
      localMap.addControl(localDraw);
      localMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Set refs
      mapRef.current = localMap;
      drawRef.current = localDraw;

      // Event handlers
      const handleDrawCreate = () => calculateArea();
      const handleDrawDelete = () => calculateArea();
      const handleDrawUpdate = () => calculateArea();

      // Add event listeners
      localMap.on('draw.create', handleDrawCreate);
      localMap.on('draw.delete', handleDrawDelete);
      localMap.on('draw.update', handleDrawUpdate);

      // Cleanup function
      return () => {
        if (localMap) {
          // Remove event listeners first
          localMap.off('draw.create', handleDrawCreate);
          localMap.off('draw.delete', handleDrawDelete);
          localMap.off('draw.update', handleDrawUpdate);

          // Then remove controls if they exist
          if (localDraw) {
            localMap.removeControl(localDraw);
          }
          
          // Finally remove the map
          localMap.remove();
        }

        // Clear refs
        mapRef.current = null;
        drawRef.current = null;
      };
    } catch (error) {
      console.error('Error setting up map:', error);
      // Clean up any partially initialized resources
      if (localMap) {
        localMap.remove();
      }
      mapRef.current = null;
      drawRef.current = null;
    }
  }, [isReady, calculateArea, mapContainer]);

  return {
    mapRef,
    drawRef,
  };
}