import type { RequestCustomerInfo } from './customer'
import type { ApprovalHistoryEntry, ApprovalResult } from './approval'

export type RequestStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'revised'
  | 'cancelled'

export const STATUS_LABELS: Record<RequestStatus, string> = {
  draft: 'แบบร่าง',
  pending: 'รออนุมัติ',
  approved: 'อนุมัติแล้ว',
  rejected: 'ไม่อนุมัติ',
  revised: 'แก้ไขและส่งใหม่',
  cancelled: 'ยกเลิก',
}

export type SaleType = 'hardware' | 'software_installation' | 'mixed'

export const SALE_TYPE_LABELS: Record<SaleType, string> = {
  hardware: 'Hardware',
  software_installation: 'Software & Installation',
  mixed: 'Hardware + Software & Installation',
}

export type PaymentCondition =
  | 'before_delivery'
  | 'on_po'
  | 'on_delivery'
  | 'on_installation'
  | 'on_acceptance'
  | 'monthly'
  | 'other'

export const PAYMENT_CONDITION_LABELS: Record<PaymentCondition, string> = {
  before_delivery: 'Before delivery',
  on_po: 'On PO confirmation',
  on_delivery: 'On delivery',
  on_installation: 'On installation complete',
  on_acceptance: 'On final acceptance',
  monthly: 'Monthly billing',
  other: 'Other',
}

export interface QuotationItem {
  itemId: string
  type: 'hardware' | 'software' | 'installation'
  name: string
  description?: string
  sellingPrice: number
  cost: number
  grossProfit: number
  marginPercent: number
  remark?: string
}

export interface PaymentInstallment {
  installmentNo: number
  installmentPercent: number
  installmentAmount: number
  creditTermDays: number
  paymentCondition: PaymentCondition
  creditTermReason: string
  remark?: string
}

export interface FinancialSummary {
  totalSelling: number
  totalCost: number
  grossProfit: number
  marginPercent: number
  maxCreditTerm: number
}

export interface Request {
  id: string
  requestNo: string
  version: number
  createdAt: string
  updatedAt: string

  salesEmail: string
  salesName: string
  salesId: string

  proposalNo: string
  quotationNo?: string
  projectName: string
  saleType: SaleType
  requestPurpose: string
  remark?: string

  customerInfo: RequestCustomerInfo

  quotationItems: QuotationItem[]

  installmentCount: number
  paymentTermReason: string
  creditTermReason?: string
  installments: PaymentInstallment[]

  financial: FinancialSummary

  status: RequestStatus
  approvalResult?: ApprovalResult
  history: ApprovalHistoryEntry[]
}

export interface RequestListItem {
  id: string
  requestNo: string
  proposalNo: string
  projectName: string
  customerName: string
  customerType: string
  saleType: SaleType
  totalSelling: number
  totalCost: number
  grossProfit: number
  marginPercent: number
  maxCreditTerm: number
  installmentCount: number
  status: RequestStatus
  salesName: string
  approverName?: string
  updatedAt: string
  version: number
}

export type RequestFormData = {
  proposalNo: string
  quotationNo: string
  projectName: string
  saleType: SaleType | ''
  requestPurpose: string
  remark: string

  customerType: '' | 'new' | 'existing' | 'reseller'
  newCustomer: {
    companyName: string
    taxId: string
    contactPerson: string
    contactEmail: string
    contactPhone: string
    remark: string
    creditTermReason: string
  }
  existingCustomerId: string
  existingCustomer: {
    companyName: string
    taxId: string
    defaultCreditTerm: number | ''
    contactPerson: string
    contactEmail: string
    contactPhone: string
  }
  reseller: {
    resellerCompanyName: string
    resellerContactPerson: string
    resellerEmail: string
    resellerPhone: string
    endCustomerCompanyName: string
    endCustomerContactPerson: string
    endCustomerEmail: string
    endCustomerPhone: string
    billingTo: 'reseller' | 'end_customer' | ''
    creditTermAppliesTo: 'reseller' | 'end_customer' | ''
  }

  hardwareItems: Array<{
    name: string
    description: string
    sellingPrice: number | ''
    cost: number | ''
    remark: string
  }>
  softwareSellingPrice: number | ''
  softwareCost: number | ''
  softwareName: string
  softwareDescription: string
  softwareRemark: string
  installationSellingPrice: number | ''
  installationCost: number | ''
  installationDescription: string
  installationRemark: string

  installmentCount: number
  paymentTermReason: string
  overallCreditTermReason: string
  installments: Array<{
    installmentPercent: number | ''
    creditTermDays: number | ''
    paymentCondition: PaymentCondition | ''
    creditTermReason: string
    remark: string
  }>
}
