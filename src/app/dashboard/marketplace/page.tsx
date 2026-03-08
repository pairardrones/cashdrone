'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

interface Service {
  id: string
  title: string
  description: string | null
  category: string | null
  price: number | null
  location: string | null
  status: string
  user_id: string
  created_at: string
  profiles?: {
    full_name: string | null
    company_name: string | null
  } | null
}

export default function MarketplacePage() {
  const { user } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [myServices, setMyServices] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    location: '',
  })
  const [filterCategory, setFilterCategory] = useState('')

  const categories = [
    'Fotografia Aérea',
    'Filmagem Aérea',
    'Mapeamento',
    'Inspeção',
    'Agricultura',
    'Construção',
    'Imobiliário',
    'Eventos',
    'Outros',
  ]

  useEffect(() => {
    fetchServices()
  }, [myServices, filterCategory])

  const fetchServices = async () => {
    setLoading(true)
    
    let query = supabase
      .from('services')
      .select(`
        *,
        profiles (full_name, company_name)
      `)

    if (myServices && user) {
      query = query.eq('user_id', user.id)
    } else {
      query = query.eq('status', 'active')
    }

    if (filterCategory) {
      query = query.eq('category', filterCategory)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (!error && data) {
      setServices(data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase
      .from('services')
      .insert({
        user_id: user?.id,
        title: formData.title,
        description: formData.description || null,
        category: formData.category || null,
        price: parseFloat(formData.price) || null,
        location: formData.location || null,
        status: 'active',
      })

    if (!error) {
      await fetchServices()
      closeModal()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

      if (!error) {
        setServices(services.filter((s) => s.id !== id))
      }
    }
  }

  const toggleStatus = async (service: Service) => {
    const newStatus = service.status === 'active' ? 'inactive' : 'active'
    
    const { error } = await supabase
      .from('services')
      .update({ status: newStatus })
      .eq('id', service.id)

    if (!error) {
      fetchServices()
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setFormData({
      title: '',
      description: '',
      category: '',
      price: '',
      location: '',
    })
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return 'A combinar'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-600 mt-2">
            Encontre e ofereça serviços de drones em todo o Brasil.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Oferecer Serviço
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMyServices(false)}
            className={`px-4 py-2 rounded-lg ${
              !myServices
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos os Serviços
          </button>
          <button
            onClick={() => setMyServices(true)}
            className={`px-4 py-2 rounded-lg ${
              myServices
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Meus Serviços
          </button>
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Serviços */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando serviços...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
          <p className="text-gray-500 mb-4">
            {myServices
              ? 'Você ainda não oferece serviços no marketplace.'
              : 'Nenhum serviço encontrado.'}
          </p>
          {myServices && (
            <button
              onClick={() => setShowModal(true)}
              className="text-blue-600 hover:underline"
            >
              Oferecer primeiro serviço
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {service.category || 'Sem categoria'}
                  </span>
                  {service.status === 'inactive' && (
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Inativo
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {service.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {service.description || 'Sem descrição'}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>📍 {service.location || 'Não informado'}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(service.price)}
                  </span>
                </div>

                {!myServices && service.profiles && (
                  <div className="text-sm text-gray-500 border-t pt-4">
                    <p className="font-medium text-gray-700">
                      {service.profiles.company_name || service.profiles.full_name || 'Operador'}
                    </p>
                  </div>
                )}

                {myServices && (
                  <div className="flex gap-2 border-t pt-4">
                    <button
                      onClick={() => toggleStatus(service)}
                      className={`flex-1 py-2 rounded-lg text-sm ${
                        service.status === 'active'
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {service.status === 'active' ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm hover:bg-red-100"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Oferecer Serviço
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título do Serviço *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Filmagem aérea para eventos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva seu serviço..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">R$</span>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: São Paulo, SP"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}