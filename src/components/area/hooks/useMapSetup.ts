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
  const mountedRef = useRef(true);

  // Calculate area when polygon is drawn/updated
  const calculateArea = useCallback(() => {
    if (!drawRef.current || !mountedRef.current) return;
    
    try {
      const data = drawRef.current.getAll();
      if (!data?.features.length) {
        setCalculatedArea(null);
        return;
      }
      const area = turf.area(data);
      const multiplier = UNITS[selectedUnit].multiplier;
      setCalculatedArea(Number((area * multiplier).toFixed(2)));
    } catch (error) {
      console.error('Error calculating area:', error);
      setCalculatedArea(null);
    }
  }, [selectedUnit, setCalculatedArea]);

  // Initialize map and draw controls
  useEffect(() => {
    if (!mapContainer.current || !isReady) return;

    const initializeMap = () => {
      if (!mountedRef.current || !mapContainer.current) return null;

      try {
        // Create map instance
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [-95.7129, 37.0902],
          zoom: 15,
        });

        // Create draw control
        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          }
        });

        // Set up event handlers
        const handleDrawCreate = () => mountedRef.current && calculateArea();
        const handleDrawDelete = () => mountedRef.current && calculateArea();
        const handleDrawUpdate = () => mountedRef.current && calculateArea();

        // Add controls and event listeners only if still mounted
        if (mountedRef.current) {
          map.addControl(draw);
          map.addControl(new mapboxgl.NavigationControl(), 'top-right');
          
          map.on('draw.create', handleDrawCreate);
          map.on('draw.delete', handleDrawDelete);
          map.on('draw.update', handleDrawUpdate);
        }

        // Store references
        mapRef.current = map;
        drawRef.current = draw;

        // Return cleanup function
        return () => {
          if (!mountedRef.current) return;

          // Remove event listeners
          map.off('draw.create', handleDrawCreate);
          map.off('draw.delete', handleDrawDelete);
          map.off('draw.update', handleDrawUpdate);

          // Remove controls
          if (draw) {
            map.removeControl(draw);
          }
          map.removeControl(new mapboxgl.NavigationControl());

          // Remove map
          map.remove();

          // Clear refs
          mapRef.current = null;
          drawRef.current = null;
        };
      } catch (error) {
        console.error('Map initialization error:', error);
        return null;
      }
    };

    // Initialize map and store cleanup function
    const cleanup = initializeMap();

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
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