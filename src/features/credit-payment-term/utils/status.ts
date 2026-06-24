import type { LucideIcon } from 'lucide-react'
import { FileText, Hourglass, CheckCircle, XCircle, RefreshCw, Ban } from 'lucide-react'
import type { RequestStatus } from '../types/request'
import { STATUS_LABELS } from '../types/request'

export interface StatusConfig {
  label: string
  /** Icon color — the brand's exact semantic token, even where it's too light to use as text. */
  iconColor: string
  /** Label color — a readable dark variant of the same hue, used since some semantic tokens fail text contrast. */
  textColor: string
  icon: LucideIcon
}

export const STATUS_CONFIG: Record<RequestStatus, StatusConfig> = {
  draft: {
    label: STATUS_LABELS.draft,
    iconColor: '#4A5568',
    textColor: '#4A5568',
    icon: FileText,
  },
  pending: {
    label: STATUS_LABELS.pending,
    iconColor: '#FFCC00',
    textColor: '#92400E',
    icon: Hourglass,
  },
  approved: {
    label: STATUS_LABELS.approved,
    iconColor: '#82C566',
    textColor: '#14532D',
    icon: CheckCircle,
  },
  rejected: {
    label: STATUS_LABELS.rejected,
    iconColor: '#F3554F',
    textColor: '#F3554F',
    icon: XCircle,
  },
  revised: {
    label: STATUS_LABELS.revised,
    iconColor: '#1E40AF',
    textColor: '#1E40AF',
    icon: RefreshCw,
  },
  cancelled: {
    label: STATUS_LABELS.cancelled,
    iconColor: '#6B7280',
    textColor: '#6B7280',
    icon: Ban,
  },
}

export function getStatusConfig(status: RequestStatus): StatusConfig {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.draft
}
