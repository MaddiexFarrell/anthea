import type {ReactNode} from 'react'
import {Card} from './Card'

export function Table({children}: {children: ReactNode}) {
  return (
    <Card>
      <table className="w-full text-left text-sm">{children}</table>
    </Card>
  )
}

export function THead({children}: {children: ReactNode}) {
  return (
    <thead>
      <tr className="border-b border-border">{children}</tr>
    </thead>
  )
}

export function Th({
  children,
  className = '',
}: {
  children?: ReactNode
  className?: string
}) {
  return (
    <th
      className={`px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted ${className}`}
    >
      {children}
    </th>
  )
}

export function TBody({children}: {children: ReactNode}) {
  return <tbody>{children}</tbody>
}

export function Tr({
  children,
  onClick,
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-border last:border-0 ${
        onClick ? 'cursor-pointer transition-colors hover:bg-hover' : ''
      } ${className}`}
    >
      {children}
    </tr>
  )
}

export function Td({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <td className={`px-5 py-3.5 align-middle ${className}`}>{children}</td>
}
