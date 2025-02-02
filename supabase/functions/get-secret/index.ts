import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name } = await req.json()
    
    if (!name) {
      throw new Error('Secret name is required')
    }

    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Query the secrets table with proper error handling
    const { data, error } = await supabaseClient
      .from('secrets')
      .select('value')
      .eq('name', name)
      .maybeSingle() // This ensures we get null if no rows, or error if multiple rows

    if (error) {
      console.error(`Database error for secret '${name}':`, error)
      throw error
    }

    if (!data) {
      console.error(`Secret '${name}' not found`)
      throw new Error(`Secret '${name}' not found`)
    }

    return new Response(
      JSON.stringify({ value: data.value }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in get-secret function:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})