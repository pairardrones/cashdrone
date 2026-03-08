'use client'

import { useState } from 'react'

interface ServiceItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
}

export default function SimuladorPage() {
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([
    { id: '1', name: 'Hora de voo', quantity: 1, unitPrice: 200 },
  ])
  const [operationalCosts, setOperationalCosts] = useState({
    transportation: 0,
    equipment: 0,
    insurance: 0,
    licenses: 0,
    other: 0,
  })
  const [profitMargin, setProfitMargin] = useState(30)
  const [taxRate, setTaxRate] = useState(0)

  const addServiceItem = () => {
    const newItem: ServiceItem = {
      id: Date.now().toString(),
      name: 'Novo serviço',
      quantity: 1,
      unitPrice: 0,
    }
    setServiceItems([...serviceItems, newItem])
  }

  const removeServiceItem = (id: string) => {
    setServiceItems(serviceItems.filter((item) => item.id !== id))
  }

  const updateServiceItem = (id: string, field: keyof ServiceItem, value: string | number) => {
    setServiceItems(
      serviceItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const calculateSubtotal = () => {
    return serviceItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  }

  const calculateOperationalTotal = () => {
    return Object.values(operationalCosts).reduce((sum, value) => sum + value, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const operational = calculateOperationalTotal()
    const baseTotal = subtotal + operational
    const profit = baseTotal * (profitMargin / 100)
    const withProfit = baseTotal + profit
    const taxes = withProfit * (taxRate / 100)
    return withProfit + taxes
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Simulador de Preços</h1>
        <p className="text-gray-600 mt-2">
          Calcule o preço ideal para seus serviços de drone com base em custos e margem de lucro.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário */}
        <div className="lg:col-span-2 space-y-6">
          {/* Serviços */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Serviços</h2>
              <button
                onClick={addServiceItem}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Adicionar item
              </button>
            </div>

            <div className="space-y-4">
              {serviceItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateServiceItem(item.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome do serviço"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateServiceItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div className="col-span-3">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">R$</span>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateServiceItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                    {serviceItems.length > 1 && (
                      <button
                        onClick={() => removeServiceItem(item.id)}
                        className="ml-2 text-red-500 hover:text-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between">
              <span className="font-medium text-gray-700">Subtotal serviços:</span>
              <span className="font-bold text-gray-900">{formatCurrency(calculateSubtotal())}</span>
            </div>
          </div>

          {/* Custos Operacionais */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Custos Operacionais</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transporte
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">R$</span>
                  <input
                    type="number"
                    value={operationalCosts.transportation}
                    onChange={(e) =>
                      setOperationalCosts({ ...operationalCosts, transportation: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipamentos extras
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">R$</span>
                  <input
                    type="number"
                    value={operationalCosts.equipment}
                    onChange={(e) =>
                      setOperationalCosts({ ...operationalCosts, equipment: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seguro
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">R$</span>
                  <input
                    type="number"
                    value={operationalCosts.insurance}
                    onChange={(e) =>
                      setOperationalCosts({ ...operationalCosts, insurance: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Licenças/Autorizações
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">R$</span>
                  <input
                    type="number"
                    value={operationalCosts.licenses}
                    onChange={(e) =>
                      setOperationalCosts({ ...operationalCosts, licenses: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outros custos
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">R$</span>
                  <input
                    type="number"
                    value={operationalCosts.other}
                    onChange={(e) =>
                      setOperationalCosts({ ...operationalCosts, other: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between">
              <span className="font-medium text-gray-700">Total custos operacionais:</span>
              <span className="font-bold text-gray-900">{formatCurrency(calculateOperationalTotal())}</span>
            </div>
          </div>

          {/* Margem e Impostos */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Margem e Impostos</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Margem de lucro (%)
                </label>
                <input
                  type="number"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alíquota de impostos (%)
                </label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Serviços:</span>
                <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Custos operacionais:</span>
                <span className="font-medium">{formatCurrency(calculateOperationalTotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Base:</span>
                <span className="font-medium">{formatCurrency(calculateSubtotal() + calculateOperationalTotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lucro ({profitMargin}%):</span>
                <span className="font-medium text-green-600">
                  +{formatCurrency((calculateSubtotal() + calculateOperationalTotal()) * (profitMargin / 100))}
                </span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Impostos ({taxRate}%):</span>
                  <span className="font-medium text-red-600">
                    +{formatCurrency(
                      ((calculateSubtotal() + calculateOperationalTotal()) * (1 + profitMargin / 100)) * (taxRate / 100)
                    )}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Preço Final Sugerido</p>
                <p className="text-4xl font-bold text-blue-600">
                  {formatCurrency(calculateTotal())}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Salvar Simulação
              </button>
              <button className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                Exportar PDF
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-500 text-center">
              💡 Dica: O preço sugerido é uma referência. Considere também o valor de mercado e a complexidade do projeto.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}