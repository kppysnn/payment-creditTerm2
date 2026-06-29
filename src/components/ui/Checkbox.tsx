import type { ReactNode } from 'react'

interface Props {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: ReactNode
  disabled?: boolean
  /** Tints the checkmark + (faintly) the resting border — the modals use this
   * to echo their own action color (teal approve, red reject/cancel) while
   * keeping the box itself identical to the W+ Library spec otherwise. */
  accentColor?: string
}

// Matches the W+ Library "MultiCheckbox" component (1052:450) exactly: a 18px
// square, 4px radius, resting border #D0D6DF on a white fill, with a navy
// checkmark (not a filled box) when checked. Disabled fills the box #D9D9D9
// and keeps the same border. The native <input> stays mounted (just visually
// hidden) so focus/keyboard/screen-reader behavior is unaffected.
export function Checkbox({ checked, onChange, label, disabled, accentColor = '#004081' }: Props) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 13, position: 'relative' }}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={e => onChange(e.target.checked)}
        style={{ position: 'absolute', inset: 0, width: 18, height: 18, opacity: 0, margin: 0, cursor: disabled ? 'not-allowed' : 'pointer' }}
      />
      <span
        aria-hidden
        style={{
          width: 18,
          height: 18,
          flexShrink: 0,
          marginTop: 1,
          borderRadius: 4,
          border: `1px solid ${disabled ? '#D0D6DF' : checked ? accentColor : '#D0D6DF'}`,
          background: disabled ? '#D9D9D9' : '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.15s',
        }}
      >
        {checked && !disabled && (
          <svg width={10} height={13.5} viewBox="0 0 10 13.4998" style={{ transform: 'rotate(90deg)' }}>
            <path d="M1.49999 0L0 1.50002L6.94468 8.85494L4 12L5.52231 13.4998L10 8.85494L1.49999 0Z" fill={accentColor} />
          </svg>
        )}
      </span>
      {label && <span style={{ lineHeight: 1.4 }}>{label}</span>}
    </label>
  )
}
