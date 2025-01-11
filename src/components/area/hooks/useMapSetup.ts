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
    if (!mapContainer.current || !isReady || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [-95.7129, 37.0902],
      zoom: 15,
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      }
    });

    map.addControl(draw);
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const handleDrawCreate = () => calculateArea();
    const handleDrawDelete = () => calculateArea();
    const handleDrawUpdate = () => calculateArea();

    map.on('draw.create', handleDrawCreate);
    map.on('draw.delete', handleDrawDelete);
    map.on('draw.update', handleDrawUpdate);

    mapRef.current = map;
    drawRef.current = draw;

    return () => {
      map.off('draw.create', handleDrawCreate);
      map.off('draw.delete', handleDrawDelete);
      map.off('draw.update', handleDrawUpdate);
      
      if (drawRef.current) {
        map.removeControl(drawRef.current);
        drawRef.current = null;
      }
      
      map.remove();
      mapRef.current = null;
    };
  }, [isReady, calculateArea]);

  return {
    mapRef,
    drawRef,
  };
}