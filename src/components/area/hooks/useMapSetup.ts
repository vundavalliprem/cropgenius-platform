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

  const calculateArea = useCallback(() => {
    if (!drawRef.current || !mountedRef.current) return;
    
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
    if (!mapContainer.current || !isReady) return;

    let mapInstance: mapboxgl.Map | null = null;
    let drawInstance: MapboxDraw | null = null;

    const initialize = () => {
      if (!mountedRef.current || !mapContainer.current) return;

      try {
        // Initialize map
        mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [-95.7129, 37.0902],
          zoom: 15,
        });

        // Initialize draw control
        drawInstance = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          }
        });

        // Add controls only if mounted
        if (mountedRef.current) {
          mapInstance.addControl(drawInstance);
          mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        }

        // Set refs after successful initialization
        mapRef.current = mapInstance;
        drawRef.current = drawInstance;

        // Event handlers
        const handleDrawCreate = () => {
          if (mountedRef.current) calculateArea();
        };
        const handleDrawDelete = () => {
          if (mountedRef.current) calculateArea();
        };
        const handleDrawUpdate = () => {
          if (mountedRef.current) calculateArea();
        };

        // Add event listeners
        mapInstance.on('draw.create', handleDrawCreate);
        mapInstance.on('draw.delete', handleDrawDelete);
        mapInstance.on('draw.update', handleDrawUpdate);

        return () => {
          if (!mountedRef.current) return;

          // Remove event listeners
          mapInstance?.off('draw.create', handleDrawCreate);
          mapInstance?.off('draw.delete', handleDrawDelete);
          mapInstance?.off('draw.update', handleDrawUpdate);

          // Remove controls and map
          if (drawInstance && mapInstance) {
            mapInstance.removeControl(drawInstance);
          }
          mapInstance?.remove();

          // Clear refs
          mapRef.current = null;
          drawRef.current = null;
        };
      } catch (error) {
        console.error('Map initialization error:', error);
        if (mapInstance) {
          mapInstance.remove();
        }
        mapRef.current = null;
        drawRef.current = null;
      }
    };

    const cleanup = initialize();

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