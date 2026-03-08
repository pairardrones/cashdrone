'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import WeatherBriefing from '@/components/WeatherBriefing'

interface ARO {
  id: string
  operation_type: string
  operation_date: string
  location: string
  drone_model: string
  risk_level: string
  status: string
  created_at: string
}

const operationTypes = [
  { value: 'photography', label: 'Fotografia Aérea' },
  { value: 'video', label: 'Filmagem/Video' },
  { value: 'inspection', label: 'Inspeção' },
  { value: 'mapping', label: 'Mapeamento/Topografia' },
  { value: 'agriculture', label: 'Agricultura de Precisão' },
  { value: 'construction', label: 'Construção Civil' },
  { value: 'events', label: 'Eventos' },
  { value: 'surveillance', label: 'Vigilância/Monitoramento' },
  { value: 'delivery', label: 'Entrega/Logística' },
  { value: 'research', label: 'Pesquisa Científica' },
  { value: 'other', label: 'Outro' },
]

const flightTypes = [
  { value: 'VLOS', label: 'VLOS - Visual Line of Sight' },
  { value: 'BVLOS', label: 'BVLOS - Beyond Visual Line of Sight' },
  { value: 'EVLOS', label: 'EVLOS - Extended Visual Line of Sight' },
]

const droneCategories = [
  { value: 'Classe 1', label: 'Classe 1 (até 250g)' },
  { value: 'Classe 2', label: 'Classe 2 (250g a 25kg)' },
  { value: 'Classe 3', label: 'Classe 3 (acima de 25kg)' },
]

const riskFactors = [
  { id: 'populated_area', label: 'Área populada', score: 30 },
  { id: 'controlled_airspace', label: 'Espaço aéreo controlado', score: 25 },
  { id: 'bvlos_operation', label: 'Operação BVLOS', score: 20 },
  { id: 'night_operation', label: 'Operação noturna', score: 15 },
  { id: 'altitude_above_120m', label: 'Altitude acima de 120m', score: 20 },
  { id: 'near_airport', label: 'Proximidade de aeroporto (<5km)', score: 25 },
  { id: 'critical_infrastructure', label: 'Infraestrutura crítica', score: 20 },
  { id: 'adverse_weather', label: 'Condições meteorológicas adversas', score: 15 },
  { id: 'heavy_payload', label: 'Carga pesada (>5kg)', score: 15 },
  { id: 'urban_environment', label: 'Ambiente urbano', score: 20 },
]

const mitigators = [
  { id: 'parachute', label: 'Paraquedas de emergência', reduces: 15 },
  { id: 'geofencing', label: 'Geofencing configurado', reduces: 10 },
  { id: 'redundancy', label: 'Sistemas redundantes', reduces: 15 },
  { id: 'trained_observer', label: 'Observador treinado', reduces: 10 },
  { id: 'flight_plan', label: 'Plano de voo aprovado', reduces: 10 },
  { id: 'insurance', label: 'Seguro de RC', reduces: 5 },
  { id: 'emergency_procedures', label: 'Procedimentos de emergência', reduces: 10 },
  { id: 'weather_monitoring', label: 'Monitoramento meteorológico', reduces: 5 },
  { id: 'ground_station', label: 'Estação de solo dedicada', reduces: 10 },
  { id: 'flight_termination', label: 'Sistema de terminação de voo', reduces: 15 },
]

export default function AROPage() {
  const { user } = useAuth()
  const [aros, setAROs] = useState<ARO[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    operation_type: '',
    operation_date: '',
    location: '',
    latitude: '',
    longitude: '',
    altitude_max: '120',
    flight_type: 'VLOS',
    drone_model: '',
    drone_serial: '',
    drone_weight: '',
    drone_category: 'Classe 2',
    observations: '',
  })

  const [selectedRiskFactors, setSelectedRiskFactors] = useState<string[]>([])
  const [selectedMitigators, setSelectedMitigators] = useState<string[]>([])
  const [riskScore, setRiskScore] = useState(0)
  const [riskLevel, setRiskLevel] = useState('Baixo')

  useEffect(() => {
    if (user) {
      fetchAROs()
    }
  }, [user])

  const fetchAROs = async () => {
    const { data } = await supabase
      .from('aro_sora')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })

    if (data) {
      setAROs(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    calculateRisk()
  }, [selectedRiskFactors, selectedMitigators])

  const calculateRisk = () => {
    let score = 0

    selectedRiskFactors.forEach((factorId) => {
      const factor = riskFactors.find((f) => f.id === factorId)
      if (factor) score += factor.score
    })

    selectedMitigators.forEach((mitigatorId) => {
      const mitigator = mitigators.find((m) => m.id === mitigatorId)
      if (mitigator) score -= mitigator.reduces
    })

    score = Math.max(0, score)
    setRiskScore(score)

    if (score <= 20) setRiskLevel('Baixo')
    else if (score <= 40) setRiskLevel('Médio')
    else if (score <= 60) setRiskLevel('Alto')
    else setRiskLevel('Muito Alto')
  }

  const toggleRiskFactor = (factorId: string) => {
    setSelectedRiskFactors((prev) =>
      prev.includes(factorId)
        ? prev.filter((id) => id !== factorId)
        : [...prev, factorId]
    )
  }

  const toggleMitigator = (mitigatorId: string) => {
    setSelectedMitigators((prev) =>
      prev.includes(mitigatorId)
        ? prev.filter((id) => id !== mitigatorId)
        : [...prev, mitigatorId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)

    try {
      const { error } = await supabase.from('aro_sora').insert({
        user_id: user.id,
        operation_type: formData.operation_type,
        operation_date: formData.operation_date,
        location: formData.location,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        altitude_max: formData.altitude_max ? parseInt(formData.altitude_max) : null,
        flight_type: formData.flight_type,
        drone_model: formData.drone_model,
        drone_serial: formData.drone_serial,
        drone_weight: formData.drone_weight ? parseFloat(formData.drone_weight) : null,
        drone_category: formData.drone_category,
        risk_level: riskLevel,
        risk_score: riskScore,
        mitigators: selectedMitigators.map((id) => {
          const m = mitigators.find((mit) => mit.id === id)
          return { id, label: m?.label, reduces: m?.reduces }
        }),
        checklist: selectedRiskFactors.reduce((acc, id) => {
          acc[id] = true
          return acc
        }, {} as Record<string, boolean>),
        observations: formData.observations,
        status: 'Rascunho',
      })

      if (error) {
        console.error('Erro ao salvar ARO:', error)
        alert('Erro ao salvar ARO. Verifique os dados.')
      } else {
        alert('ARO salvo com sucesso!')
        setShowForm(false)
        resetForm()
        fetchAROs()
      }
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      operation_type: '',
      operation_date: '',
      location: '',
      latitude: '',
      longitude: '',
      altitude_max: '120',
      flight_type: 'VLOS',
      drone_model: '',
      drone_serial: '',
      drone_weight: '',
      drone_category: 'Classe 2',
      observations: '',
    })
    setSelectedRiskFactors([])
    setSelectedMitigators([])
    setRiskScore(0)
    setRiskLevel('Baixo')
  }

  const deleteARO = async (id: string) => {
    if (!confirm('Deseja realmente excluir este ARO?')) return

    const { error } = await supabase.from('aro_sora').delete().eq('id', id)

    if (error) {
      alert('Erro ao excluir ARO')
    } else {
      fetchAROs()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return 'bg-green-100 text-green-800'
      case 'Em Análise':
        return 'bg-yellow-100 text-yellow-800'
      case 'Rejeitado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Baixo':
        return 'text-green-600'
      case 'Médio':
        return 'text-yellow-600'
      case 'Alto':
        return 'text-orange-600'
      case 'Muito Alto':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ARO/SORA</h1>
          <p className="text-gray-600 mt-2">
            Avaliação de Risco Operacional conforme RBAC nº 100
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Voltar à Lista' : 'Novo ARO'}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados da Operação */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Dados da Operação
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Operação *
                </label>
                <select
                  required
                  value={formData.operation_type}
                  onChange={(e) =>
                    setFormData({ ...formData, operation_type: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  {operationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data da Operação
                </label>
                <input
                  type="date"
                  value={formData.operation_date}
                  onChange={(e) =>
                    setFormData({ ...formData, operation_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Local da Operação *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Fazenda São João, Ribeirão Preto - SP"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  placeholder="Ex: -21.1774"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  placeholder="Ex: -47.8103"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Altitude Máxima (metros)
                </label>
                <input
                  type="number"
                  value={formData.altitude_max}
                  onChange={(e) =>
                    setFormData({ ...formData, altitude_max: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Voo
                </label>
                <select
                  value={formData.flight_type}
                  onChange={(e) =>
                    setFormData({ ...formData, flight_type: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {flightTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dados da Aeronave */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              🚁 Dados da Aeronave 
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo do Drone *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ex: DJI Mavic 3 Pro"
                  value={formData.drone_model}
                  onChange={(e) =>
                    setFormData({ ...formData, drone_model: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Série
                </label>
                <input
                  type="text"
                  placeholder="Ex: 1ZNBH1K00C0012"
                  value={formData.drone_serial}
                  onChange={(e) =>
                    setFormData({ ...formData, drone_serial: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 0.958"
                  value={formData.drone_weight}
                  onChange={(e) =>
                    setFormData({ ...formData, drone_weight: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria ANAC
                </label>
                <select
                  value={formData.drone_category}
                  onChange={(e) =>
                    setFormData({ ...formData, drone_category: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {droneCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Briefing Meteorológico */}
          <WeatherBriefing 
            onWeatherLoad={(data) => {
              console.log('Dados meteorológicos carregados:', data)
              // Preencher automaticamente campos relevantes
              if (data.alertas.some(a => a.includes('Vento forte'))) {
                const windFactor = riskFactors.find(f => f.id === 'adverse_weather')
                if (windFactor && !selectedRiskFactors.includes('adverse_weather')) {
                  toggleRiskFactor('adverse_weather')
                }
              }
            }}
          />

          {/* Avaliação de Risco */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ⚠️ Fatores de Risco
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Selecione os fatores de risco aplicáveis à operação:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {riskFactors.map((factor) => (
                <label
                  key={factor.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedRiskFactors.includes(factor.id)
                      ? 'bg-red-50 border-red-300'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedRiskFactors.includes(factor.id)}
                    onChange={() => toggleRiskFactor(factor.id)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{factor.label}</span>
                  <span className="text-xs text-red-600 font-medium ml-auto">
                    +{factor.score}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Mitigadores */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              🛡️ Mitigadores de Risco
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Selecione as medidas de mitigação implementadas:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mitigators.map((mitigator) => (
                <label
                  key={mitigator.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedMitigators.includes(mitigator.id)
                      ? 'bg-green-50 border-green-300'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMitigators.includes(mitigator.id)}
                    onChange={() => toggleMitigator(mitigator.id)}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{mitigator.label}</span>
                  <span className="text-xs text-green-600 font-medium ml-auto">
                    -{mitigator.reduces}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Resultado da Avaliação */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Resultado da Avaliação
            </h2>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Pontuação</p>
                <p className="text-4xl font-bold text-gray-900">{riskScore}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Nível de Risco</p>
                <p className={`text-4xl font-bold ${getRiskColor(riskLevel)}`}>
                  {riskLevel}
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {riskScore <= 20 && 'Operação de baixo risco. Pode ser realizada com medidas básicas de segurança.'}
                {riskScore > 20 && riskScore <= 40 && 'Operação de risco moderado. Recomenda-se atenção especial aos procedimentos de segurança.'}
                {riskScore > 40 && riskScore <= 60 && 'Operação de alto risco. Exige medidas de mitigação robustas e possível aprovação prévia.'}
                {riskScore > 60 && 'Operação de risco muito alto. Exige análise detalhada e aprovação específica da ANAC/DECEA.'}
              </p>
            </div>
          </div>

          {/* Observações */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              📝 Observações
            </h2>
            <textarea
              rows={4}
              placeholder="Adicione observações relevantes sobre a operação..."
              value={formData.observations}
              onChange={(e) =>
                setFormData({ ...formData, observations: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar ARO'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                resetForm()
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Lista de AROs */}
          {aros.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-gray-500">Nenhum ARO cadastrado.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Criar primeiro ARO
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Operação
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Local
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Risco
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {aros.map((aro) => (
                    <tr key={aro.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {operationTypes.find((t) => t.value === aro.operation_type)?.label || aro.operation_type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {aro.operation_date
                          ? new Date(aro.operation_date).toLocaleDateString('pt-BR')
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {aro.location}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${getRiskColor(aro.risk_level)}`}>
                          {aro.risk_level}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            aro.status
                          )}`}
                        >
                          {aro.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteARO(aro.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <span className="text-2xl">📜</span>
              <div>
                <h3 className="font-medium text-blue-900">Conformidade RBAC nº 100</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Este sistema auxilia na elaboração da Avaliação de Risco Operacional conforme requisitos da ANAC.
                  A aprovação final depende de análise específica do seu caso pela autoridade aeronáutica.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}