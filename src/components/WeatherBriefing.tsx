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

interface WeatherBriefingProps {
  onWeatherLoad?: (data: WeatherData) => void
}

export default function WeatherBriefing({ onWeatherLoad }: WeatherBriefingProps) {
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
        if (onWeatherLoad) {
          onWeatherLoad(data)
        }
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
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        🌤️ Briefing Meteorológico
      </h2>

      {/* Formulário de busca */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitude
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
            Longitude
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
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Consultando...' : 'Consultar Meteorologia'}
      </button>

      {/* Resultados */}
      {weather && (
        <div className="mt-6 space-y-4">
          {/* Condição geral */}
          <div className={`p-4 rounded-lg border ${getConditionColor(weather.condicao)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Condição Geral</p>
                <p className="text-2xl font-bold">{weather.condicao}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">{weather.data}</p>
                <p className="text-lg font-medium">{weather.horario}</p>
              </div>
            </div>
          </div>

          {/* Dados principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Temperatura</p>
              <p className="text-xl font-bold text-gray-900">
                {weather.temperatura}°C
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Umidade</p>
              <p className="text-xl font-bold text-gray-900">
                {weather.umidade}%
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Visibilidade</p>
              <p className="text-xl font-bold text-gray-900">
                {(weather.visibilidade / 1000).toFixed(1)} km
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Teto</p>
              <p className="text-xl font-bold text-gray-900">
                {weather.teto} m
              </p>
            </div>
          </div>

          {/* Vento */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">💨 Vento</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-700">Velocidade</p>
                <p className={`text-xl font-bold ${getWindWarning(weather.vento_velocidade, weather.vento_rajada)}`}>
                  {weather.vento_velocidade} km/h
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Direção</p>
                <p className="text-xl font-bold text-gray-900">
                  {weather.vento_direcao}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Rajadas</p>
                <p className={`text-xl font-bold ${getWindWarning(weather.vento_velocidade, weather.vento_rajada)}`}>
                  {weather.vento_rajada} km/h
                </p>
              </div>
            </div>
          </div>

          {/* Alertas */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Alertas</h3>
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

          {/* Referência */}
          <div className="text-xs text-gray-500 mt-4">
            <p>Fonte: REDEMET - Rede de Meteorologia do Comando da Aeronáutica</p>
            <p>Dados simulados para demonstração. Em produção, usar API oficial.</p>
          </div>
        </div>
      )}
    </div>
  )
}