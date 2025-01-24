import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

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

    // Get the secret from Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', name)
      .maybeSingle()

    if (error) {
      console.error(`Error fetching secret '${name}':`, error)
      throw new Error(`Error fetching secret '${name}'`)
    }

    if (!data) {
      throw new Error(`Secret '${name}' not found`)
    }

    return new Response(
      JSON.stringify({ 
        [name]: data.value 
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