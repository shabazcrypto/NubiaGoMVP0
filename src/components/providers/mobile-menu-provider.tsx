'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface MobileMenuContextType {
  isOpen: boolean
  toggle: () => void
  open: () => void
  close: () => void
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined)

export function useMobileMenu() {
  const context = useContext(MobileMenuContext)
  if (context === undefined) {
    throw new Error('useMobileMenu must be used within a MobileMenuProvider')
  }
  return context
}

interface MobileMenuProviderProps {
  children: ReactNode
}

export function MobileMenuProvider({ children }: MobileMenuProviderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen(prev => !prev)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  const value: MobileMenuContextType = {
    isOpen,
    toggle,
    open,
    close
  }

  return (
    <MobileMenuContext.Provider value={value}>
      {children}
    </MobileMenuContext.Provider>
  )
}
