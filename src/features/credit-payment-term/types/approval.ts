export type ApprovalAction =
  | 'created'
  | 'draft_saved'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'edited'
  | 'resubmitted'
  | 'cancelled'

export const APPROVAL_ACTION_LABELS: Record<ApprovalAction, string> = {
  created: 'สร้างคำขอ',
  draft_saved: 'บันทึกแบบร่าง',
  submitted: 'ส่งขออนุมัติ',
  approved: 'อนุมัติแล้ว',
  rejected: 'ไม่อนุมัติ',
  edited: 'แก้ไขคำขอ',
  resubmitted: 'ส่งขออนุมัติอีกครั้ง',
  cancelled: 'ยกเลิกคำขอ',
}

export interface ApprovalHistoryEntry {
  historyId: string
  requestId: string
  version: number
  action: ApprovalAction
  actorEmail: string
  actorName: string
  fromStatus: string
  toStatus: string
  comment?: string
  createdAt: string
}

// Per-section reviewer notes — replaces a single freeform decision comment.
// Lets an approver comment on exactly the section they have feedback on
// (customer info, Hardware, or Software & Installation) instead of one
// undifferentiated text box.
export interface SectionComments {
  customerComment?: string
  hardwareComment?: string
  swComment?: string
}

export interface ApprovalResult extends SectionComments {
  approverEmail: string
  approverName: string
  approvedAt?: string
  rejectedAt?: string
}
