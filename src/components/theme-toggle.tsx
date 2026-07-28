'use client'

import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

function subscribe() {
  return () => {}
}

function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false)
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useIsClient()

  if (!mounted) {
    return (
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${className}`}
        aria-hidden
      />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg text-muted-foreground transition-colors duration-300 hover:bg-muted hover:text-foreground ${className}`}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
    >
      <Sun
        className={`absolute h-5 w-5 transition-all duration-300 ease-out ${
          isDark ? 'scale-75 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-all duration-300 ease-out ${
          isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-75 -rotate-90 opacity-0'
        }`}
      />
    </button>
  )
}
