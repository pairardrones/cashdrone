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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Helper para acessar campos de período de forma segura
function getPeriodTimestamps(sub: any) {
  return {
    current_period_start: sub.current_period_start ?? 0,
    current_period_end: sub.current_period_end ?? 0,
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const userId = session.metadata?.supabaseUserId || session.metadata?.userId
        if (!userId) {
          return NextResponse.json({ error: 'Missing userId in metadata' }, { status: 400 })
        }

        const subscriptionId = session.subscription as string | null
        const customerId = session.customer as string | null

        if (!subscriptionId || !customerId) {
          return NextResponse.json(
            { error: 'Missing subscriptionId or customerId' },
            { status: 400 }
          )
        }

        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId)
        const subAny = stripeSub as any
        const { current_period_start, current_period_end } = getPeriodTimestamps(subAny)
        const priceId = subAny.items?.data?.[0]?.price?.id || null

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          stripe_price_id: priceId,
          status: subAny.status,
          current_period_start: new Date(current_period_start * 1000).toISOString(),
          current_period_end: new Date(current_period_end * 1000).toISOString(),
          cancel_at_period_end: subAny.cancel_at_period_end,
        })

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (sub?.user_id) {
          const subAny = subscription as any
          const { current_period_start, current_period_end } = getPeriodTimestamps(subAny)

          await supabase
            .from('subscriptions')
            .update({
              status: subAny.status,
              current_period_start: new Date(current_period_start * 1000).toISOString(),
              current_period_end: new Date(current_period_end * 1000).toISOString(),
              cancel_at_period_end: subAny.cancel_at_period_end,
            })
            .eq('user_id', sub.user_id)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (sub?.user_id) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'inactive',
              stripe_subscription_id: null,
              stripe_price_id: null,
            })
            .eq('user_id', sub.user_id)
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (sub?.user_id) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('user_id', sub.user_id)
        }

        break
      }

      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error?.message },
      { status: 500 }
    )
  }
}