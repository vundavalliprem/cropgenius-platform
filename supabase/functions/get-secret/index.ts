import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseKey!)
    
    const { name } = await req.json()
    console.log('Fetching secret:', name)

    const { data: secret, error: dbError } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', name)
      .maybeSingle()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error(`Failed to fetch secret: ${dbError.message}`)
    }

    if (!secret) {
      console.error('Secret not found:', name)
      throw new Error(`Secret not found: ${name}`)
    }

    console.log('Secret retrieved successfully')
    
    return new Response(
      JSON.stringify({ value: secret.value }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in get-secret function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})