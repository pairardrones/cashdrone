'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import AuthGuard from '@/components/AuthGuard'

const menuItems = [
  { href: '/dashboard', label: 'Início', icon: '🏠' },
  { href: '/dashboard/simulador', label: 'Simulador', icon: '📊' },
  { href: '/dashboard/clientes', label: 'Clientes', icon: '👥' },
  { href: '/dashboard/propostas', label: 'Propostas', icon: '📄' },
  { href: '/dashboard/marketplace', label: 'Marketplace', icon: '🛒' },
  { href: '/dashboard/checklists', label: 'Checklists', icon: '✅' },
  { href: '/dashboard/aro', label: 'ARO/SORA', icon: '⚠️' },
  { href: '/dashboard/meteorologia', label: 'Meteorologia', icon: '🌤️' },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: '⚙️' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-blue-600">Ca$hDrone</h1>
            <p className="text-sm text-gray-500 mt-1">Hub de Serviços</p>
          </div>

          <nav className="p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      pathname === item.href
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500">Plano Gratuito</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              Sair
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="ml-64 p-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}