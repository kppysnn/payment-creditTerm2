import { useEffect, useRef, useState } from 'react'
import { ChevronIcon, XMarkIcon } from '../icons/FigmaIcons'
import { Button } from './Button'

interface Props {
  startValue: string | null
  endValue: string | null
  onChange: (start: string | null, end: string | null) => void
  placeholder?: string
  style?: React.CSSProperties
}

const WEEKDAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const fmt = new Intl.DateTimeFormat('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function dayOnly(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

function buildGrid(monthDate: Date): Date[] {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

// Matches WorkX's own calendar popover (Exzy_WorkX 72:5368) — prev/next
// month header, weekday row, 6x7 day grid, range selection with a navy
// start/end pill + a soft in-between fill, Cancel/Done footer — but
// recolored to this app's actual brand tokens (navy/teal/Poppins) rather
// than the literal library-default neutrals (#14181F, #DCE0E5, Inter) that
// component's own Figma export uses, which don't appear anywhere else in
// WorkX's real rendered UI. A single day is just a range where start===end.
export function DatePicker({ startValue, endValue, onChange, placeholder = 'เลือกวันที่', style }: Props) {
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => (startValue ? new Date(startValue) : new Date()))
  const [pendingStart, setPendingStart] = useState<Date | null>(startValue ? new Date(startValue) : null)
  const [pendingEnd, setPendingEnd] = useState<Date | null>(endValue ? new Date(endValue) : null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const today = new Date()

  function openPicker() {
    setPendingStart(startValue ? new Date(startValue) : null)
    setPendingEnd(endValue ? new Date(endValue) : null)
    setViewMonth(startValue ? new Date(startValue) : new Date())
    setOpen(true)
  }

  function pickDay(d: Date) {
    if (!pendingStart || pendingEnd) {
      setPendingStart(d)
      setPendingEnd(null)
    } else if (d < pendingStart) {
      setPendingEnd(pendingStart)
      setPendingStart(d)
    } else {
      setPendingEnd(d)
    }
  }

  function confirm() {
    if (pendingStart) onChange(toISODate(pendingStart), toISODate(pendingEnd ?? pendingStart))
    setOpen(false)
  }

  const label = startValue
    ? (!endValue || startValue === endValue)
      ? fmt.format(new Date(startValue))
      : `${fmt.format(new Date(startValue))} - ${fmt.format(new Date(endValue))}`
    : placeholder

  return (
    <div ref={rootRef} style={{ position: 'relative', ...style }}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        style={{
          width: '100%', height: 38, padding: '0 12px', border: '1px solid #D0D6DF', borderRadius: 8,
          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 14, fontFamily: 'inherit', color: startValue ? '#505050' : '#586782', cursor: 'pointer', gap: 8,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        {startValue ? (
          <span
            role="button"
            aria-label="ล้างวันที่"
            onClick={e => { e.stopPropagation(); onChange(null, null) }}
            style={{ display: 'flex', flexShrink: 0, color: '#586782' }}
          >
            <XMarkIcon size={11} />
          </span>
        ) : (
          <ChevronIcon direction="down" size={10} color="#586782" style={{ flexShrink: 0 }} />
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 20,
          background: '#fff', border: '1px solid #D0D6DF', borderRadius: 8,
          boxShadow: '0 16px 34px rgba(0,64,129,0.10), 0 2px 6px rgba(0,64,129,0.06)',
          padding: 16, width: 280,
        }}>
          <div style={{ fontSize: 11, color: '#586782', marginBottom: 8 }}>
            {pendingStart && !pendingEnd ? 'เลือกวันสิ้นสุด (หรือกด ตกลง เพื่อเลือกวันเดียว)' : 'เลือกวันเริ่มต้น'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <button
              type="button"
              aria-label="เดือนก่อนหน้า"
              onClick={() => setViewMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              style={navBtnStyle}
            >
              <ChevronIcon direction="left" size={11} color="#586782" />
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#586782' }}>
              {new Intl.DateTimeFormat('th-TH', { year: 'numeric', month: 'long' }).format(viewMonth)}
            </span>
            <button
              type="button"
              aria-label="เดือนถัดไป"
              onClick={() => setViewMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              style={navBtnStyle}
            >
              <ChevronIcon direction="right" size={11} color="#586782" />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: 4 }}>
            {WEEKDAYS.map(w => (
              <span key={w} style={{ fontSize: 11, color: '#586782', padding: '4px 0' }}>{w}</span>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {buildGrid(viewMonth).map(d => {
              const inMonth = d.getMonth() === viewMonth.getMonth()
              const isStart = pendingStart && sameDay(d, pendingStart)
              const isEnd = pendingEnd && sameDay(d, pendingEnd)
              const isEndpoint = isStart || isEnd
              const isInRange = pendingStart && pendingEnd && !isEndpoint && dayOnly(d) > dayOnly(pendingStart) && dayOnly(d) < dayOnly(pendingEnd)
              const isToday = sameDay(d, today)
              const singleDay = isStart && isEnd
              const radius = singleDay ? 4 : isStart ? '4px 0 0 4px' : isEnd ? '0 4px 4px 0' : 0
              return (
                <button
                  type="button"
                  key={d.toISOString()}
                  onClick={() => pickDay(d)}
                  style={{
                    height: 32,
                    border: !isEndpoint && isToday ? '1.5px solid #66C5C5' : '1.5px solid transparent',
                    borderRadius: radius,
                    background: isEndpoint ? '#004081' : isInRange ? 'rgba(0,64,129,0.08)' : 'transparent',
                    color: isEndpoint ? '#fff' : inMonth ? '#586782' : '#D0D6DF',
                    fontSize: 13,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    fontWeight: isEndpoint || isToday ? 600 : 400,
                  }}
                  onMouseEnter={e => { if (!isEndpoint) e.currentTarget.style.background = '#F2F6F8' }}
                  onMouseLeave={e => { if (!isEndpoint) e.currentTarget.style.background = isInRange ? 'rgba(0,64,129,0.08)' : 'transparent' }}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid #D0D6DF' }}>
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>ยกเลิก</Button>
            <Button size="sm" disabled={!pendingStart} onClick={confirm}>ตกลง</Button>
          </div>
        </div>
      )}
    </div>
  )
}

const navBtnStyle: React.CSSProperties = {
  width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: '1px solid #D0D6DF', borderRadius: 8, background: '#fff', cursor: 'pointer', padding: 0,
}
