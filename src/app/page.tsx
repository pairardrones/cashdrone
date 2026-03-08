import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Ca$hDrone</h1>
          <div className="space-x-4">
            <Link
              href="/auth/login"
              className="text-gray-600 hover:text-blue-600"
            >
              Entrar
            </Link>
            <Link
              href="/auth/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Cadastrar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Hub de Serviços e Gestão
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          A plataforma completa para operadores de drones brasileiros. 
          Gestão, marketplace e ferramentas especializadas em um só lugar.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/auth/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700"
          >
            Começar grátis
          </Link>
          <Link
            href="#features"
            className="border border-gray-300 px-8 py-3 rounded-lg text-lg hover:bg-gray-50"
          >
            Ver recursos
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Recursos</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📊</div>
            <h4 className="text-xl font-semibold mb-2">Simulador de Preços</h4>
            <p className="text-gray-600">
              Calcule o preço ideal para seus serviços com base em custos e margem.
            </p>
            <span className="inline-block mt-4 text-sm text-green-600 font-medium">
              Gratuito
            </span>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">👥</div>
            <h4 className="text-xl font-semibold mb-2">CRM de Clientes</h4>
            <p className="text-gray-600">
              Gerencie seus clientes, propostas e histórico de serviços.
            </p>
            <span className="inline-block mt-4 text-sm text-blue-600 font-medium">
              Assinatura
            </span>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🛒</div>
            <h4 className="text-xl font-semibold mb-2">Marketplace</h4>
            <p className="text-gray-600">
              Encontre e ofereça serviços de drones em todo o Brasil.
            </p>
            <span className="inline-block mt-4 text-sm text-blue-600 font-medium">
              Assinatura
            </span>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📋</div>
            <h4 className="text-xl font-semibold mb-2">Checklists</h4>
            <p className="text-gray-600">
              Checklists de pré-voo, voo e pós-voo para operações seguras.
            </p>
            <span className="inline-block mt-4 text-sm text-green-600 font-medium">
              Gratuito
            </span>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">⚠️</div>
            <h4 className="text-xl font-semibold mb-2">ARO/SORA</h4>
            <p className="text-gray-600">
              Emissão de Avaliação de Risco Operacional conforme RBAC 100.
            </p>
            <span className="inline-block mt-4 text-sm text-blue-600 font-medium">
              Assinatura
            </span>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🌤️</div>
            <h4 className="text-xl font-semibold mb-2">Briefing Meteorológico</h4>
            <p className="text-gray-600">
              Condições meteorológicas em tempo real via REDEMET.
            </p>
            <span className="inline-block mt-4 text-sm text-blue-600 font-medium">
              Assinatura
            </span>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Planos</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-gray-200">
              <h4 className="text-xl font-semibold mb-2">Gratuito</h4>
              <p className="text-gray-600 mb-4">Para começar</p>
              <p className="text-4xl font-bold mb-6">R$ 0</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Simulador de preços
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Checklists operacionais
                </li>
              </ul>
              <Link
                href="/auth/register"
                className="block text-center border border-gray-300 py-3 rounded-lg hover:bg-gray-50"
              >
                Começar grátis
              </Link>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-blue-500">
              <h4 className="text-xl font-semibold mb-2">Pro</h4>
              <p className="text-gray-600 mb-4">Para profissionais</p>
              <p className="text-4xl font-bold mb-2">R$ 47,90<span className="text-lg font-normal">/mês</span></p>
              <p className="text-sm text-gray-500 mb-6">ou R$ 479,00/ano (2 meses grátis)</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Tudo do plano gratuito
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  CRM de clientes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Marketplace
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  ARO/SORA
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Briefing meteorológico
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Chatbot de legislação
                </li>
              </ul>
              <Link
                href="/auth/register"
                className="block text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                Assinar agora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2025 Ca$hDrone - Hub de Serviços e Gestão</p>
          <p className="mt-2 text-sm">Plataforma para operadores de drones brasileiros</p>
        </div>
      </footer>
    </main>
  )
}