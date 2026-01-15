'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { themeConfig } = useTheme()

  const navItems = [
    { path: '/dashboard', icon: '🏠', label: 'Home' },
    { path: '/journey-map', icon: '🎓', label: 'Journey' },
    { path: '/store', icon: '🛒', label: 'Store' },
    { path: '/profile', icon: '👤', label: 'Profile' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ]

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 border-t-4 z-50"
      style={{
        backgroundColor: '#000000',
        borderColor: themeConfig.colors.borderColor,
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-around items-center py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-300"
                style={{
                  color: isActive ? themeConfig.colors.accent1 : themeConfig.colors.textSecondary,
                  backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                }}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs font-semibold">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
