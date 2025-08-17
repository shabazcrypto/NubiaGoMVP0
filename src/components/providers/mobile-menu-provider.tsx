'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface MobileMenuContextType {
  isMenuOpen: boolean
  toggleMenu: () => void
  closeMenu: () => void
  openMenu: () => void
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined)

export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)
  const openMenu = () => setIsMenuOpen(true)

  return (
    <MobileMenuContext.Provider value={{
      isMenuOpen,
      toggleMenu,
      closeMenu,
      openMenu
    }}>
      {children}
    </MobileMenuContext.Provider>
  )
}

export function useMobileMenu() {
  const context = useContext(MobileMenuContext)
  if (context === undefined) {
    throw new Error('useMobileMenu must be used within a MobileMenuProvider')
  }
  return context
}
