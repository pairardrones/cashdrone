import { createClient } from '@supabase/supabase-js'

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive' | 'unpaid' | 'paused'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function isUserPro(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('status,current_period_end')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return false

  const status = data.status as SubscriptionStatus
  if (status !== 'active' && status !== 'trialing') return false

  if (!data.current_period_end) return true
  return new Date(data.current_period_end).getTime() > Date.now()
}