import { supabase } from "@/integrations/supabase/client";

export interface TomTomRoute {
  summary: {
    lengthInMeters: number;
    travelTimeInSeconds: number;
    trafficDelayInSeconds: number;
    departureTime: string;
    arrivalTime: string;
  };
  legs: Array<{
    points: Array<{
      latitude: number;
      longitude: number;
    }>;
  }>;
}

export async function calculateRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<TomTomRoute | null> {
  try {
    const { data: { TOMTOM_API_KEY }, error } = await supabase
      .functions.invoke('get-secret', {
        body: { name: 'TOMTOM_API_KEY' }
      });

    if (error || !TOMTOM_API_KEY) {
      console.error('Failed to get TomTom API key:', error);
      return null;
    }

    const response = await fetch(
      `https://api.tomtom.com/routing/1/calculateRoute/${startLat},${startLng}:${endLat},${endLng}/json?` +
      new URLSearchParams({
        key: TOMTOM_API_KEY,
        traffic: 'true',
        travelMode: 'truck',
      })
    );

    if (!response.ok) {
      throw new Error('Failed to calculate route');
    }

    const data = await response.json();
    return data.routes[0];
  } catch (error) {
    console.error('Error calculating route:', error);
    return null;
  }
}

export async function searchLocation(query: string): Promise<Array<{
  lat: number;
  lng: number;
  address: string;
}>> {
  try {
    const { data: { TOMTOM_API_KEY }, error } = await supabase
      .functions.invoke('get-secret', {
        body: { name: 'TOMTOM_API_KEY' }
      });

    if (error || !TOMTOM_API_KEY) {
      console.error('Failed to get TomTom API key:', error);
      return [];
    }

    const response = await fetch(
      `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?` +
      new URLSearchParams({
        key: TOMTOM_API_KEY,
        limit: '5',
      })
    );

    if (!response.ok) {
      throw new Error('Failed to search location');
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results.map((result: any) => ({
        lat: result.position.lat,
        lng: result.position.lon,
        address: result.address.freeformAddress,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error searching location:', error);
    return [];
  }
}

export async function getTrafficIncidents(
  lat: number,
  lng: number,
  radius: number
): Promise<any[]> {
  try {
    const { data: { TOMTOM_API_KEY }, error } = await supabase
      .functions.invoke('get-secret', {
        body: { name: 'TOMTOM_API_KEY' }
      });

    if (error || !TOMTOM_API_KEY) {
      console.error('Failed to get TomTom API key:', error);
      return [];
    }

    const response = await fetch(
      `https://api.tomtom.com/traffic/services/4/incidentDetails/s3/${lat},${lng}/${radius}.json?` +
      new URLSearchParams({
        key: TOMTOM_API_KEY,
        language: 'en-US',
      })
    );

    if (!response.ok) {
      throw new Error('Failed to get traffic incidents');
    }

    const data = await response.json();
    return data.incidents || [];
  } catch (error) {
    console.error('Error getting traffic incidents:', error);
    return [];
  }
}