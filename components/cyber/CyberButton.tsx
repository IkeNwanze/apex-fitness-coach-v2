'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  glow?: boolean
}

export function CyberButton({
  variant = 'primary',
  size = 'md',
  glow = true,
  className = '',
  children,
  ...props
}: CyberButtonProps) {
  const baseStyles = 'font-bold uppercase tracking-wider transition-all duration-300 relative overflow-hidden group'
  
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-cyan-500 to-blue-500
      text-white
      border-2 border-cyan-400
      hover:from-cyan-400 hover:to-blue-400
      hover:border-cyan-300
      hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]
      active:scale-95
    `,
    secondary: `
      bg-gradient-to-r from-pink-500 to-purple-500
      text-white
      border-2 border-pink-400
      hover:from-pink-400 hover:to-purple-400
      hover:border-pink-300
      hover:shadow-[0_0_20px_rgba(236,72,153,0.6)]
      active:scale-95
    `,
    outline: `
      bg-transparent
      text-cyan-400
      border-2 border-cyan-400
      hover:bg-cyan-400/10
      hover:border-cyan-300
      hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]
      active:scale-95
    `,
  }
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  }

  const glowEffect = glow ? 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700' : ''

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${glowEffect}
        ${className}
        clip-path-hex
      `}
      {...props}
    >
      {/* Animated background pulse */}
      <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow" />
      
      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  )
}