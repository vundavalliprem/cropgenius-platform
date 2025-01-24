import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name } = await req.json()
    
    if (!name) {
      throw new Error('Secret name is required')
    }

    // Get the secret from environment variables
    const secretValue = Deno.env.get(name)
    if (!secretValue) {
      throw new Error(`Secret '${name}' not found`)
    }

    return new Response(
      JSON.stringify({ 
        [name]: secretValue 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error in get-secret function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        status: 404,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})