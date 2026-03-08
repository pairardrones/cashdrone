'use client'

import { useState } from 'react'

interface ChecklistItem {
  id: string
  text: string
  checked: boolean
}

interface Checklist {
  id: string
  name: string
  category: string
  items: ChecklistItem[]
}

const defaultChecklists: Checklist[] = [
  {
    id: 'pre-flight',
    name: 'Pré-Voo',
    category: 'pre-flight',
    items: [
      { id: '1', text: 'Verificar condições meteorológicas (vento, visibilidade, chuva)', checked: false },
      { id: '2', text: 'Verificar espaço aéreo e restrições (DECEA/ANAC)', checked: false },
      { id: '3', text: 'Confirmar autorizações necessárias (ANAC, proprietários)', checked: false },
      { id: '4', text: 'Verificar nível de bateria da aeronave (mínimo 100%)', checked: false },
      { id: '5', text: 'Verificar nível de bateria do controle remoto', checked: false },
      { id: '6', text: 'Inspecionar visualmente a aeronave (hélices, estrutura, motor)', checked: false },
      { id: '7', text: 'Verificar funcionamento da câmera e gimbal', checked: false },
      { id: '8', text: 'Calibrar bússola se necessário', checked: false },
      { id: '9', text: 'Verificar GPS e número de satélites (mínimo 6)', checked: false },
      { id: '10', text: 'Configurar limite de altura e distância máxima', checked: false },
      { id: '11', text: 'Verificar cartão de memória e espaço disponível', checked: false },
      { id: '12', text: 'Definir ponto de retorno (RTH)', checked: false },
      { id: '13', text: 'Verificar área de decolagem (obstáculos, pessoas, animais)', checked: false },
      { id: '14', text: 'Briefing com equipe/cliente sobre o voo', checked: false },
      { id: '15', text: 'Equipamentos de segurança prontos (extintor, kit primeiros socorros)', checked: false },
    ],
  },
  {
    id: 'flight',
    name: 'Durante o Voo',
    category: 'flight',
    items: [
      { id: '1', text: 'Decolagem suave e controlada', checked: false },
      { id: '2', text: 'Verificar resposta dos comandos', checked: false },
      { id: '3', text: 'Monitorar nível de bateria constantemente', checked: false },
      { id: '4', text: 'Manter linha de visual (VLOS) com a aeronave', checked: false },
      { id: '5', text: 'Monitorar altura e distância máximas', checked: false },
      { id: '6', text: 'Verificar qualidade do sinal de vídeo', checked: false },
      { id: '7', text: 'Observar condições meteorológicas durante o voo', checked: false },
      { id: '8', text: 'Manter distância segura de obstáculos e pessoas', checked: false },
      { id: '9', text: 'Monitorar tempo de voo restante', checked: false },
      { id: '10', text: 'Verificar telemetria da aeronave no app', checked: false },
    ],
  },
  {
    id: 'post-flight',
    name: 'Pós-Voo',
    category: 'post-flight',
    items: [
      { id: '1', text: 'Pouso suave e controlado em área segura', checked: false },
      { id: '2', text: 'Desligar aeronave e controle remoto', checked: false },
      { id: '3', text: 'Inspecionar aeronave visualmente (danos, desgastes)', checked: false },
      { id: '4', text: 'Verificar temperatura dos motores e bateria', checked: false },
      { id: '5', text: 'Registrar tempo de voo no caderno de bordo', checked: false },
      { id: '6', text: 'Transferir fotos/vídeos para backup', checked: false },
      { id: '7', text: 'Verificar integridade dos arquivos gravados', checked: false },
      { id: '8', text: 'Limpar hélices e corpo da aeronave', checked: false },
      { id: '9', text: 'Recarregar baterias para próximo voo', checked: false },
      { id: '10', text: 'Registrar ocorrências ou anomalias no voo', checked: false },
      { id: '11', text: 'Guardar equipamentos em local seguro', checked: false },
      { id: '12', text: 'Finalizar registro operacional', checked: false },
    ],
  },
]

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>(defaultChecklists)
  const [activeTab, setActiveTab] = useState<'pre-flight' | 'flight' | 'post-flight'>('pre-flight')
  const [completedCount, setCompletedCount] = useState(0)

  const toggleItem = (checklistId: string, itemId: string) => {
    setChecklists(
      checklists.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: checklist.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            }
          : checklist
      )
    )
    updateCompletedCount()
  }

  const updateCompletedCount = () => {
    const currentChecklist = checklists.find((c) => c.id === activeTab)
    if (currentChecklist) {
      const completed = currentChecklist.items.filter((item) => item.checked).length
      setCompletedCount(completed)
    }
  }

  const resetChecklist = (checklistId: string) => {
    if (confirm('Deseja limpar todos os itens marcados?')) {
      setChecklists(
        checklists.map((checklist) =>
          checklist.id === checklistId
            ? {
                ...checklist,
                items: checklist.items.map((item) => ({ ...item, checked: false })),
              }
            : checklist
        )
      )
      setCompletedCount(0)
    }
  }

  const getCurrentChecklist = () => {
    return checklists.find((c) => c.id === activeTab)
  }

  const getProgress = () => {
    const current = getCurrentChecklist()
    if (!current) return 0
    const completed = current.items.filter((item) => item.checked).length
    return Math.round((completed / current.items.length) * 100)
  }

  const currentChecklist = getCurrentChecklist()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Checklists Operacionais</h1>
        <p className="text-gray-600 mt-2">
          Garanta operações seguras e conformidade com checklists estruturados.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('pre-flight')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'pre-flight'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🔧 Pré-Voo
        </button>
        <button
          onClick={() => setActiveTab('flight')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'flight'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ✈️ Durante o Voo
        </button>
        <button
          onClick={() => setActiveTab('post-flight')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'post-flight'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📋 Pós-Voo
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progresso</span>
          <span className="text-sm font-medium text-blue-600">{getProgress()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${getProgress()}%` }}
          ></div>
        </div>
        {currentChecklist && (
          <p className="text-xs text-gray-500 mt-2">
            {currentChecklist.items.filter((i) => i.checked).length} de {currentChecklist.items.length} itens verificados
          </p>
        )}
      </div>

      {/* Checklist Items */}
      {currentChecklist && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">{currentChecklist.name}</h2>
            <button
              onClick={() => resetChecklist(currentChecklist.id)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Limpar checklist
            </button>
          </div>

          <ul className="divide-y divide-gray-200">
            {currentChecklist.items.map((item, index) => (
              <li
                key={item.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  item.checked ? 'bg-green-50' : ''
                }`}
                onClick={() => toggleItem(currentChecklist.id, item.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      item.checked
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {item.checked && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <span
                      className={`text-gray-900 ${
                        item.checked ? 'line-through text-gray-500' : ''
                      }`}
                    >
                      {item.text}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-medium text-blue-900">Dica de Segurança</h3>
            <p className="text-sm text-blue-700 mt-1">
              Complete todos os itens do checklist antes de iniciar o voo. Itens não verificados podem representar riscos à segurança da operação.
            </p>
          </div>
        </div>
      </div>

      {/* Compliance Note */}
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex gap-3">
          <span className="text-2xl">📜</span>
          <div>
            <h3 className="font-medium text-gray-900">Conformidade Regulatória</h3>
            <p className="text-sm text-gray-600 mt-1">
              Este checklist foi elaborado com base nas boas práticas e requisitos do RBAC nº 100 (ANAC) e normas de tráfego aéreo (DECEA). Adapte conforme as especificidades da sua operação.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}