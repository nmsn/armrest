import React from "react"

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className = "", hover = false, onClick }: CardProps) {
  const baseClasses = "border border-border rounded-2xl bg-card"
  const hoverClasses = hover ? "hover:border-accent/30 transition-all duration-200 cursor-pointer" : ""
  const clickableClasses = onClick ? "cursor-pointer" : ""

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-3 ${className}`}>{children}</div>
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 border-b border-border ${className}`}>{children}</div>
}
