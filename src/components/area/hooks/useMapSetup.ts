import { useMapInstance } from './useMapInstance';
import { useDrawControls } from './useDrawControls';
import { AreaUnit } from './useAreaCalculation';
import tt from '@tomtom-international/web-sdk-maps';

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
  const { mapRef, mountedRef } = useMapInstance(mapContainer, isReady);

  // Cast mapRef to the correct TomTom Map type and ensure it's properly typed for the draw controls
  const tomtomMapRef = mapRef as unknown as React.MutableRefObject<tt.Map>;

  const drawRef = useDrawControls({
    mapRef: tomtomMapRef,
    mountedRef,
    onAreaUpdate: setCalculatedArea,
    selectedUnit,
  });

  return {
    mapRef: tomtomMapRef,
    drawRef,
  };
}