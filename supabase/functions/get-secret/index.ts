import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getSecret } from '../_shared/secrets.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { name } = await req.json()
    
    if (!name) {
      console.error('Secret name is required');
      return new Response(
        JSON.stringify({ error: 'Secret name is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Only allow specific secrets to be accessed from the client
    const allowedSecrets = ['HERE_API_KEY'];
    if (!allowedSecrets.includes(name)) {
      console.warn(`Attempted access to unauthorized secret: ${name}`);
      return new Response(
        JSON.stringify({ error: 'Unauthorized secret access' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    try {
      const value = await getSecret(name);
      console.log(`Successfully retrieved secret: ${name}`);
      return new Response(
        JSON.stringify({ value }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error(`Error retrieving secret ${name}:`, error.message);
      return new Response(
        JSON.stringify({ error: `Secret '${name}' not found` }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  } catch (error) {
    console.error('Error in get-secret function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})