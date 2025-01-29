const getSecret = async (name: string): Promise<string> => {
  try {
    console.log(`Attempting to retrieve secret: ${name}`);
    const { data, error } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/secrets?name=eq.${encodeURIComponent(name)}`,
      {
        headers: {
          apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
      }
    ).then(res => res.json());

    if (error) {
      console.error(`Database error retrieving secret '${name}':`, error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!data?.[0]?.value) {
      console.error(`Secret '${name}' not found in database`);
      throw new Error(`Secret '${name}' not found`);
    }

    console.log(`Successfully retrieved secret: ${name}`);
    return data[0].value;
  } catch (error) {
    console.error(`Error retrieving secret '${name}':`, error.message);
    throw new Error(`Failed to retrieve secret '${name}'`);
  }
};

export { getSecret };