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
  const eventsAttachedRef = useRef(false);

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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !isReady || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [-95.7129, 37.0902],
      zoom: 15,
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [isReady]);

  // Initialize draw controls and event listeners
  useEffect(() => {
    if (!mapRef.current || !isReady || eventsAttachedRef.current) return;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      }
    });

    drawRef.current = draw;
    mapRef.current.addControl(draw);
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add event listeners
    mapRef.current.on('draw.create', calculateArea);
    mapRef.current.on('draw.delete', calculateArea);
    mapRef.current.on('draw.update', calculateArea);

    eventsAttachedRef.current = true;

    return () => {
      if (mapRef.current && drawRef.current) {
        mapRef.current.off('draw.create', calculateArea);
        mapRef.current.off('draw.delete', calculateArea);
        mapRef.current.off('draw.update', calculateArea);
        mapRef.current.removeControl(drawRef.current);
        drawRef.current = null;
        eventsAttachedRef.current = false;
      }
    };
  }, [isReady, calculateArea]);

  return {
    mapRef,
    drawRef,
  };
}