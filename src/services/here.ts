import { supabase } from "@/integrations/supabase/client";

export interface HereRoute {
  sections: Array<{
    id: string;
    polyline: string;
    summary: {
      length: number;
      duration: number;
    };
  }>;
}

async function getHereApiKey(): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('get-secret', {
      body: { name: 'HERE_API_KEY' }
    });

    if (error) throw new Error('Failed to get HERE API key');
    if (!data?.value) throw new Error('HERE API key not found');

    return data.value;
  } catch (error) {
    console.error('Error getting HERE API key:', error);
    throw new Error('Failed to get HERE API key');
  }
}

export async function searchLocation(query: string) {
  try {
    const apiKey = await getHereApiKey();
    const response = await fetch(
      `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(query)}&apiKey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Location search failed');
    }

    const data = await response.json();
    return data.items.map((item: any) => ({
      lat: item.position.lat,
      lng: item.position.lng,
      display_name: item.address.label
    }));
  } catch (error) {
    console.error('Error in searchLocation:', error);
    throw error;
  }
}

export async function calculateRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<HereRoute> {
  try {
    const apiKey = await getHereApiKey();
    const response = await fetch(
      `https://router.hereapi.com/v8/routes?transportMode=car&origin=${startLat},${startLng}&destination=${endLat},${endLng}&return=polyline,summary&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Route calculation failed');
    }

    const data = await response.json();
    return data.routes[0];
  } catch (error) {
    console.error('Error calculating route:', error);
    throw error;
  }
}

export async function getTrafficIncidents(lat: number, lng: number, radius: number) {
  try {
    const apiKey = await getHereApiKey();
    const response = await fetch(
      `https://traffic.ls.hereapi.com/traffic/6.2/incidents.json?apiKey=${apiKey}&prox=${lat},${lng},${radius}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch traffic incidents');
    }

    const data = await response.json();
    return data.TRAFFIC_ITEMS?.TRAFFIC_ITEM || [];
  } catch (error) {
    console.error('Error fetching traffic incidents:', error);
    throw error;
  }
}