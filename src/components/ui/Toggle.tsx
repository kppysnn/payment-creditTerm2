import type { ReactNode } from 'react'

interface Props {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: ReactNode
  disabled?: boolean
}

// Matches the W+ Library "IconToggle" component (909:1325) exactly: a 42x20
// pill track (#004081 on / #D0D6DF off — this is the one control in the app
// that's deliberately still a pill, per that direct Figma reference) with a
// 20px white circular thumb that fully fills the track height and slides
// from the left edge to the right.
export function Toggle({ checked, onChange, label, disabled }: Props) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 13 }}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={e => onChange(e.target.checked)}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
      />
      <span
        aria-hidden
        style={{
          position: 'relative',
          width: 42,
          height: 20,
          flexShrink: 0,
          borderRadius: 10,
          background: disabled ? '#E5E8EC' : checked ? '#004081' : '#D0D6DF',
          transition: 'background 0.15s',
        }}
      >
        <span style={{
          position: 'absolute',
          top: 0,
          left: checked ? 22 : 0,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,64,129,0.35)',
          transition: 'left 0.15s',
        }} />
      </span>
      {label && <span style={{ lineHeight: 1.4, color: disabled ? '#929EB4' : '#586782' }}>{label}</span>}
    </label>
  )
}
