import type { RequestStatus } from '../../features/credit-payment-term/types/request'
import { getStatusConfig } from '../../features/credit-payment-term/utils/status'

interface Props {
  status: RequestStatus
  size?: 'sm' | 'md'
}

// Filled tag/chip, matching the W+ Library "table tag" component (909:1216) —
// light tinted background per status, not the bare icon+text this used before.
export function StatusBadge({ status, size = 'md' }: Props) {
  const cfg = getStatusConfig(status)
  const Icon = cfg.icon
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: size === 'sm' ? '3px 8px' : '4px 10px',
        borderRadius: 4,
        background: cfg.bgColor,
        fontSize: size === 'sm' ? 12 : 13,
        fontWeight: 500,
        color: cfg.textColor,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={size === 'sm' ? 13 : 14} color={cfg.iconColor} style={{ flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}
