import type { ReactNode, CSSProperties } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  style?: CSSProperties
  actions?: ReactNode
  noPad?: boolean
}

export function Card({ title, children, style, actions, noPad }: CardProps) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {(title || actions) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          {title && (
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1A202C' }}>{title}</h3>
          )}
          {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
        </div>
      )}
      <div style={noPad ? undefined : { padding: 20 }}>{children}</div>
    </div>
  )
}

interface FieldProps {
  label: string
  value?: string | number | null
  mono?: boolean
  children?: ReactNode
}

export function FieldDisplay({ label, value, mono, children }: FieldProps) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#718096', marginBottom: 3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </div>
      {children ?? (
        <div style={{ fontSize: 14, color: '#1A202C', fontFamily: mono ? 'JetBrains Mono, monospace' : undefined }}>
          {value ?? '—'}
        </div>
      )}
    </div>
  )
}

export function FieldGrid({ children, cols = 3 }: { children: ReactNode; cols?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '16px 24px' }}>
      {children}
    </div>
  )
}
