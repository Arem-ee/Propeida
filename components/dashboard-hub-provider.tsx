'use client'

import { createContext, useContext, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

type Hub = 'jamb' | 'universities'

interface HubContextValue {
  hub: Hub
  setHub: (hub: Hub) => void
}

const HubContext = createContext<HubContextValue>({ hub: 'jamb', setHub: () => {} })

export function DashboardHubProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const hub: Hub = searchParams.get('hub') === 'universities' ? 'universities' : 'jamb'

  const setHub = useCallback((newHub: Hub) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newHub === 'universities') {
      params.set('hub', 'universities')
    } else {
      params.delete('hub')
    }
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [searchParams, router, pathname])

  return (
    <HubContext.Provider value={{ hub, setHub }}>
      {children}
    </HubContext.Provider>
  )
}

export function useHub() {
  return useContext(HubContext)
}
