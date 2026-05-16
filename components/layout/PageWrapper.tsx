'use client'

import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-uc-off-white">
      {/* Desktop sidebar — invisible on mobile */}
      <SideNav />

      {/* Content area — shifts right on desktop to clear the 240px sidebar */}
      <div className="flex flex-col min-h-screen lg:ml-60">
        {/* Mobile-only top header */}
        <div className="lg:hidden">
          <Header />
        </div>

        <main className={`flex-1 overflow-y-auto pb-24 lg:pb-10 ${className}`}>
          {children}
        </main>

        {/* Mobile-only bottom nav */}
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
