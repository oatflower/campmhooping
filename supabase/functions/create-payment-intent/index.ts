// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// SECURITY: Restrict CORS to allowed origins
// @ts-ignore
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') || 'http://localhost:5173').split(',')

function getCorsHeaders(req: Request) {
    const origin = req.headers.get('origin') || ''
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Credentials': 'true',
    }
}

serve(async (req: Request) => {
    const corsHeaders = getCorsHeaders(req)

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // @ts-ignore
        const supabaseClient = createClient(
            // @ts-ignore
            Deno.env.get('SUPABASE_URL') ?? '',
            // @ts-ignore
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // SECURITY: Verify user is authenticated
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

        if (authError || !user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized. Please log in.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
            )
        }

        const { booking } = await req.json()

        // VALIDATION: Check required fields
        if (!booking || !booking.campId || !booking.dateRange || !booking.guests) {
            throw new Error('Missing required booking data')
        }

        // VALIDATION: Validate date range
        const checkIn = new Date(booking.dateRange.from)
        const checkOut = new Date(booking.dateRange.to)

        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
            throw new Error('Invalid date format')
        }

        if (checkOut <= checkIn) {
            throw new Error('Check-out date must be after check-in date')
        }

        // VALIDATION: Calculate and validate nights
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

        if (nights < 1 || nights > 365) {
            throw new Error('Booking duration must be between 1 and 365 nights')
        }

        // VALIDATION: Validate guest count
        const adults = parseInt(booking.guests.adults) || 1
        if (adults < 1 || adults > 50) {
            throw new Error('Invalid guest count (must be 1-50)')
        }

        // 1. Fetch Camp Pricing from DB (Secure Calculation)
        const { data: camp, error: campError } = await supabaseClient
            .from('camps')
            .select('price_per_night, max_guests, name')
            .eq('id', booking.campId)
            .single()

        if (campError || !camp) {
            throw new Error('Camp not found')
        }

        // VALIDATION: Check guest capacity
        if (camp.max_guests && adults > camp.max_guests) {
            throw new Error(`Maximum ${camp.max_guests} guests allowed for this camp`)
        }

        // SECURITY: Check for overlapping bookings
        const { data: existingBookings, error: overlapError } = await supabaseClient
            .from('bookings')
            .select('id')
            .eq('camp_id', booking.campId)
            .neq('status', 'cancelled')
            .or(`start_date.lte.${checkOut.toISOString().split('T')[0]},end_date.gte.${checkIn.toISOString().split('T')[0]}`)
            .gte('end_date', checkIn.toISOString().split('T')[0])
            .lte('start_date', checkOut.toISOString().split('T')[0])

        if (!overlapError && existingBookings && existingBookings.length > 0) {
            throw new Error('These dates are not available. Please choose different dates.')
        }

        // 2. Calculate Total (Server-side ONLY)
        const totalAmount = camp.price_per_night * nights * adults

        // VALIDATION: Ensure valid total
        if (!isFinite(totalAmount) || totalAmount <= 0) {
            throw new Error('Invalid total amount calculated')
        }

        // 3. Create Payment Intent
        // TODO: Replace with real Stripe integration
        // const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
        // const paymentIntent = await stripe.paymentIntents.create({
        //     amount: Math.round(totalAmount * 100), // Convert to smallest currency unit
        //     currency: 'thb',
        //     metadata: { campId: booking.campId, userId: user.id }
        // })

        // Mock response for development
        const clientSecret = "pi_mock_secret_" + crypto.randomUUID()

        return new Response(
            JSON.stringify({
                clientSecret,
                calculatedTotal: totalAmount,
                nights,
                pricePerNight: camp.price_per_night,
                guests: adults
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error: any) {
        // SECURITY: Sanitize error messages
        const safeMessage = error.message.includes('database') || error.message.includes('SQL')
            ? 'An internal error occurred'
            : error.message

        return new Response(
            JSON.stringify({ error: safeMessage }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})

