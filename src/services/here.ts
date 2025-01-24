import { supabase } from "@/integrations/supabase/client";

export interface HereRoute {
  sections: Array<{
    summary: {
      length: number;
      duration: number;
      trafficDelay?: number;
    };
    polyline: string;
  }>;
}

async function getHereApiKey(): Promise<string> {
  try {
    const { data, error } = await supabase
      .functions.invoke('get-secret', {
        body: { name: 'HERE_API_KEY' }
      });

    if (error || !data?.HERE_API_KEY) {
      console.error('Failed to get HERE API key:', error);
      throw new Error('Failed to get HERE API key');
    }

    return data.HERE_API_KEY;
  } catch (error) {
    console.error('Error getting HERE API key:', error);
    throw new Error('Failed to get HERE API key. Please make sure the API key is configured.');
  }
}

export async function searchLocation(query: string): Promise<Array<{
  lat: number;
  lng: number;
  address: string;
}>> {
  if (!query?.trim()) {
    return [];
  }

  try {
    const apiKey = await getHereApiKey();
    
    const response = await fetch(
      `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(query)}&apiKey=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search location');
    }

    const data = await response.json();
    
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    return data.items.map((item: any) => ({
      lat: item.position.lat,
      lng: item.position.lng,
      address: item.address.label,
    }));
  } catch (error) {
    console.error('Error searching location:', error);
    throw error;
  }
}

export async function calculateRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<HereRoute | null> {
  try {
    const apiKey = await getHereApiKey();

    const response = await fetch(
      `https://router.hereapi.com/v8/routes?transportMode=car&origin=${startLat},${startLng}&destination=${endLat},${endLng}&return=polyline,summary&apiKey=${apiKey}`
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

export async function getTrafficIncidents(
  lat: number,
  lng: number,
  radius: number
): Promise<any[]> {
  try {
    const apiKey = await getHereApiKey();

    const response = await fetch(
      `https://traffic.ls.hereapi.com/traffic/6.2/incidents.json?apiKey=${apiKey}&prox=${lat},${lng},${radius}`
    );

    if (!response.ok) {
      throw new Error('Failed to get traffic incidents');
    }

    const data = await response.json();
    return data.TRAFFIC_ITEMS?.TRAFFIC_ITEM || [];
  } catch (error) {
    console.error('Error getting traffic incidents:', error);
    return [];
  }
}
