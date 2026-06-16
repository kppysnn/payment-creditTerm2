export type CustomerType = 'new' | 'existing' | 'reseller'
export type BillingTarget = 'reseller' | 'end_customer'

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  new: 'ลูกค้าใหม่',
  existing: 'ลูกค้าเก่า',
  reseller: 'Reseller',
}

export interface Customer {
  id: string
  companyName: string
  taxId?: string
  defaultCreditTerm?: number
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
  status: 'active' | 'inactive'
}

export interface NewCustomerInfo {
  companyName: string
  taxId?: string
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
  remark?: string
  creditTermReason?: string
}

export interface ExistingCustomerInfo {
  customerId: string
  companyName: string
  taxId?: string
  defaultCreditTerm?: number
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
}

export interface ResellerInfo {
  resellerCompanyName: string
  resellerContactPerson?: string
  resellerEmail?: string
  resellerPhone?: string
  endCustomerCompanyName: string
  endCustomerContactPerson?: string
  endCustomerEmail?: string
  endCustomerPhone?: string
  billingTo: BillingTarget
  creditTermAppliesTo: BillingTarget
}

export type RequestCustomerInfo =
  | { type: 'new'; data: NewCustomerInfo }
  | { type: 'existing'; data: ExistingCustomerInfo }
  | { type: 'reseller'; data: ResellerInfo }
