'use client'

import { useState } from 'react'

interface WeatherData {
  localidade: string
  data: string
  horario: string
  temperatura: number
  umidade: number
  vento_velocidade: number
  vento_direcao: string
  vento_rajada: number
  visibilidade: number
  teto: number
  condicao: string
  alertas: string[]
}

export default function MeteorologiaPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [localidade, setLocalidade] = useState('')

  const fetchWeather = async () => {
    if (!lat || !lon) {
      alert('Informe latitude e longitude')
      return
    }

    setLoading(true)

    try {
      const params = new URLSearchParams({
        lat,
        lon,
        localidade: localidade || 'Não informado'
      })

      const response = await fetch(`/api/redemet?${params}`)
      const data = await response.json()

      if (response.ok) {
        setWeather(data)
      } else {
        alert('Erro ao buscar dados meteorológicos')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao buscar dados meteorológicos')
    } finally {
      setLoading(false)
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Boa':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'Atenção':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Desfavorável':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getWindWarning = (speed: number, gust: number) => {
    if (speed > 20 || gust > 30) return 'text-red-600'
    if (speed > 15 || gust > 20) return 'text-yellow-600'
    return 'text-gray-900'
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🌤️ Briefing Meteorológico</h1>
        <p className="text-gray-600 mt-2">
          Consulte condições meteorológicas para sua operação de drone
        </p>
      </div>

      {/* Formulário de busca */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Consultar Condições Meteorológicas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude *
            </label>
            <input
              type="text"
              placeholder="Ex: -21.1774"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude *
            </label>
            <input
              type="text"
              placeholder="Ex: -47.8103"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Localidade (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Ribeirão Preto"
              value={localidade}
              onChange={(e) => setLocalidade(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={fetchWeather}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Consultando...' : 'Consultar Meteorologia'}
        </button>
      </div>

      {/* Resultados */}
      {weather && (
        <div className="space-y-4">
          {/* Condição geral */}
          <div className={`p-6 rounded-lg border ${getConditionColor(weather.condicao)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm opacity-80">Condição Geral</p>
                <p className="text-3xl font-bold">{weather.condicao}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80">{weather.localidade}</p>
                <p className="text-sm">{weather.data}</p>
                <p className="text-xl font-medium">{weather.horario}</p>
              </div>
            </div>
          </div>

          {/* Dados principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <p className="text-sm text-gray-600">🌡️ Temperatura</p>
              <p className="text-2xl font-bold text-gray-900">
                {weather.temperatura}°C
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <p className="text-sm text-gray-600">💧 Umidade</p>
              <p className="text-2xl font-bold text-gray-900">
                {weather.umidade}%
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <p className="text-sm text-gray-600">👁️ Visibilidade</p>
              <p className="text-2xl font-bold text-gray-900">
                {(weather.visibilidade / 1000).toFixed(1)} km
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <p className="text-sm text-gray-600">☁️ Teto</p>
              <p className="text-2xl font-bold text-gray-900">
                {weather.teto} m
              </p>
            </div>
          </div>

          {/* Vento */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-4 text-lg">💨 Vento</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-blue-700">Velocidade</p>
                <p className={`text-2xl font-bold ${getWindWarning(weather.vento_velocidade, weather.vento_rajada)}`}>
                  {weather.vento_velocidade} km/h
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Direção</p>
                <p className="text-2xl font-bold text-gray-900">
                  {weather.vento_direcao}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Rajadas</p>
                <p className={`text-2xl font-bold ${getWindWarning(weather.vento_velocidade, weather.vento_rajada)}`}>
                  {weather.vento_rajada} km/h
                </p>
              </div>
            </div>
          </div>

          {/* Alertas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">⚠️ Alertas</h3>
            <div className="space-y-2">
              {weather.alertas.map((alerta, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    alerta.includes('✅')
                      ? 'bg-green-50 border border-green-200'
                      : alerta.includes('⚠️')
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}
                >
                  <p className="text-sm">{alerta}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Referência */}
          <div className="text-xs text-gray-500 mt-4 bg-gray-50 p-3 rounded">
            <p><strong>Fonte:</strong> REDEMET - Rede de Meteorologia do Comando da Aeronáutica</p>
            <p className="mt-1">Dados simulados para demonstração. Em produção, usar API oficial do REDEMET.</p>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="font-medium text-blue-900">Como usar</h3>
            <p className="text-sm text-blue-700 mt-1">
              Informe a latitude e longitude do local da operação para obter condições meteorológicas atuais.
              Consulte sempre o briefing antes de voar para garantir condições seguras.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}