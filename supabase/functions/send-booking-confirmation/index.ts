// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// @ts-ignore
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
// @ts-ignore
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')

// SECURITY: This function is only called by Supabase webhooks, not external requests
// No CORS needed since this is server-to-server communication
const corsHeaders = {
    'Access-Control-Allow-Origin': '', // Webhooks don't need CORS
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BookingPayload {
    type: 'INSERT'
    table: 'bookings'
    record: {
        id: string
        user_id: string
        camp_id: string
        start_date: string
        end_date: string
        total_price: number
        status: string
    }
    schema: 'public'
}

serve(async (req: any) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // SECURITY: Verify webhook secret if configured
        const authHeader = req.headers.get('authorization')
        if (WEBHOOK_SECRET && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized webhook request' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
            )
        }

        const payload: BookingPayload = await req.json()

        // 1. Validate Webhook
        if (!payload.record) {
            throw new Error('Missing record in payload')
        }

        // VALIDATION: Check for required fields
        const { user_id, camp_id, total_price, start_date } = payload.record
        if (!user_id || !camp_id) {
            throw new Error('Invalid booking record')
        }

        // 2. Fetch User and Camp details
        // SECURITY: Using service role only for webhook-triggered system operations
        // This is acceptable since webhooks are internal server-to-server calls
        // @ts-ignore
        const supabaseClient = createClient(
            // @ts-ignore
            Deno.env.get('SUPABASE_URL') ?? '',
            // @ts-ignore
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Service role is OK for internal webhooks
        )

        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('email, name')
            .eq('id', user_id)
            .single()

        const { data: camp } = await supabaseClient
            .from('camps')
            .select('name')
            .eq('id', camp_id)
            .single()

        if (profile?.email && camp?.name) {
            console.log(`Sending email to ${profile.email} for camping at ${camp.name}`)

            // 3. Send Email (Mocking Resend API call)
            /*
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: 'Campy <noreply@campy.com>',
                to: profile.email,
                subject: 'Booking Confirmation',
                html: `<p>Your booking at ${camp.name} is confirmed!</p>`
              })
            })
            */
        }

        return new Response(
            JSON.stringify({ message: "Email processing complete" }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
