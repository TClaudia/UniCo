import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function Card({ children, className = '', noPadding = false, ...rest }: CardProps) {
  return (
    <div
      className={`bg-white rounded-card shadow-card ${noPadding ? '' : 'p-4'} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
