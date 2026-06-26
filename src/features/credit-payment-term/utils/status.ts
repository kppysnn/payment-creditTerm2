import type { IconType } from 'react-icons'
import { FiFileText, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiSlash } from 'react-icons/fi'
import type { RequestStatus } from '../types/request'
import { STATUS_LABELS } from '../types/request'

export interface StatusConfig {
  label: string
  /** Icon color — the brand's exact semantic token, even where it's too light to use as text. */
  iconColor: string
  /** Label color — a readable dark variant of the same hue, used since some semantic tokens fail text contrast. */
  textColor: string
  /** Light tint background — matches the W+ Library "table tag" component (filled chip,
   * not the bare icon+text this app used before 2026-06-26). Reuses the same tint/border
   * pairs as Alert.tsx so status colors stay consistent with the rest of the app. */
  bgColor: string
  icon: IconType
}

export const STATUS_CONFIG: Record<RequestStatus, StatusConfig> = {
  draft: {
    label: STATUS_LABELS.draft,
    iconColor: '#4A5568',
    textColor: '#4A5568',
    bgColor: '#F2F6F8',
    icon: FiFileText,
  },
  pending: {
    label: STATUS_LABELS.pending,
    iconColor: '#FFCC00',
    textColor: '#92400E',
    bgColor: '#FFFBEB',
    icon: FiClock,
  },
  approved: {
    label: STATUS_LABELS.approved,
    iconColor: '#82C566',
    textColor: '#14532D',
    bgColor: '#F0FDF4',
    icon: FiCheckCircle,
  },
  rejected: {
    label: STATUS_LABELS.rejected,
    iconColor: '#F3554F',
    textColor: '#F3554F',
    bgColor: '#FEF2F2',
    icon: FiXCircle,
  },
  revised: {
    label: STATUS_LABELS.revised,
    iconColor: '#1E40AF',
    textColor: '#1E40AF',
    bgColor: '#EFF6FF',
    icon: FiRefreshCw,
  },
  cancelled: {
    label: STATUS_LABELS.cancelled,
    iconColor: '#6B7280',
    textColor: '#6B7280',
    bgColor: '#F2F6F8',
    icon: FiSlash,
  },
}

export function getStatusConfig(status: RequestStatus): StatusConfig {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.draft
}
