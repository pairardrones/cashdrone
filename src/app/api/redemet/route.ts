import { NextRequest, NextResponse } from 'next/server'

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const localidade = searchParams.get('localidade')

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude e longitude são obrigatórias' },
        { status: 400 }
      )
    }

    // Simular dados do REDEMET (em produção, usar API real)
    // API real: https://api-redemet.decea.gov.br
    const weatherData = await simulateREDEMETData(parseFloat(lat), parseFloat(lon), localidade || 'Não informado')

    return NextResponse.json(weatherData)
  } catch (error) {
    console.error('Erro ao buscar dados meteorológicos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados meteorológicos' },
      { status: 500 }
    )
  }
}

// Função para simular dados do REDEMET
// Em produção, substituir por chamada real à API
async function simulateREDEMETData(lat: number, lon: number, localidade: string): Promise<WeatherData> {
  // Gerar dados simulados baseados na localização
  const now = new Date()
  const hour = now.getHours()
  
  // Simular variação baseada na hora do dia
  const tempBase = 25 + Math.sin((hour - 6) * Math.PI / 12) * 8
  const humidityBase = 60 - Math.sin((hour - 6) * Math.PI / 12) * 20
  
  // Simular vento baseado na localização (mais vento em áreas costeiras)
  const isCoastal = Math.abs(lon + 45) < 5 // Proximidade do litoral
  const windBase = isCoastal ? 15 : 8
  
  // Gerar velocidade do vento com componente aleatória
  const windSpeed = Math.round(windBase + Math.random() * 10)
  const windGust = Math.round(windSpeed * 1.5 + Math.random() * 5)
  
  // Direção do vento (simulada)
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const windDirection = directions[Math.floor(Math.random() * directions.length)]
  
  // Visibilidade (simulada)
  const visibility = Math.round(5000 + Math.random() * 5000)
  
  // Teto (simulado)
  const ceiling = Math.round(1500 + Math.random() * 3500)
  
  // Determinar condição geral
  let condition = 'Boa'
  const alerts: string[] = []
  
  // Verificar condições adversas
  if (windSpeed > 20) {
    condition = 'Desfavorável'
    alerts.push('⚠️ Vento forte: velocidade acima de 20 km/h')
  } else if (windSpeed > 15) {
    condition = 'Atenção'
    alerts.push('⚡ Vento moderado: atenção com rajadas')
  }
  
  if (windGust > 30) {
    alerts.push('⚠️ Rajadas fortes: acima de 30 km/h')
    if (condition === 'Boa') condition = 'Atenção'
  }
  
  if (visibility < 3000) {
    alerts.push('⚠️ Visibilidade reduzida: abaixo de 3 km')
    condition = 'Desfavorável'
  }
  
  if (ceiling < 500) {
    alerts.push('⚠️ Teto baixo: abaixo de 500m')
    condition = 'Desfavorável'
  }
  
  if (humidityBase > 85) {
    alerts.push('💧 Umidade elevada: possibilidade de neblina')
  }
  
  // Alerta para operação BVLS
  if (windSpeed > 10 || windGust > 15) {
    alerts.push('🚁 Condições desfavoráveis para drones leves')
  }
  
  return {
    localidade,
    data: now.toLocaleDateString('pt-BR'),
    horario: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    temperatura: Math.round(tempBase * 10) / 10,
    umidade: Math.round(humidityBase),
    vento_velocidade: windSpeed,
    vento_direcao: windDirection,
    vento_rajada: windGust,
    visibilidade: visibility,
    teto: ceiling,
    condicao: condition,
    alertas: alerts.length > 0 ? alerts : ['✅ Condições favoráveis para operação']
  }
}