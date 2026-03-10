import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, email } = await request.json()

    if (!priceId || !userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields', details: { priceId, userId, email } },
        { status: 400 }
      )
    }

    // Buscar customer existente
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle()

    let customerId = subscription?.stripe_customer_id

    // Criar customer se não existir
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {supabaseUserId: userId,
},
      })
      customerId = customer.id

      // Salvar customer_id no banco
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        status: 'inactive',
      })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/assinatura?success=true`,
      cancel_url: `${appUrl}/dashboard/assinatura?canceled=true`,
      metadata: { supabaseUserId: userId}
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url})

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    )
  }
}