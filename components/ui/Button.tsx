'use client'

import { motion } from 'framer-motion'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  fullWidth?: boolean
  isLoading?: boolean
  className?: string
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  isLoading = false,
  children,
  disabled,
  className = '',
  onClick,
  type = 'button',
  ...rest
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-btn px-5 py-3 text-sm font-semibold transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-uc-red focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

  const variantStyles = {
    primary: 'bg-uc-red text-white hover:bg-uc-red-dark shadow-chat hover:shadow-floating',
    secondary: 'bg-white text-uc-gray-700 border-2 border-uc-gray-100 hover:border-uc-gray-400 hover:text-uc-black',
    ghost: 'bg-transparent text-uc-gray-700 hover:bg-uc-gray-100',
  }

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...(rest as object)}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Se încarcă...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}
