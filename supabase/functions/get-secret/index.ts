import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { name } = await req.json()
    console.log('Fetching secret:', name)
    
    if (!name) {
      throw new Error('Secret name is required')
    }

    const { data, error } = await supabaseClient
      .from('secrets')
      .select('value')
      .eq('name', name)
      .maybeSingle()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    // Handle case where no secret is found
    if (!data) {
      console.error(`Secret '${name}' not found`)
      return new Response(
        JSON.stringify({ error: `Secret '${name}' not found` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        },
      )
    }

    console.log(`Successfully retrieved secret: ${name}`)
    return new Response(
      JSON.stringify({ [name]: data.value }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in get-secret function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})