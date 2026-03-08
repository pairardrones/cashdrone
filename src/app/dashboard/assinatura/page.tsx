'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'

interface Subscription {
  status: string
  stripe_price_id: string | null
  current_period_end: string | null
}

// ⚠️ SUBSTITUA OS PRICE IDs PELOS SEUS IDs REAIS DO STRIPE
const plans = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    priceId: null,
    features: [
      'Simulador de preços',
      'Checklists operacionais',
    ],
  },
  {
    id: 'pro-monthly',
    name: 'Pro Mensal',
    price: 47.90,
    priceId: 'price_1T8Y38KDyMLN3zQBn5YuYGI1', // ⚠️ Substitua pelo seu Price ID mensal
    features: [
      'Tudo do plano gratuito',
      'CRM de clientes',
      'Marketplace',
      'ARO/SORA',
      'Briefing meteorológico',
      'Chatbot de legislação',
    ],
  },
  {
    id: 'pro-yearly',
    name: 'Pro Anual',
    price: 479.00,
    priceId: 'price_1T8Y3mKDyMLN3zQBov4FAxHE', // ⚠️ Substitua pelo seu Price ID anual
    features: [
      'Tudo do plano mensal',
      '2 meses grátis',
      'Suporte prioritário',
    ],
  },
]

export default function AssinaturaPage() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSubscription()
    }
  }, [user])

  const fetchSubscription = async () => {
    const { data } = await supabase
      .from('subscriptions')
      .select('status, stripe_price_id, current_period_end')
      .eq('user_id', user?.id)
      .single()

    if (data) {
      setSubscription(data)
    }
    setLoading(false)
  }

  // ============================================================
  // 🔴 FUNÇÃO ALTERADA - handleSubscribe (LINHAS 80-120)
  // ============================================================
  const handleSubscribe = async (priceId: string) => {
    if (!user || !priceId) return

    setProcessing(true)

    try {
      console.log('Iniciando checkout para priceId:', priceId)
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          email: user.email,
        }),
      })

      const data = await response.json()
      
      console.log('Resposta da API:', data)

      if (!response.ok) {
        console.error('Erro na API:', data)
        alert(`Erro: ${data.error || data.details || 'Falha ao criar sessão de checkout'}`)
        return
      }

      if (data.url) {
        console.log('Redirecionando para:', data.url)
        window.location.href = data.url
      } else {
        console.error('URL não retornada. Data:', data)
        alert('Erro: URL de checkout não retornada. Verifique os logs do servidor.')
      }
    } catch (error) {
      console.error('Erro ao criar assinatura:', error)
      alert('Erro ao processar assinatura. Verifique o console.')
    } finally {
      setProcessing(false)
    }
  }
  // ============================================================
  // 🔴 FIM DA FUNÇÃO ALTERADA
  // ============================================================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Assinatura</h1>
        <p className="text-gray-600 mt-2">
          Gerencie seu plano e assinatura.
        </p>
      </div>

      {/* Status atual */}
      {subscription && subscription.status === 'active' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h3 className="font-medium text-green-900">Assinatura Ativa</h3>
              <p className="text-sm text-green-700">
                Próxima cobrança: {subscription.current_period_end ? formatDate(subscription.current_period_end) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = subscription?.stripe_price_id === plan.priceId
          const isFreePlan = plan.id === 'free'
          const isProPlan = plan.id !== 'free'

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-sm border overflow-hidden ${
                isProPlan && !isCurrentPlan ? 'border-2 border-blue-500' : ''
              }`}
            >
              {plan.id === 'pro-yearly' && (
                <div className="bg-blue-600 text-white text-center py-1 text-sm font-medium">
                  Mais popular - 2 meses grátis
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-gray-500 text-sm mt-1">
                  {isFreePlan ? 'Para começar' : 'Acesso completo'}
                </p>

                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatCurrency(plan.price)}
                  </span>
                  {isProPlan && (
                    <span className="text-gray-500">
                      /{plan.id === 'pro-monthly' ? 'mês' : 'ano'}
                    </span>
                  )}
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-lg bg-gray-100 text-gray-500 font-medium"
                    >
                      Plano atual
                    </button>
                  ) : isFreePlan ? (
                    <button
                      disabled={subscription?.status !== 'active'}
                      className="w-full py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
                    >
                      {subscription?.status === 'active' ? 'Downgrade' : 'Plano atual'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan.priceId!)}
                      disabled={processing}
                      className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {processing ? 'Processando...' : 'Assinar'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          💡 Todos os planos incluem atualizações automáticas. Você pode cancelar a qualquer momento. 
          Após o cancelamento, o acesso permanece até o final do período pago.
        </p>
      </div>
    </div>
  )
}