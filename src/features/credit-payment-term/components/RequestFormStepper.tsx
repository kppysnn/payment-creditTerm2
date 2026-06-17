import { useState, useEffect } from 'react'
import type { Request } from '../types/request'
import type { CurrentUser } from '../types/user'
import type { Customer, CustomerType } from '../types/customer'
import { CUSTOMER_TYPE_LABELS } from '../types/customer'
import { PAYMENT_CONDITION_LABELS, type SaleType, type PaymentCondition } from '../types/request'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { FormGroup, Input, Select } from '../../../components/ui/FormField'
import { Alert } from '../../../components/ui/Alert'
import {
  formatCurrency, calcGrossProfit, calcInstallmentAmount,
  calcTotalInstallmentPercent,
} from '../utils/calculations'
import { formatCreditTerm } from '../utils/formatters'
import { searchCustomers } from '../services/customerService'
import { Plus, Trash2, Save, Send, Search, X } from 'lucide-react'

interface HwItem { name: string; sellingPrice: number | ''; cost: number | '' }
interface InstRow { installmentPercent: number | ''; creditTermDays: number | ''; paymentCondition: PaymentCondition | '' }

interface Props {
  initialRequest?: Request
  currentUser: CurrentUser
  onSaveDraft: (data: Record<string, unknown>) => Promise<void>
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onResubmit?: (data: Record<string, unknown>) => Promise<void>
  isResubmit?: boolean
}

const SALE_TYPES = [
  { value: 'hardware', label: 'Hardware', sub: 'Q1 เท่านั้น' },
  { value: 'hardware_software_installation', label: 'Hardware + SW & Installation', sub: 'Q1 + Q2' },
]
const CUSTOMER_TYPES: CustomerType[] = ['new', 'existing', 'reseller']

function numVal(v: unknown): number { return Number(v) || 0 }

export function RequestFormStepper({
  initialRequest, currentUser, onSaveDraft, onSubmit, onResubmit, isResubmit = false,
}: Props) {
  const [formData, setFormData] = useState<Record<string, unknown>>(
    initialRequest ? flattenRequest(initialRequest) : getDefaults(currentUser),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [searching, setSearching] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [draftLoading, setDraftLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const fd = formData
  const saleType = String(fd.saleType || '') as SaleType
  const showSw = saleType === 'hardware_software_installation'
  const customerType = String(fd.customerType || '') as CustomerType | ''
  const nc = (fd.newCustomer as Record<string, string>) ?? {}
  const ec = (fd.existingCustomer as Record<string, unknown>) ?? {}
  const rs = (fd.reseller as Record<string, string>) ?? {}
  const existingCustomerId = String(fd.existingCustomerId || '')
  const hwItems = (fd.hardwareItems as HwItem[]) ?? [{ name: '', sellingPrice: '', cost: '' }]
  const installmentCount = numVal(fd.installmentCount) || 1
  const installments = (fd.installments as InstRow[]) ?? []

  /* Sync installment rows when count changes */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const current = [...installments]
    while (current.length < installmentCount) {
      current.push({ installmentPercent: '', creditTermDays: 0, paymentCondition: 'on_delivery' })
    }
    update({ installments: current.slice(0, installmentCount) })
  }, [installmentCount])

  /* Totals */
  const hwSelling = hwItems.reduce((s, i) => s + numVal(i.sellingPrice), 0)
  const hwCost    = hwItems.reduce((s, i) => s + numVal(i.cost), 0)
  const swSelling = numVal(fd.softwareSellingPrice)
  const swCost    = numVal(fd.softwareCost)
  const instSelling = numVal(fd.installationSellingPrice)
  const instCost    = numVal(fd.installationCost)
  const totalSelling = hwSelling + swSelling + instSelling
  const totalCost    = hwCost + swCost + instCost
  const totalGP      = totalSelling - totalCost
  const totalPct = calcTotalInstallmentPercent(installments.slice(0, installmentCount))
  const maxCreditTerm = installments.slice(0, installmentCount).reduce((m, i) => Math.max(m, numVal(i.creditTermDays)), 0)
  const pctOk = Math.abs(totalPct - 100) < 0.01

  function update(patch: Record<string, unknown>) {
    setFormData(prev => ({ ...prev, ...patch }))
  }
  function clearSearch() { setSearchQuery(''); setSearchResults([]) }

  async function handleSearch() {
    if (!searchQuery.trim()) return
    setSearching(true)
    const results = await searchCustomers(searchQuery)
    setSearchResults(results)
    setSearching(false)
  }

  function selectExistingCustomer(c: Customer) {
    update({
      existingCustomerId: c.id,
      existingCustomer: {
        companyName: c.companyName,
        taxId: c.taxId ?? '',
        defaultCreditTerm: c.defaultCreditTerm ?? 0,
        contactPerson: c.contactPerson ?? '',
        contactPhone: c.contactPhone ?? '',
      },
    })
    clearSearch()
  }

  function selectReseller(c: Customer) {
    update({ reseller: { ...rs, resellerId: c.id, resellerCompanyName: c.companyName } })
    clearSearch()
  }

  function updateHw(i: number, field: keyof HwItem, value: unknown) {
    const updated = [...hwItems]
    updated[i] = { ...updated[i], [field]: value }
    update({ hardwareItems: updated })
  }
  function addHw() { update({ hardwareItems: [...hwItems, { name: '', sellingPrice: '', cost: '' }] }) }
  function removeHw(i: number) { if (hwItems.length > 1) update({ hardwareItems: hwItems.filter((_, idx) => idx !== i) }) }

  function updateInst(i: number, field: keyof InstRow, value: unknown) {
    const updated = [...installments]
    if (!updated[i]) updated[i] = { installmentPercent: '', creditTermDays: 0, paymentCondition: 'on_delivery' }
    updated[i] = { ...updated[i], [field]: value }
    update({ installments: updated })
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!String(fd.proposalNo || '').trim()) e.proposalNo = 'กรุณาระบุ'
    if (!String(fd.projectName || '').trim()) e.projectName = 'กรุณาระบุ'
    if (!saleType) e.saleType = 'กรุณาเลือก'
    if (!customerType) e.customerType = 'กรุณาเลือก'
    if (customerType === 'new' && !nc?.companyName?.trim()) e['new.companyName'] = 'กรุณาระบุ'
    if (customerType === 'existing' && !existingCustomerId) e.existingCustomerId = 'กรุณาเลือกลูกค้า'
    if (customerType === 'reseller') {
      if (!rs?.resellerId) e['res.resellerId'] = 'กรุณาเลือก Reseller'
      if (!rs?.endCustomerCompanyName?.trim()) e['res.endCustomerCompanyName'] = 'กรุณาระบุลูกค้าปลายทาง'
    }
    hwItems.forEach((item, i) => {
      if (!item.name.trim()) e[`hw${i}.name`] = 'ระบุชื่อ'
      if (numVal(item.sellingPrice) <= 0) e[`hw${i}.sell`] = 'ระบุราคา'
    })
    installments.slice(0, installmentCount).forEach((row, i) => {
      if (!row.installmentPercent) e[`inst${i}.pct`] = 'ระบุ%'
      if (!row.paymentCondition) e[`inst${i}.cond`] = 'เลือก'
    })
    if (!pctOk && installmentCount > 0) e.totalPct = `รวม ${totalPct.toFixed(1)}% ≠ 100%`
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleDraft() {
    setDraftLoading(true); setSubmitError('')
    try { await onSaveDraft(formData) } catch (e: unknown) { setSubmitError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด') }
    finally { setDraftLoading(false) }
  }

  async function handleSubmit() {
    if (!validate()) { setSubmitError('กรุณากรอกข้อมูลให้ครบถ้วน'); return }
    if (!confirmed) { setSubmitError('กรุณายืนยันข้อมูลก่อนส่ง'); return }
    setSubmitLoading(true); setSubmitError('')
    try {
      if (isResubmit && onResubmit) await onResubmit(formData)
      else await onSubmit(formData)
    } catch (e: unknown) { setSubmitError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด') }
    finally { setSubmitLoading(false) }
  }

  const radioCard = (active: boolean, color = '#004081') => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px',
    border: `2px solid ${active ? color : '#D0D6DF'}`,
    borderRadius: 10, cursor: 'pointer',
    background: active ? `${color}12` : '#fff',
    transition: 'all 0.15s',
  } as React.CSSProperties)

  const searchDropdown = (items: Customer[], onSelect: (c: Customer) => void) => items.length > 0 && (
    <div style={{ border: '1px solid #D0D6DF', borderRadius: 8, marginTop: 4, background: '#fff', boxShadow: '0 4px 14px rgba(0,64,129,0.10)', overflow: 'hidden', position: 'absolute', zIndex: 20, width: '100%' }}>
      {items.map(c => (
        <button key={c.id} onClick={() => onSelect(c)}
          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid #F2F6F8', fontSize: 13 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F2F6F8' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
        >
          <div style={{ fontWeight: 600, color: '#001122' }}>{c.companyName}</div>
          <div style={{ color: '#929EB4', fontSize: 12 }}>Net {c.defaultCreditTerm ?? 0} · {c.contactPerson}</div>
        </button>
      ))}
    </div>
  )

  const proposalNo = String(fd.proposalNo || '')
  const q1No = proposalNo ? `${proposalNo}-1` : 'Q1'
  const q2No = proposalNo ? `${proposalNo}-2` : 'Q2'

  const TH = (children: React.ReactNode, style?: React.CSSProperties) => (
    <th style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 700, color: '#586782', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', background: '#F2F6F8', whiteSpace: 'nowrap', ...style }}>{children}</th>
  )
  const TD = (children: React.ReactNode, style?: React.CSSProperties) => (
    <td style={{ padding: '8px 10px', verticalAlign: 'middle', ...style }}>{children}</td>
  )

  const qBadge = (no: string) => (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(0,64,129,0.07)', borderRadius: 6, border: '1px solid rgba(0,64,129,0.14)', marginBottom: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#586782', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quotation No.</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#004081', fontFamily: 'JetBrains Mono, monospace' }}>{no}</span>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Reject reason */}
      {isResubmit && initialRequest?.approvalResult && (
        <Alert type="error" title="เหตุผลที่ถูก Reject ครั้งก่อน">
          <div style={{ marginTop: 4 }}>{initialRequest.approvalResult.decisionComment}</div>
          {initialRequest.approvalResult.suggestion && (
            <div style={{ marginTop: 4, color: '#586782' }}>{initialRequest.approvalResult.suggestion}</div>
          )}
        </Alert>
      )}

      {/* ─── Section 1: ข้อมูลคำขอ ─── */}
      <Card title="ข้อมูลคำขอ">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            <FormGroup label="Proposal No." required error={errors.proposalNo}>
              <Input
                value={String(fd.proposalNo || '')}
                onChange={e => update({ proposalNo: e.target.value })}
                placeholder="PRO-2026-001"
                error={errors.proposalNo}
              />
            </FormGroup>
            <FormGroup label="ชื่อโปรเจกต์" required error={errors.projectName}>
              <Input
                value={String(fd.projectName || '')}
                onChange={e => update({ projectName: e.target.value })}
                placeholder="ชื่อโปรเจกต์หรืองานที่ขาย"
                error={errors.projectName}
              />
            </FormGroup>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#586782', marginBottom: 8 }}>
              ประเภทการขาย <span style={{ color: '#F3554F' }}>*</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {SALE_TYPES.map(t => (
                <label key={t.value} style={{ flex: 1, ...radioCard(saleType === t.value) }}>
                  <input type="radio" name="saleType" value={t.value} checked={saleType === t.value}
                    onChange={() => update({ saleType: t.value })} style={{ accentColor: '#004081', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: saleType === t.value ? '#004081' : '#001122' }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: '#929EB4', marginTop: 1 }}>{t.sub}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.saleType && <div style={{ fontSize: 12, color: '#F3554F', marginTop: 5 }}>{errors.saleType}</div>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#FAFBFC', border: '1px solid #D0D6DF', borderRadius: 8, fontSize: 13 }}>
            <span style={{ color: '#929EB4', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sales</span>
            <span style={{ fontWeight: 600, color: '#001122', marginLeft: 4 }}>{String(fd.salesName || '')}</span>
            <span style={{ color: '#929EB4' }}>·</span>
            <span style={{ color: '#586782' }}>{String(fd.salesEmail || '')}</span>
          </div>
        </div>
      </Card>

      {/* ─── Section 2: ข้อมูลลูกค้า ─── */}
      <Card title="ข้อมูลลูกค้า">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#586782', marginBottom: 8 }}>
              ประเภทลูกค้า <span style={{ color: '#F3554F' }}>*</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {CUSTOMER_TYPES.map(type => (
                <label key={type} style={{ flex: 1, ...radioCard(customerType === type, '#66C5C5') }}>
                  <input type="radio" name="customerType" value={type} checked={customerType === type}
                    onChange={() => { update({ customerType: type }); clearSearch() }}
                    style={{ accentColor: '#66C5C5', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, fontSize: 13, color: customerType === type ? '#004081' : '#001122' }}>
                    {CUSTOMER_TYPE_LABELS[type]}
                  </span>
                </label>
              ))}
            </div>
            {errors.customerType && <div style={{ fontSize: 12, color: '#F3554F', marginTop: 5 }}>{errors.customerType}</div>}
          </div>

          {/* ลูกค้าใหม่ */}
          {customerType === 'new' && (
            <div style={{ background: '#FAFBFC', border: '1px solid #D0D6DF', borderRadius: 10, padding: '16px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#586782', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>ข้อมูลลูกค้าใหม่</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
                <FormGroup label="ชื่อบริษัท" required error={errors['new.companyName']} style={{ gridColumn: 'span 2' } as React.CSSProperties}>
                  <Input value={nc.companyName ?? ''} onChange={e => update({ newCustomer: { ...nc, companyName: e.target.value } })}
                    placeholder="บริษัท..." error={errors['new.companyName']} />
                </FormGroup>
                <FormGroup label="ผู้ติดต่อ">
                  <Input value={nc.contactPerson ?? ''} onChange={e => update({ newCustomer: { ...nc, contactPerson: e.target.value } })} />
                </FormGroup>
                <FormGroup label="เบอร์โทร">
                  <Input value={nc.contactPhone ?? ''} onChange={e => update({ newCustomer: { ...nc, contactPhone: e.target.value } })} placeholder="0x-xxxx-xxxx" />
                </FormGroup>
              </div>
            </div>
          )}

          {/* ลูกค้าเก่า */}
          {customerType === 'existing' && (
            <div style={{ background: '#FAFBFC', border: '1px solid #D0D6DF', borderRadius: 10, padding: '16px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#586782', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>เลือกลูกค้าเก่า</div>
              {existingCustomerId ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0,64,129,0.05)', borderRadius: 8, border: '1px solid rgba(0,64,129,0.14)' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#004081', fontSize: 14 }}>{String(ec.companyName ?? '')}</div>
                    <div style={{ fontSize: 12, color: '#586782', marginTop: 3 }}>Net {numVal(ec.defaultCreditTerm)} · {String(ec.contactPerson ?? '')}</div>
                  </div>
                  <button onClick={() => update({ existingCustomerId: '', existingCustomer: {} })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#929EB4', padding: 4 }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <FormGroup error={errors.existingCustomerId}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="ค้นหาด้วยชื่อบริษัท..."
                        style={{ flex: 1 }}
                        error={errors.existingCustomerId}
                      />
                      <Button variant="secondary" size="sm" icon={<Search size={14} />} onClick={handleSearch} loading={searching}>ค้นหา</Button>
                    </div>
                    {searchDropdown(searchResults, selectExistingCustomer)}
                  </div>
                </FormGroup>
              )}
            </div>
          )}

          {/* Reseller */}
          {customerType === 'reseller' && (
            <div style={{ background: '#FAFBFC', border: '1px solid #D0D6DF', borderRadius: 10, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Reseller selection */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#586782', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Reseller</div>
                {rs.resellerId ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0,64,129,0.05)', borderRadius: 8, border: '1px solid rgba(0,64,129,0.14)' }}>
                    <span style={{ fontWeight: 700, color: '#004081', fontSize: 14 }}>{rs.resellerCompanyName}</span>
                    <button onClick={() => { update({ reseller: { ...rs, resellerId: '', resellerCompanyName: '' } }); clearSearch() }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#929EB4', padding: 4 }}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <FormGroup error={errors['res.resellerId']}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Input
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSearch()}
                          placeholder="ค้นหา Reseller จากฐานข้อมูล..."
                          style={{ flex: 1 }}
                          error={errors['res.resellerId']}
                        />
                        <Button variant="secondary" size="sm" icon={<Search size={14} />} onClick={handleSearch} loading={searching}>ค้นหา</Button>
                      </div>
                      {searchDropdown(searchResults, selectReseller)}
                    </div>
                  </FormGroup>
                )}
              </div>

              {/* End Customer — always visible when reseller type is selected */}
              <div style={{ borderTop: '1px solid #D0D6DF', paddingTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#586782', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>ลูกค้าปลายทาง (End Customer)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
                  <FormGroup label="ชื่อบริษัทปลายทาง" required error={errors['res.endCustomerCompanyName']} style={{ gridColumn: 'span 2' } as React.CSSProperties}>
                    <Input
                      value={rs.endCustomerCompanyName ?? ''}
                      onChange={e => update({ reseller: { ...rs, endCustomerCompanyName: e.target.value } })}
                      placeholder="ชื่อบริษัทที่ Reseller จะนำสินค้าไปขายต่อ..."
                      error={errors['res.endCustomerCompanyName']}
                    />
                  </FormGroup>
                  <FormGroup label="ผู้ติดต่อปลายทาง">
                    <Input value={rs.endCustomerContactPerson ?? ''} onChange={e => update({ reseller: { ...rs, endCustomerContactPerson: e.target.value } })} />
                  </FormGroup>
                  <FormGroup label="เบอร์โทร">
                    <Input value={rs.endCustomerPhone ?? ''} onChange={e => update({ reseller: { ...rs, endCustomerPhone: e.target.value } })} placeholder="0x-xxxx-xxxx" />
                  </FormGroup>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ─── Section 3: ใบเสนอราคา ─── */}
      <Card title="ใบเสนอราคา">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Q1 Hardware */}
          <div>
            {qBadge(q1No)}
            <div style={{ border: '1px solid #D0D6DF', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #D0D6DF' }}>
                    {TH('ชื่อสินค้า / Hardware', { width: '45%' })}
                    {TH('ราคาขาย (THB)', { textAlign: 'right' as const, width: '20%' })}
                    {TH('ราคาทุน (THB)', { textAlign: 'right' as const, width: '20%' })}
                    {TH('GP', { textAlign: 'right' as const, width: '10%' })}
                    <th style={{ width: 36, background: '#F2F6F8' }} />
                  </tr>
                </thead>
                <tbody>
                  {hwItems.map((item, i) => {
                    const gp = calcGrossProfit(numVal(item.sellingPrice), numVal(item.cost))
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #F2F6F8' }}>
                        {TD(
                          <Input value={item.name} onChange={e => updateHw(i, 'name', e.target.value)}
                            placeholder="ชื่อสินค้า รุ่น ยี่ห้อ" error={errors[`hw${i}.name`]}
                            style={{ border: errors[`hw${i}.name`] ? '1.5px solid #F3554F' : undefined }} />,
                        )}
                        {TD(
                          <Input type="number" value={item.sellingPrice} min="0" step="1000"
                            onChange={e => updateHw(i, 'sellingPrice', e.target.value ? Number(e.target.value) : '')}
                            error={errors[`hw${i}.sell`]}
                            style={{ textAlign: 'right', border: errors[`hw${i}.sell`] ? '1.5px solid #F3554F' : undefined }} />,
                          { textAlign: 'right' as const },
                        )}
                        {TD(
                          <Input type="number" value={item.cost} min="0" step="1000"
                            onChange={e => updateHw(i, 'cost', e.target.value ? Number(e.target.value) : '')}
                            style={{ textAlign: 'right' }} />,
                          { textAlign: 'right' as const },
                        )}
                        {TD(
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: gp < 0 ? '#F3554F' : '#001122', fontWeight: 600 }}>
                            {numVal(item.sellingPrice) > 0 ? formatCurrency(gp) : '—'}
                          </span>,
                          { textAlign: 'right' as const },
                        )}
                        <td style={{ padding: '8px 6px', textAlign: 'center' as const, verticalAlign: 'middle' }}>
                          <button onClick={() => removeHw(i)} disabled={hwItems.length <= 1}
                            style={{ background: 'none', border: 'none', cursor: hwItems.length > 1 ? 'pointer' : 'default', color: hwItems.length > 1 ? '#F3554F' : '#D0D6DF', padding: 3 }}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#FAFBFC', borderTop: '2px solid #D0D6DF' }}>
                    <td style={{ padding: '8px 10px' }}>
                      <Button variant="ghost" size="sm" icon={<Plus size={12} />} onClick={addHw}>เพิ่มรายการ</Button>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#001122' }}>
                      {hwSelling > 0 ? formatCurrency(hwSelling) : '—'}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#586782' }}>
                      {hwCost > 0 ? formatCurrency(hwCost) : '—'}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: (hwSelling - hwCost) < 0 ? '#F3554F' : '#001122' }}>
                      {hwSelling > 0 ? formatCurrency(hwSelling - hwCost) : '—'}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Q2 Software & Installation */}
          {showSw && (
            <div>
              {qBadge(q2No)}
              <div style={{ border: '1px solid #D0D6DF', borderRadius: 10, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #D0D6DF' }}>
                      {TH('รายการ', { width: '35%' })}
                      {TH('ราคาขาย (THB)', { textAlign: 'right' as const })}
                      {TH('ราคาทุน (THB)', { textAlign: 'right' as const })}
                      {TH('GP', { textAlign: 'right' as const })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #F2F6F8' }}>
                      {TD(<span style={{ fontWeight: 600, color: '#001122' }}>Software</span>)}
                      {TD(
                        <Input type="number" value={String(fd.softwareSellingPrice ?? '')} min="0" step="1000"
                          onChange={e => update({ softwareSellingPrice: e.target.value ? Number(e.target.value) : '' })}
                          style={{ textAlign: 'right' }} />,
                        { textAlign: 'right' as const },
                      )}
                      {TD(
                        <Input type="number" value={String(fd.softwareCost ?? '')} min="0" step="1000"
                          onChange={e => update({ softwareCost: e.target.value ? Number(e.target.value) : '' })}
                          style={{ textAlign: 'right' }} />,
                        { textAlign: 'right' as const },
                      )}
                      {TD(
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: (swSelling - swCost) < 0 ? '#F3554F' : '#001122' }}>
                          {swSelling > 0 ? formatCurrency(swSelling - swCost) : '—'}
                        </span>,
                        { textAlign: 'right' as const },
                      )}
                    </tr>
                    <tr>
                      {TD(<span style={{ fontWeight: 600, color: '#001122' }}>Installation</span>)}
                      {TD(
                        <Input type="number" value={String(fd.installationSellingPrice ?? '')} min="0" step="1000"
                          onChange={e => update({ installationSellingPrice: e.target.value ? Number(e.target.value) : '' })}
                          style={{ textAlign: 'right' }} />,
                        { textAlign: 'right' as const },
                      )}
                      {TD(
                        <Input type="number" value={String(fd.installationCost ?? '')} min="0" step="1000"
                          onChange={e => update({ installationCost: e.target.value ? Number(e.target.value) : '' })}
                          style={{ textAlign: 'right' }} />,
                        { textAlign: 'right' as const },
                      )}
                      {TD(
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: (instSelling - instCost) < 0 ? '#F3554F' : '#001122' }}>
                          {instSelling > 0 ? formatCurrency(instSelling - instCost) : '—'}
                        </span>,
                        { textAlign: 'right' as const },
                      )}
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#FAFBFC', borderTop: '2px solid #D0D6DF' }}>
                      <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#586782', textTransform: 'uppercase', letterSpacing: '0.05em' }}>รวม Q2</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#001122' }}>
                        {(swSelling + instSelling) > 0 ? formatCurrency(swSelling + instSelling) : '—'}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#586782' }}>
                        {(swCost + instCost) > 0 ? formatCurrency(swCost + instCost) : '—'}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: ((swSelling + instSelling) - (swCost + instCost)) < 0 ? '#F3554F' : '#001122' }}>
                        {(swSelling + instSelling) > 0 ? formatCurrency((swSelling + instSelling) - (swCost + instCost)) : '—'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Grand Total */}
          {totalSelling > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: '#D0D6DF', borderRadius: 10, overflow: 'hidden', border: '1px solid #D0D6DF' }}>
              {[
                { label: 'ราคาขายรวม', value: formatCurrency(totalSelling), color: '#001122' },
                { label: 'ต้นทุนรวม', value: formatCurrency(totalCost), color: '#586782' },
                { label: 'Gross Profit', value: formatCurrency(totalGP), color: totalGP < 0 ? '#F3554F' : '#004081' },
              ].map(f => (
                <div key={f.label} style={{ background: '#FAFBFC', padding: '14px 20px', textAlign: 'center' as const }}>
                  <div style={{ fontSize: 11, color: '#929EB4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{f.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: f.color, fontFamily: 'JetBrains Mono, monospace' }}>{f.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* ─── Section 4: งวดชำระ ─── */}
      <Card title="งวดชำระ">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#001122', whiteSpace: 'nowrap' }}>จำนวนงวด</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4].map(n => (
                <button key={n} onClick={() => update({ installmentCount: n })} style={{
                  width: 38, height: 38, borderRadius: 8,
                  border: `2px solid ${installmentCount === n ? '#004081' : '#D0D6DF'}`,
                  background: installmentCount === n ? '#004081' : '#fff',
                  color: installmentCount === n ? '#fff' : '#586782',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s',
                }}>{n}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {installments.slice(0, installmentCount).map((row, i) => {
              const amount = totalSelling > 0 && numVal(row.installmentPercent) > 0
                ? calcInstallmentAmount(totalSelling, numVal(row.installmentPercent)) : 0
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 80px 1fr 1fr auto', gap: '0 10px', alignItems: 'center', padding: '10px 14px', background: '#FAFBFC', border: `1px solid ${(errors[`inst${i}.pct`] || errors[`inst${i}.cond`]) ? '#F3554F' : '#D0D6DF'}`, borderRadius: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#004081', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <FormGroup error={errors[`inst${i}.pct`]}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Input type="number" min="1" max="100" value={row.installmentPercent}
                        onChange={e => updateInst(i, 'installmentPercent', e.target.value ? Number(e.target.value) : '')}
                        style={{ textAlign: 'right', width: 56 }} error={errors[`inst${i}.pct`]} />
                      <span style={{ color: '#586782', fontSize: 13, fontWeight: 600 }}>%</span>
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Input type="number" min="0" value={row.creditTermDays}
                        onChange={e => updateInst(i, 'creditTermDays', e.target.value !== '' ? Number(e.target.value) : 0)}
                        placeholder="0 = COD" style={{ width: 80, textAlign: 'right' }} />
                      <span style={{ color: '#586782', fontSize: 12, whiteSpace: 'nowrap' }}>วัน</span>
                      {numVal(row.creditTermDays) > 0 && (
                        <span style={{ fontSize: 11, color: '#66C5C5', fontWeight: 600 }}>{formatCreditTerm(numVal(row.creditTermDays))}</span>
                      )}
                    </div>
                  </FormGroup>
                  <FormGroup error={errors[`inst${i}.cond`]}>
                    <Select value={row.paymentCondition} onChange={e => updateInst(i, 'paymentCondition', e.target.value)} error={errors[`inst${i}.cond`]}>
                      <option value="">— เงื่อนไข —</option>
                      {(Object.entries(PAYMENT_CONDITION_LABELS) as [PaymentCondition, string][]).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </Select>
                  </FormGroup>
                  {amount > 0 && (
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#004081', whiteSpace: 'nowrap', paddingLeft: 4 }}>
                      {formatCurrency(amount)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 20, padding: '10px 14px', background: pctOk && installmentCount > 0 ? 'rgba(102,197,197,0.08)' : 'rgba(243,85,79,0.06)', border: `1px solid ${pctOk && installmentCount > 0 ? '#66C5C5' : '#F3554F'}`, borderRadius: 8, fontSize: 13 }}>
            <span>รวม: <strong style={{ color: pctOk ? '#66C5C5' : '#F3554F' }}>{totalPct.toFixed(0)}%</strong>{pctOk ? ' ✓' : ' ⚠'}</span>
            <span style={{ color: '#929EB4' }}>·</span>
            <span>Max Credit Term: <strong>{formatCreditTerm(maxCreditTerm)}</strong></span>
            {totalSelling > 0 && <><span style={{ color: '#929EB4' }}>·</span><span>Total: <strong>{formatCurrency(totalSelling)}</strong></span></>}
          </div>
          {errors.totalPct && <div style={{ fontSize: 12, color: '#F3554F', marginTop: 4 }}>{errors.totalPct}</div>}
        </div>
      </Card>

      {/* ─── ยืนยันและส่ง ─── */}
      <div style={{ background: '#fff', border: '1px solid #D0D6DF', borderRadius: 14, padding: '20px 24px' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 16 }}>
          <input type="checkbox" checked={confirmed} onChange={e => { setConfirmed(e.target.checked); setSubmitError('') }}
            style={{ marginTop: 2, accentColor: '#004081', width: 16, height: 16 }} />
          <span style={{ fontSize: 14, lineHeight: 1.5, color: '#001122' }}>
            ข้าพเจ้ายืนยันว่าข้อมูลที่กรอกถูกต้อง และพร้อมสำหรับการพิจารณาอนุมัติ
          </span>
        </label>
        {submitError && <div style={{ marginBottom: 12, fontSize: 12, color: '#F3554F' }}>{submitError}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="ghost" icon={<Save size={15} />} onClick={handleDraft} loading={draftLoading} disabled={submitLoading}>
            บันทึกแบบร่าง
          </Button>
          <Button icon={<Send size={15} />} onClick={handleSubmit} loading={submitLoading} disabled={draftLoading}>
            {isResubmit ? 'ส่งขออนุมัติอีกครั้ง' : 'ส่งขออนุมัติ'}
          </Button>
        </div>
      </div>

    </div>
  )
}

function getDefaults(user: CurrentUser): Record<string, unknown> {
  return {
    salesName: user.name,
    salesEmail: user.email,
    salesId: user.id,
    proposalNo: '',
    projectName: '',
    saleType: '',
    customerType: '',
    newCustomer: { companyName: '', contactPerson: '', contactPhone: '' },
    existingCustomerId: '',
    existingCustomer: {},
    reseller: { resellerId: '', resellerCompanyName: '', endCustomerCompanyName: '', endCustomerContactPerson: '', endCustomerPhone: '' },
    hardwareItems: [{ name: '', sellingPrice: '', cost: '' }],
    softwareSellingPrice: '',
    softwareCost: '',
    installationSellingPrice: '',
    installationCost: '',
    installmentCount: 1,
    installments: [{ installmentPercent: '', creditTermDays: 0, paymentCondition: 'on_delivery' }],
  }
}

function flattenRequest(req: Request): Record<string, unknown> {
  const d: Record<string, unknown> = {
    salesName: req.salesName,
    salesEmail: req.salesEmail,
    salesId: req.salesId,
    proposalNo: req.proposalNo,
    projectName: req.projectName,
    saleType: req.saleType,
    customerType: req.customerInfo.type,
    installmentCount: req.installmentCount,
    installments: req.installments.map(i => ({
      installmentPercent: i.installmentPercent,
      creditTermDays: i.creditTermDays,
      paymentCondition: i.paymentCondition,
    })),
    newCustomer: { companyName: '', contactPerson: '', contactPhone: '' },
    existingCustomerId: '',
    existingCustomer: {},
    reseller: { resellerId: '', resellerCompanyName: '', endCustomerCompanyName: '', endCustomerContactPerson: '', endCustomerPhone: '' },
    softwareSellingPrice: '',
    softwareCost: '',
    installationSellingPrice: '',
    installationCost: '',
  }

  const ci = req.customerInfo
  if (ci.type === 'new') {
    d.newCustomer = { companyName: ci.data.companyName, contactPerson: ci.data.contactPerson ?? '', contactPhone: ci.data.contactPhone ?? '' }
  } else if (ci.type === 'existing') {
    d.existingCustomerId = ci.data.customerId
    d.existingCustomer = { companyName: ci.data.companyName, taxId: ci.data.taxId ?? '', defaultCreditTerm: ci.data.defaultCreditTerm ?? 0, contactPerson: ci.data.contactPerson ?? '', contactPhone: ci.data.contactPhone ?? '' }
  } else if (ci.type === 'reseller') {
    d.reseller = { resellerId: ci.data.resellerId, resellerCompanyName: ci.data.resellerCompanyName, endCustomerCompanyName: ci.data.endCustomerCompanyName, endCustomerContactPerson: ci.data.endCustomerContactPerson ?? '', endCustomerPhone: ci.data.endCustomerPhone ?? '' }
  }

  const hw = req.quotationItems.filter(i => i.type === 'hardware')
  const sw = req.quotationItems.find(i => i.type === 'software')
  const inst = req.quotationItems.find(i => i.type === 'installation')
  d.hardwareItems = hw.length > 0
    ? hw.map(h => ({ name: h.name, sellingPrice: h.sellingPrice, cost: h.cost }))
    : [{ name: '', sellingPrice: '', cost: '' }]
  if (sw) { d.softwareSellingPrice = sw.sellingPrice; d.softwareCost = sw.cost }
  if (inst) { d.installationSellingPrice = inst.sellingPrice; d.installationCost = inst.cost }

  return d
}
