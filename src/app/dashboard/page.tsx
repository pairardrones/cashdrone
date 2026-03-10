import Link from 'next/link'

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Acesse os módulos do Ca$hDrone.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-gray-700"
            >
              Início
            </Link>
            <Link
              href="/dashboard/faq"
              className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-gray-700"
            >
              FAQ (Dashboard)
            </Link>
            <Link
              href="/faq"
              className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-gray-700"
            >
              FAQ (Público)
            </Link>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/dashboard/simulador"
            className="bg-white border rounded-lg p-5 hover:shadow-sm transition"
          >
            <div className="text-2xl mb-2">📊</div>
            <h2 className="font-semibold text-gray-900">Simulador de Preços</h2>
            <p className="text-sm text-gray-600 mt-1">
              Calcule preço ideal por serviço.
            </p>
          </Link>

          <Link
            href="/dashboard/meteorologia"
            className="bg-white border rounded-lg p-5 hover:shadow-sm transition"
          >
            <div className="text-2xl mb-2">🌤️</div>
            <h2 className="font-semibold text-gray-900">Briefing Meteorológico</h2>
            <p className="text-sm text-gray-600 mt-1">
              Consulte condições para voo.
            </p>
          </Link>

          <Link
            href="/dashboard/aro-sora"
            className="bg-white border rounded-lg p-5 hover:shadow-sm transition"
          >
            <div className="text-2xl mb-2">⚠️</div>
            <h2 className="font-semibold text-gray-900">ARO/SORA</h2>
            <p className="text-sm text-gray-600 mt-1">
              Avaliação de risco operacional.
            </p>
          </Link>

          <Link
            href="/dashboard/clientes"
            className="bg-white border rounded-lg p-5 hover:shadow-sm transition"
          >
            <div className="text-2xl mb-2">👥</div>
            <h2 className="font-semibold text-gray-900">CRM de Clientes</h2>
            <p className="text-sm text-gray-600 mt-1">
              Propostas, histórico e relacionamento.
            </p>
          </Link>

          <Link
            href="/dashboard/marketplace"
            className="bg-white border rounded-lg p-5 hover:shadow-sm transition"
          >
            <div className="text-2xl mb-2">🛒</div>
            <h2 className="font-semibold text-gray-900">Marketplace</h2>
            <p className="text-sm text-gray-600 mt-1">
              Oportunidades e oferta de serviços.
            </p>
          </Link>

          <Link
            href="/dashboard/faq"
            className="bg-white border rounded-lg p-5 hover:shadow-sm transition"
          >
            <div className="text-2xl mb-2">📚</div>
            <h2 className="font-semibold text-gray-900">FAQ Legislação</h2>
            <p className="text-sm text-gray-600 mt-1">
              ANAC, DECEA, ANATEL e boas práticas.
            </p>
          </Link>
        </section>
      </div>
    </main>
  )
}