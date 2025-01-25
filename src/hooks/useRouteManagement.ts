import { useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { calculateRoute, getTrafficIncidents, searchLocation } from '@/services/here';
import type { HereRoute } from '@/services/here';
import { useToast } from "@/hooks/use-toast";

export function useRouteManagement() {
  const [route, setRoute] = useState<HereRoute | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sourceLocation, setSourceLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const { toast } = useToast();
  const markersRef = { current: [] as mapboxgl.Marker[] };
  let routeSource: mapboxgl.GeoJSONSource | null = null;
  let currentMap: mapboxgl.Map | null = null;

  const handleMapLoad = (map: mapboxgl.Map) => {
    currentMap = map;
    routeSource = map.getSource('route') as mapboxgl.GeoJSONSource;
  };

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  const handlePlanRoute = async () => {
    if (!sourceLocation || !destinationLocation || !currentMap || !routeSource) {
      toast({
        title: "Missing Information",
        description: "Please enter both source and destination locations.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const sourceResults = await searchLocation(sourceLocation);
      const destResults = await searchLocation(destinationLocation);

      if (!sourceResults.length || !destResults.length) {
        throw new Error('Could not find one or both locations');
      }

      const sourceCoords = sourceResults[0];
      const destCoords = destResults[0];

      const routeData = await calculateRoute(
        sourceCoords.lat,
        sourceCoords.lng,
        destCoords.lat,
        destCoords.lng
      );

      setRoute(routeData);

      const coordinates = routeData.sections[0].polyline.split(',').map(coord => {
        const [lat, lng] = coord.split(':');
        return [parseFloat(lng), parseFloat(lat)];
      });

      routeSource.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates
        }
      });

      clearMarkers();

      const sourceMarker = new mapboxgl.Marker({ color: '#22c55e' })
        .setLngLat([sourceCoords.lng, sourceCoords.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<div class="p-2">${sourceLocation}</div>`))
        .addTo(currentMap);
      
      const destMarker = new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat([destCoords.lng, destCoords.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<div class="p-2">${destinationLocation}</div>`))
        .addTo(currentMap);

      markersRef.current = [sourceMarker, destMarker];

      const bounds = new mapboxgl.LngLatBounds();
      coordinates.forEach(coord => bounds.extend(coord as [number, number]));
      currentMap.fitBounds(bounds, { padding: 50 });

      const incidents = await getTrafficIncidents(
        (sourceCoords.lat + destCoords.lat) / 2,
        (sourceCoords.lng + destCoords.lng) / 2,
        50000
      );

      incidents.forEach(incident => {
        const marker = new mapboxgl.Marker({ color: '#f59e0b' })
          .setLngLat([incident.LOCATION.GEOLOC.LONGITUDE, incident.LOCATION.GEOLOC.LATITUDE])
          .setPopup(new mapboxgl.Popup().setHTML(
            `<div class="p-2">
              <h3 class="font-medium">${incident.TRAFFIC_ITEM_TYPE_DESC}</h3>
              <p class="text-sm">${incident.TRAFFIC_ITEM_DESCRIPTION?.[0]?.value || 'No description available'}</p>
            </div>`
          ))
          .addTo(currentMap);
        markersRef.current.push(marker);
      });

      toast({
        title: "Route Planned",
        description: "Route has been calculated and displayed on the map.",
      });

    } catch (error) {
      console.error('Error planning route:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to plan route",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    route,
    isLoading,
    sourceLocation,
    destinationLocation,
    setSourceLocation,
    setDestinationLocation,
    handlePlanRoute,
    handleMapLoad
  };
}