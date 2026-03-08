'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bem-vindo ao Ca$hDrone!
        </h1>
        <p className="text-gray-600 mt-2">
          Gerencie seus serviços de drones em um só lugar.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Clientes</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Propostas</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Serviços</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Plano</p>
          <p className="text-xl font-bold text-blue-600">Gratuito</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/simulador"
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">📊</span>
              <div>
                <h3 className="font-medium text-gray-900">Simular Preço</h3>
                <p className="text-sm text-gray-500">Calcule o valor dos seus serviços</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/clientes"
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">👥</span>
              <div>
                <h3 className="font-medium text-gray-900">Novo Cliente</h3>
                <p className="text-sm text-gray-500">Adicione um cliente ao CRM</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/checklists"
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">✅</span>
              <div>
                <h3 className="font-medium text-gray-900">Checklists</h3>
                <p className="text-sm text-gray-500">Operações seguras e organizadas</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Desbloqueie todos os recursos</h3>
            <p className="text-blue-100 mt-1">
              CRM, Marketplace, ARO/SORA, Briefing Meteorológico e mais!
            </p>
          </div>
          <Link
            href="/dashboard/assinatura"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50"
          >
            Assinar Pro
          </Link>
        </div>
      </div>
    </div>
  )
}