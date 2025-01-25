import { supabase } from "@/integrations/supabase/client";

async function getHereApiKey(): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('get-secret', {
      body: { name: 'HERE_API_KEY' }
    });

    if (error || !data?.value) {
      console.error('Error getting HERE API key:', error);
      throw new Error('Failed to get HERE API key');
    }

    return data.value;
  } catch (error) {
    console.error('Error in getHereApiKey:', error);
    throw error;
  }
}

export async function searchLocation(query: string): Promise<Array<{ lat: number; lng: number; display_name: string }>> {
  if (!query.trim()) return [];

  try {
    const apiKey = await getHereApiKey();
    const params = new URLSearchParams({
      q: query,
      apiKey: apiKey
    });

    const response = await fetch(`https://geocode.search.hereapi.com/v1/geocode?${params.toString()}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Location search failed:', errorText);
      throw new Error('Location search failed');
    }

    const data = await response.json();
    return (data.items || []).map((item: any) => ({
      lat: item.position.lat,
      lng: item.position.lng,
      display_name: item.title
    }));
  } catch (error) {
    console.error('Error in searchLocation:', error);
    return [];
  }
}