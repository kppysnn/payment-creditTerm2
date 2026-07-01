import { useEffect, useId, useRef, type ReactNode } from 'react'
import { FaXmark } from 'react-icons/fa6'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_WIDTH: Record<string, number> = { sm: 420, md: 560, lg: 720 }

export function Modal({ open, onClose, title, children, footer, size = 'md' }: Props) {
  const titleId = useId()
  const boxRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Escape closes the dialog (standard dialog behavior) and focus moves onto
  // the dialog box itself on open, then back to whatever triggered it on
  // close — minimal version of the ARIA dialog pattern's focus handling.
  useEffect(() => {
    if (!open) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    boxRef.current?.focus()
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const box = boxRef.current
      if (!box) return
      const focusable = Array.from(
        box.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )
      if (focusable.length === 0) { e.preventDefault(); return }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first || document.activeElement === box) {
          e.preventDefault(); last.focus()
        }
      } else {
        if (document.activeElement === last || document.activeElement === box) {
          e.preventDefault(); first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused.current?.focus?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.50)' }} />

      {/* Box */}
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: 4,
          boxShadow: '0 16px 34px rgba(0,64,129,0.10), 0 2px 6px rgba(0,64,129,0.06)',
          width: '100%',
          maxWidth: SIZE_WIDTH[size],
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 32px)',
          overflow: 'hidden',
          outline: 'none',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #D0D6DF',
          }}
        >
          {/* Weight 500 (Medium), not 700 — confirmed against a real WorkX
              modal header ("ไม่อนุมัติ Internal Memo", 1319:3275): Poppins
              Medium, never bold. */}
          <h3 id={titleId} style={{ margin: 0, fontSize: 16, fontWeight: 500, color: '#586782' }}>{title}</h3>
          <button
            onClick={onClose}
            aria-label="ปิด"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#586782', padding: 4, borderRadius: 4, display: 'flex' }}
          >
            <FaXmark size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>{children}</div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid #D0D6DF',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
