'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Category {
  id: string
  name: string
  icon: string
  description: string
  sort_order: number
}

interface Question {
  id: string
  category_id: string
  question: string
  answer: string
  keywords: string[]
  views: number
  helpful_count: number
}

const synonymMap: Record<string, string[]> = {
  registro: ['cadastrar', 'cadastramento', 'registrar', 'inscrição', 'licença'],
  habilitação: ['licença', 'certificado', 'habilitado', 'curso', 'cpr'],
  autorização: ['permissão', 'autorizar', 'aprovado', 'voo', 'sarpas'],
  voo: ['voo', 'voar', 'voando', 'flight', 'operar'],
  drone: ['drone', 'drones', 'vant', 'aeronave', 'equipamento'],
  multa: ['penalidade', 'infração', 'sanção', 'advertência'],
  segurança: ['seguro', 'segurança', 'risco', 'perigo', 'acidente'],
  anac: ['anac', 'agência nacional', 'aviação civil'],
  decea: ['decea', 'espaço aéreo', 'controle', 'sarpas'],
  anatel: ['anatel', 'frequência', 'rádio', 'transmissor'],
  altitude: ['altura', 'altitude', 'metros', 'limite'],
  noite: ['noturno', 'noite', 'escuro', 'luzes'],
  urbano: ['cidade', 'urbano', 'área urbana', 'populosa'],
  peso: ['peso', 'massa', 'kg', 'gramas', 'mtow'],
  aro: ['aro', 'sora', 'risco', 'avaliação', 'operacional'],
  análise: ['análise', 'analise', 'avaliação', 'estudo'],
  indoor: ['indoor', 'indoo', 'interno', 'dentro', 'coberto'],
  outdoor: ['outdoor', 'externo', 'fora', 'ao ar livre'],
}

function fuzzyMatch(str1: string, str2: string): number {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()

  if (s1 === s2) return 1
  if (s1.includes(s2) || s2.includes(s1)) return 0.8

  const matrix: number[][] = []
  const len1 = s1.length
  const len2 = s2.length

  for (let i = 0; i <= len1; i++) matrix[i] = [i]
  for (let j = 0; j <= len2; j++) matrix[0][j] = j

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  const maxLen = Math.max(len1, len2)
  return maxLen === 0 ? 1 : (maxLen - matrix[len1][len2]) / maxLen
}

function expandSearchTerms(term: string): string[] {
  const terms = [term.toLowerCase()]

  for (const [key, synonyms] of Object.entries(synonymMap)) {
    if (
      term.toLowerCase().includes(key) ||
      synonyms.some((s) => term.toLowerCase().includes(s))
    ) {
      terms.push(key, ...synonyms)
    }
  }

  return [...new Set(terms)]
}

export default function DashboardFAQPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const [helpfulSubmitted, setHelpfulSubmitted] = useState<string[]>([])

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async () => {
    const [catRes, questRes] = await Promise.all([
      supabase.from('faq_categories').select('*').order('sort_order'),
      supabase.from('faq_questions').select('*').order('views', { ascending: false }),
    ])

    if (catRes.data) setCategories(catRes.data as Category[])
    if (questRes.data) setQuestions(questRes.data as Question[])
    setLoading(false)
  }

  const filteredQuestions = useMemo(() => {
    let filtered = questions

    if (selectedCategory) {
      filtered = filtered.filter((q) => q.category_id === selectedCategory)
    }

    if (searchTerm.trim()) {
      const searchTerms = expandSearchTerms(searchTerm)

      filtered = filtered.filter((q) => {
        const questionLower = q.question.toLowerCase()
        const answerLower = q.answer.toLowerCase()
        const keywordsLower = q.keywords?.map((k) => k.toLowerCase()) || []

        const directMatch = searchTerms.some(
          (term) =>
            questionLower.includes(term) ||
            answerLower.includes(term) ||
            keywordsLower.some((k) => k.includes(term))
        )

        if (directMatch) return true

        const words = searchTerm.toLowerCase().split(/\s+/)
        return words.some((word) => {
          if (word.length < 3) return false

          const questionWords = questionLower.split(/\s+/)
          if (questionWords.some((qw) => fuzzyMatch(word, qw) > 0.7)) return true

          if (keywordsLower.some((k) => fuzzyMatch(word, k) > 0.7)) return true

          return false
        })
      })
    }

    return filtered
  }, [questions, selectedCategory, searchTerm])

  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return questions.slice(0, 5)
    if (searchTerm.length < 2) return []

    const searchTerms = expandSearchTerms(searchTerm)
    const matches = questions.filter((q) => {
      const questionLower = q.question.toLowerCase()
      const keywordsLower = q.keywords?.map((k) => k.toLowerCase()) || []

      return (
        searchTerms.some(
          (term) =>
            questionLower.includes(term) || keywordsLower.some((k) => k.includes(term))
        ) || fuzzyMatch(searchTerm.toLowerCase(), questionLower) > 0.5
      )
    })

    return matches.slice(0, 5)
  }, [searchTerm, questions])

  const popularQuestions = useMemo(() => questions.slice(0, 4), [questions])

  const handleQuestionClick = async (questionId: string) => {
    await supabase.rpc('increment_faq_views', { question_id: questionId })
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId)
  }

  const handleHelpful = async (questionId: string) => {
    if (helpfulSubmitted.includes(questionId)) return

    await supabase.rpc('increment_faq_helpful', { question_id: questionId })
    setHelpfulSubmitted([...helpfulSubmitted, questionId])
    fetchData()
  }

  const getCategoryIcon = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId)
    return cat?.icon || '📋'
  }

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId)
    return cat?.name || 'Geral'
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">FAQ - Legislação de Drones</h1>
        <p className="text-gray-600 mt-2">
          Tire suas dúvidas sobre regulamentação ANAC, DECEA e ANATEL
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar pergunta... (ex: registro, habilitação, SARPAS, risco, indoor)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {suggestions.length > 0 && searchTerm.length >= 2 && (
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-500 mb-2">Sugestões:</p>
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSearchTerm('')
                  setExpandedQuestion(s.id)
                }}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200"
              >
                <span className="font-medium">{s.question}</span>
                <span className="text-gray-400 text-xs ml-2">
                  ({getCategoryName(s.category_id)})
                </span>
              </button>
            ))}
          </div>
        )}

        {searchTerm.length > 0 && searchTerm.length < 2 && (
          <p className="text-xs text-gray-500 mt-2">
            Digite pelo menos 2 caracteres para buscar...
          </p>
        )}
      </div>

      {!searchTerm && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">📌 Perguntas Frequentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {popularQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => setExpandedQuestion(q.id)}
                className="text-left p-4 bg-white rounded-lg border hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{getCategoryIcon(q.category_id)}</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{q.question}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {getCategoryName(q.category_id)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-500 mb-2">Nenhuma pergunta encontrada para "{searchTerm}"</p>
            <p className="text-sm text-gray-400 mb-4">
              Tente palavras-chave como: registro, habilitação, autorização, risco, indoor
            </p>
            {searchTerm.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Perguntas relacionadas:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {questions.slice(0, 3).map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setExpandedQuestion(q.id)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                    >
                      {q.question.substring(0, 30)}...
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="bg-white rounded-lg shadow-sm border overflow-hidden"
            >
              <button
                onClick={() => handleQuestionClick(question.id)}
                className="w-full px-6 py-4 text-left flex items-start gap-4 hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">{getCategoryIcon(question.category_id)}</span>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{question.question}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {getCategoryName(question.category_id)} • {question.views} visualizações
                  </p>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedQuestion === question.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {expandedQuestion === question.id && (
                <div className="px-6 pb-6">
                  <div className="ml-10 border-l-2 border-blue-200 pl-4">
                    <div className="prose prose-sm max-w-none text-gray-700">
                      {question.answer.split('\n').map((paragraph, i) => {
                        if (paragraph.startsWith('**')) {
                          return (
                            <p key={i} className="font-semibold text-gray-900 mt-4 first:mt-0">
                              {paragraph.replace(/\*\*/g, '')}
                            </p>
                          )
                        }
                        if (paragraph.startsWith('- ')) {
                          return (
                            <li key={i} className="ml-4">
                              {paragraph.substring(2)}
                            </li>
                          )
                        }
                        if (paragraph.match(/^\d+\./)) {
                          return (
                            <li key={i} className="ml-4 list-decimal">
                              {paragraph.replace(/^\d+\.\s*/, '')}
                            </li>
                          )
                        }
                        return <p key={i}>{paragraph}</p>
                      })}
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center gap-4">
                      <span className="text-sm text-gray-600">Esta resposta foi útil?</span>
                      <button
                        onClick={() => handleHelpful(question.id)}
                        disabled={helpfulSubmitted.includes(question.id)}
                        className={`px-3 py-1 text-sm rounded ${
                          helpfulSubmitted.includes(question.id)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-green-50'
                        }`}
                      >
                        {helpfulSubmitted.includes(question.id) ? '✓ Obrigado!' : '👍 Sim'}
                      </button>
                      <span className="text-sm text-gray-500">
                        {question.helpful_count} pessoas acharam útil
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <span className="text-2xl">📖</span>
          <div>
            <h3 className="font-medium text-blue-900">Base de Conhecimento</h3>
            <p className="text-sm text-blue-700 mt-1">
              Este FAQ é baseado nas regulamentações oficiais: RBAC nº 100 (ANAC), ICA 100-40 (DECEA)
              e Resolução ANATEL nº 680/2017. Para casos específicos, consulte sempre um especialista.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}