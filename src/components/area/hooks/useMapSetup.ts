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
    let mounted = true;

    const initialize = () => {
      if (!mounted || !mapContainer.current) return;

      try {
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

        // Set refs after successful initialization
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
          if (!mounted) return;

          // Remove event listeners
          if (map) {
            map.off('draw.create', handleDrawCreate);
            map.off('draw.delete', handleDrawDelete);
            map.off('draw.update', handleDrawUpdate);
          }

          // Remove controls and map
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
      } catch (error) {
        console.error('Map initialization error:', error);
        if (map) {
          map.remove();
        }
        mapRef.current = null;
        drawRef.current = null;
      }
    };

    const cleanup = initialize();

    return () => {
      mounted = false;
      if (cleanup) {
        cleanup();
      }
    };
  }, [isReady, calculateArea, mapContainer]);

  return {
    mapRef,
    drawRef,
  };
}