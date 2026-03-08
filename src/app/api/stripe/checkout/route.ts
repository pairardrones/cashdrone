import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, email } = await request.json()

    console.log('=== STRIPE CHECKOUT DEBUG ===')
    console.log('priceId:', priceId)
    console.log('userId:', userId)
    console.log('email:', email)

    if (!priceId || !userId || !email) {
      console.error('Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields', details: { priceId, userId, email } },
        { status: 400 }
      )
    }

    // Verificar se já existe customer no Stripe
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    console.log('Existing subscription:', subscription)
    console.log('Subscription query error:', subError)

    let customerId = subscription?.stripe_customer_id

    // Criar customer se não existir
    if (!customerId) {
      console.log('Creating new Stripe customer...')
      const customer = await stripe.customers.create({
        email,
        metadata: {
          supabaseUserId: userId,
        },
      })
      customerId = customer.id
      console.log('Created customer:', customerId)

      // Salvar customer_id no banco
      const { error: upsertError } = await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        status: 'inactive',
      })
      
      if (upsertError) {
        console.error('Error saving customer to database:', upsertError)
      }
    }

    // Criar sessão de checkout
    console.log('Creating checkout session...')
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/assinatura?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/assinatura?canceled=true`,
      metadata: {
        userId,
      },
    })

    console.log('Session created:', session.id)
    console.log('Session URL:', session.url)

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error: any) {
    console.error('=== STRIPE CHECKOUT ERROR ===')
    console.error('Error message:', error.message)
    console.error('Error type:', error.type)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}