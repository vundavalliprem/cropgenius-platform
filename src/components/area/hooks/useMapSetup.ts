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
    if (!mapContainer.current || !isReady) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [-95.7129, 37.0902],
      zoom: 15,
    });

    const drawInstance = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      }
    });

    mapInstance.addControl(drawInstance);
    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

    mapRef.current = mapInstance;
    drawRef.current = drawInstance;

    const handleDrawCreate = () => calculateArea();
    const handleDrawDelete = () => calculateArea();
    const handleDrawUpdate = () => calculateArea();

    mapInstance.on('draw.create', handleDrawCreate);
    mapInstance.on('draw.delete', handleDrawDelete);
    mapInstance.on('draw.update', handleDrawUpdate);

    return () => {
      mapInstance.off('draw.create', handleDrawCreate);
      mapInstance.off('draw.delete', handleDrawDelete);
      mapInstance.off('draw.update', handleDrawUpdate);
      
      if (drawInstance) {
        mapInstance.removeControl(drawInstance);
      }
      
      mapInstance.remove();
      mapRef.current = null;
      drawRef.current = null;
    };
  }, [isReady, calculateArea, mapContainer]);

  return {
    mapRef,
    drawRef,
  };
}