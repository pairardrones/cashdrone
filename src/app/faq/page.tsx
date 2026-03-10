import Link from 'next/link'

export default function FAQPage() {
  const faqs = [
    {
      question: 'O que é o Ca$hDrone?',
      answer:
        'Ca$hDrone é uma plataforma completa para operadores de drones brasileiros, oferecendo ferramentas de gestão, marketplace de serviços e recursos especializados para operações seguras e eficientes.',
    },
    {
      question: 'Quais recursos são gratuitos?',
      answer:
        'O simulador de preços de serviços e os checklists operacionais (pré-voo, voo e pós-voo) são gratuitos para todos os usuários.',
    },
    {
      question: 'O que está incluído no plano Pro?',
      answer:
        'O plano Pro inclui CRM de clientes, acesso ao marketplace, emissão de ARO/SORA, briefing meteorológico, chatbot de legislação e suporte prioritário.',
    },
    {
      question: 'Como funciona a emissão de ARO/SORA?',
      answer:
        'A plataforma guia você pelo processo de Avaliação de Risco Operacional conforme o RBAC 100, coletando dados da operação e gerando documentação adequada para conformidade regulatória.',
    },
    {
      question: 'Posso cancelar minha assinatura a qualquer momento?',
      answer:
        'Sim, você pode cancelar sua assinatura a qualquer momento. O acesso aos recursos Pro permanece ativo até o final do período pago.',
    },
    {
      question: 'O briefing meteorológico usa dados oficiais?',
      answer:
        'Sim, integramos com o REDEMET (Rede de Meteorologia do Comando da Aeronáutica) para fornecer dados meteorológicos oficiais e atualizados para suas operações.',
    },
    {
      question: 'Como funciona o marketplace?',
      answer:
        'O marketplace conecta operadores de drones a clientes em todo o Brasil. Você pode oferecer seus serviços ou contratar operadores qualificados para projetos específicos.',
    },
    {
      question: 'A plataforma está em conformidade com a LGPD?',
      answer:
        'Sim, seguimos as diretrizes da Lei Geral de Proteção de Dados. Seus dados são tratados com segurança e privacidade, e você tem controle sobre suas informações.',
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Ca$hDrone
          </Link>
          <div className="space-x-4">
            <Link href="/" className="text-gray-600 hover:text-blue-600">
              Início
            </Link>
            <Link href="/auth/login" className="text-gray-600 hover:text-blue-600">
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

      <section className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
          Perguntas Frequentes
        </h1>
        <p className="text-gray-600 text-center mb-12">
          Tire suas dúvidas sobre o Ca$hDrone
        </p>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {faq.question}
              </h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Não encontrou sua dúvida? Entre em contato.
          </p>
          <Link
            href="mailto:suporte@cashdrone.com.br"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Falar com suporte
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2025 Ca$hDrone - Hub de Serviços e Gestão</p>
          <p className="mt-2 text-sm">Plataforma para operadores de drones brasileiros</p>
        </div>
      </footer>
    </main>
  )
}