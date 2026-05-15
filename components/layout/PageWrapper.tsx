'use client'

import { Header } from './Header'
import { BottomNav } from './BottomNav'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-uc-off-white flex flex-col">
      <Header />
      <main
        className={`flex-1 overflow-y-auto pb-20 ${className}`}
        style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
