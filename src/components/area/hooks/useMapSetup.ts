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

    let map: mapboxgl.Map | null = null;
    let draw: MapboxDraw | null = null;

    try {
      map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-95.7129, 37.0902],
        zoom: 15,
      });

      draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        }
      });

      map.addControl(draw);
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Store references
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

      return () => {
        if (map) {
          map.off('draw.create', handleDrawCreate);
          map.off('draw.delete', handleDrawDelete);
          map.off('draw.update', handleDrawUpdate);
          
          if (draw) {
            map.removeControl(draw);
          }
          
          map.remove();
        }
        
        mapRef.current = null;
        drawRef.current = null;
      };
    } catch (error) {
      console.error('Error setting up map:', error);
      if (map) {
        map.remove();
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