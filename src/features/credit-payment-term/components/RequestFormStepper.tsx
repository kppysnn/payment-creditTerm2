import { useState, useEffect } from 'react'
import type { Request } from '../types/request'
import type { CurrentUser } from '../types/user'
import type { Customer, CustomerType } from '../types/customer'
import { CUSTOMER_TYPE_LABELS } from '../types/customer'
import { type SaleType, type PaymentCondition } from '../types/request'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { FormGroup, Input } from '../../../components/ui/FormField'
import { Alert } from '../../../components/ui/Alert'
import { formatCurrency, calcInstallmentAmount, calcTotalInstallmentPercent } from '../utils/calculations'
import { formatCreditTerm } from '../utils/formatters'
import { searchCustomers } from '../services/customerService'
import { Save, Send, X } from 'lucide-react'

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
  { value: 'hardware', label: 'Quotation เดียว' },
  { value: 'hardware_software_installation', label: 'แยก Quotation' },
]
const CUSTOMER_TYPES: CustomerType[] = ['new', 'existing', 'reseller']

const INSTALLMENT_PRESETS: Record<number, Array<{ label: string; percents: number[] }>> = {
  2: [
    { label: '50 / 50', percents: [50, 50] },
    { label: '30 / 70', percents: [30, 70] },
    { label: '40 / 60', percents: [40, 60] },
    { label: '70 / 30', percents: [70, 30] },
  ],
  3: [
    { label: '30 / 30 / 40', percents: [30, 30, 40] },
    { label: '33 / 33 / 34', percents: [33, 33, 34] },
    { label: '25 / 50 / 25', percents: [25, 50, 25] },
    { label: '20 / 30 / 50', percents: [20, 30, 50] },
  ],
  4: [
    { label: '25 / 25 / 25 / 25', percents: [25, 25, 25, 25] },
    { label: '30 / 30 / 30 / 10', percents: [30, 30, 30, 10] },
    { label: '40 / 20 / 20 / 20', percents: [40, 20, 20, 20] },
    { label: '20 / 20 / 30 / 30', percents: [20, 20, 30, 30] },
  ],
}

function numVal(v: unknown): number { return Number(v) || 0 }

export function RequestFormStepper({
  initialRequest, currentUser, onSaveDraft, onSubmit, onResubmit, isResubmit = false,
}: Props) {
  const [formData, setFormData] = useState<Record<string, unknown>>(
    initialRequest ? flattenRequest(initialRequest) : getDefaults(currentUser),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Customer combobox state
  const [existingDropdownOpen, setExistingDropdownOpen] = useState(false)
  const [existingResults, setExistingResults] = useState<Customer[]>([])
  const [resellerDropdownOpen, setResellerDropdownOpen] = useState(false)
  const [resellerResults, setResellerResults] = useState<Customer[]>([])

  // Submit state
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
  const hwSelling   = numVal(fd.hardwareSellingPrice)
  const hwCost      = numVal(fd.hardwareCost)
  const swSelling   = numVal(fd.softwareSellingPrice)
  const swCost      = numVal(fd.softwareCost)
  const instSelling = numVal(fd.installationSellingPrice)
  const instCost    = numVal(fd.installationCost)
  const totalSelling = hwSelling + (showSw ? swSelling + instSelling : 0)
  const totalCost    = hwCost    + (showSw ? swCost    + instCost    : 0)

  const curPcts = installments.slice(0, installmentCount).map(r => numVal(r.installmentPercent))
  const isCustomPreset = installmentCount < 2 ? false : !(INSTALLMENT_PRESETS[installmentCount] ?? []).some(p => p.percents.every((v, idx) => v === curPcts[idx]))

  const totalPct = calcTotalInstallmentPercent(installments.slice(0, installmentCount))
  const pctOk = Math.abs(totalPct - 100) < 0.01

  function update(patch: Record<string, unknown>) {
    setFormData(prev => ({ ...prev, ...patch }))
  }

  /* ── Existing-customer combobox ── */
  async function onExistingType(q: string) {
    update({ existingCustomer: { ...ec, companyName: q }, existingCustomerId: '' })
    const res = await searchCustomers(q)
    setExistingResults(res)
    setExistingDropdownOpen(res.length > 0)
  }
  function selectExisting(c: Customer) {
    update({
      existingCustomerId: c.id,
      existingCustomer: { companyName: c.companyName, taxId: c.taxId ?? '', defaultCreditTerm: c.defaultCreditTerm ?? 0, contactPerson: c.contactPerson ?? '', contactPhone: c.contactPhone ?? '' },
    })
    setExistingDropdownOpen(false)
    setExistingResults([])
  }

  /* ── Reseller combobox ── */
  async function onResellerType(q: string) {
    update({ reseller: { ...rs, resellerCompanyName: q, resellerId: '' } })
    const res = await searchCustomers(q)
    setResellerResults(res)
    setResellerDropdownOpen(res.length > 0)
  }
  function selectReseller(c: Customer) {
    update({ reseller: { ...rs, resellerId: c.id, resellerCompanyName: c.companyName } })
    setResellerDropdownOpen(false)
    setResellerResults([])
  }

  function updateInst(i: number, field: keyof InstRow, value: unknown) {
    const updated = [...installments]
    if (!updated[i]) updated[i] = { installmentPercent: '', creditTermDays: 0, paymentCondition: 'on_delivery' }
    updated[i] = { ...updated[i], [field]: value }
    update({ installments: updated })
  }

  function applyPreset(percents: number[]) {
    const updated = percents.map((p, idx) => ({
      ...(installments[idx] || { creditTermDays: 0, paymentCondition: 'on_delivery' as PaymentCondition }),
      installmentPercent: p,
    }))
    update({ installments: updated, installmentCount: percents.length })
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!String(fd.proposalNo || '').trim()) e.proposalNo = 'กรุณาระบุ'
    if (!saleType) e.saleType = 'กรุณาเลือก'
    if (!customerType) e.customerType = 'กรุณาเลือก'
    if (customerType === 'new' && !nc?.companyName?.trim()) e['new.companyName'] = 'กรุณาระบุชื่อบริษัท'
    if (customerType === 'existing' && !String(ec.companyName || '').trim()) e.existingCompanyName = 'กรุณาระบุหรือค้นหาบริษัท'
    if (customerType === 'reseller') {
      if (!rs?.resellerCompanyName?.trim()) e['res.resellerCompanyName'] = 'กรุณาระบุหรือค้นหา Reseller'
      if (!rs?.endCustomerCompanyName?.trim()) e['res.endCustomerCompanyName'] = 'กรุณาระบุลูกค้าปลายทาง'
    }
    if (numVal(fd.hardwareSellingPrice) <= 0) e.hwSell = 'กรุณาระบุราคาขาย Hardware'
    installments.slice(0, installmentCount).forEach((row, i) => {
      if (!row.installmentPercent) e[`inst${i}.pct`] = 'ระบุ%'
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

  /* ── Shared styles ── */
  const radioCard = (active: boolean, color = '#004081') => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px',
    border: `2px solid ${active ? color : '#D0D6DF'}`,
    borderRadius: 10, cursor: 'pointer',
    background: active ? `${color}12` : '#fff',
    transition: 'all 0.15s',
  } as React.CSSProperties)

  const comboDropdown = (
    results: Customer[],
    visible: boolean,
    onSelect: (c: Customer) => void,
  ) => visible && results.length > 0 && (
    <div style={{ position: 'absolute', zIndex: 30, width: '100%', top: '100%', background: '#fff', border: '1px solid #D0D6DF', borderRadius: 8, boxShadow: '0 4px 14px rgba(0,64,129,0.12)', overflow: 'hidden', marginTop: 2 }}>
      {results.map(c => (
        <button key={c.id}
          onMouseDown={e => { e.preventDefault(); onSelect(c) }}
          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid #F2F6F8', fontSize: 13 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F2F6F8' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
        >
          <div style={{ fontWeight: 600, color: '#001122' }}>{c.companyName}</div>
          <div style={{ color: '#929EB4', fontSize: 12, marginTop: 2 }}>Net {c.defaultCreditTerm ?? 0} วัน · {c.contactPerson}</div>
        </button>
      ))}
    </div>
  )

  const priceRow = (label: string, spKey: string, costKey: string) => (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: '0 16px', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F2F6F8' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#001122' }}>{label}</div>
      <FormGroup label="ราคาขาย (THB)" error={spKey === 'hardwareSellingPrice' ? errors.hwSell : undefined}>
        <Input
          type="number" min="0" step="1000"
          value={String(fd[spKey] ?? '')}
          onChange={e => update({ [spKey]: e.target.value ? Number(e.target.value) : '' })}
          style={{ textAlign: 'right' }}
          error={spKey === 'hardwareSellingPrice' ? errors.hwSell : undefined}
        />
      </FormGroup>
      <FormGroup label="ราคาทุน (THB)">
        <Input
          type="number" min="0" step="1000"
          value={String(fd[costKey] ?? '')}
          onChange={e => update({ [costKey]: e.target.value ? Number(e.target.value) : '' })}
          style={{ textAlign: 'right' }}
        />
      </FormGroup>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

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
          <FormGroup label="Proposal No." required error={errors.proposalNo}>
            <Input value={String(fd.proposalNo || '')} onChange={e => update({ proposalNo: e.target.value })} placeholder="PRO-2026-001" error={errors.proposalNo} />
          </FormGroup>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#586782', marginBottom: 8 }}>ประเภทการขาย <span style={{ color: '#F3554F' }}>*</span></div>
            <div style={{ display: 'flex', gap: 10 }}>
              {SALE_TYPES.map(t => (
                <label key={t.value} style={{ flex: 1, ...radioCard(saleType === t.value) }}>
                  <input type="radio" name="saleType" value={t.value} checked={saleType === t.value}
                    onChange={() => update({ saleType: t.value })} style={{ accentColor: '#004081', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, fontSize: 13, color: saleType === t.value ? '#004081' : '#001122' }}>{t.label}</span>
                </label>
              ))}
            </div>
            {errors.saleType && <div style={{ fontSize: 12, color: '#F3554F', marginTop: 5 }}>{errors.saleType}</div>}
          </div>

        </div>
      </Card>

      {/* ─── Section 2: ข้อมูลลูกค้า ─── */}
      <Card title="ข้อมูลลูกค้า">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Customer type selector */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#586782', marginBottom: 8 }}>ประเภทลูกค้า <span style={{ color: '#F3554F' }}>*</span></div>
            <div style={{ display: 'flex', gap: 10 }}>
              {CUSTOMER_TYPES.map(type => (
                <label key={type} style={{ flex: 1, ...radioCard(customerType === type, '#66C5C5') }}>
                  <input type="radio" name="customerType" value={type} checked={customerType === type}
                    onChange={() => { update({ customerType: type }); setExistingDropdownOpen(false); setResellerDropdownOpen(false) }}
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
                  <Input value={nc.companyName ?? ''} onChange={e => update({ newCustomer: { ...nc, companyName: e.target.value } })} placeholder="บริษัท..." error={errors['new.companyName']} />
                </FormGroup>
                <FormGroup label="ผู้ติดต่อ">
                  <Input value={nc.contactPerson ?? ''} onChange={e => update({ newCustomer: { ...nc, contactPerson: e.target.value } })} placeholder="ชื่อ-นามสกุล" />
                </FormGroup>
                <FormGroup label="เบอร์โทร">
                  <Input value={nc.contactPhone ?? ''} onChange={e => update({ newCustomer: { ...nc, contactPhone: e.target.value } })} placeholder="0x-xxxx-xxxx" />
                </FormGroup>
              </div>
            </div>
          )}

          {/* ลูกค้าเก่า — combobox */}
          {customerType === 'existing' && (
            <div style={{ background: '#FAFBFC', border: '1px solid #D0D6DF', borderRadius: 10, padding: '16px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#586782', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>เลือกลูกค้าเก่า</div>
              <FormGroup label="ชื่อบริษัท" required error={errors.existingCompanyName}>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'relative' }}>
                    <Input
                      value={String(ec.companyName ?? '')}
                      onChange={e => onExistingType(e.target.value)}
                      onFocus={async () => {
                        const r = await searchCustomers('')
                        setExistingResults(r); setExistingDropdownOpen(r.length > 0)
                      }}
                      onBlur={() => setTimeout(() => setExistingDropdownOpen(false), 150)}
                      placeholder="พิมพ์เพื่อค้นหา หรือกรอกชื่อบริษัทโดยตรง"
                      error={errors.existingCompanyName}
                      style={{ paddingRight: ec.companyName ? 32 : undefined }}
                    />
                    {!!ec.companyName && (
                      <button
                        onClick={() => update({ existingCustomerId: '', existingCustomer: { companyName: '', defaultCreditTerm: 0 } })}
                        style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#929EB4', padding: 2, display: 'flex' }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  {comboDropdown(existingResults, existingDropdownOpen, selectExisting)}
                </div>
              </FormGroup>
              {!!fd.existingCustomerId && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(102,197,197,0.08)', border: '1px solid rgba(102,197,197,0.3)', borderRadius: 8 }}>
                  <span style={{ fontSize: 11, color: '#66C5C5', fontWeight: 700 }}>✓ เชื่อมกับฐานข้อมูล</span>
                  <span style={{ fontSize: 12, color: '#586782' }}>Default credit: Net {numVal(ec.defaultCreditTerm)} วัน</span>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginTop: 12 }}>
                <FormGroup label="ผู้ติดต่อ">
                  <Input value={String(ec.contactPerson ?? '')} onChange={e => update({ existingCustomer: { ...ec, contactPerson: e.target.value } })} placeholder="ชื่อ-นามสกุล" />
                </FormGroup>
                <FormGroup label="เบอร์โทร">
                  <Input value={String(ec.contactPhone ?? '')} onChange={e => update({ existingCustomer: { ...ec, contactPhone: e.target.value } })} placeholder="0x-xxxx-xxxx" />
                </FormGroup>
              </div>
            </div>
          )}

          {/* Reseller — combobox */}
          {customerType === 'reseller' && (
            <div style={{ background: '#FAFBFC', border: '1px solid #D0D6DF', borderRadius: 10, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Reseller combobox */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#586782', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Reseller</div>
                <FormGroup error={errors['res.resellerCompanyName']}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'relative' }}>
                      <Input
                        value={rs.resellerCompanyName ?? ''}
                        onChange={e => onResellerType(e.target.value)}
                        onFocus={async () => {
                          const r = await searchCustomers('')
                          setResellerResults(r); setResellerDropdownOpen(r.length > 0)
                        }}
                        onBlur={() => setTimeout(() => setResellerDropdownOpen(false), 150)}
                        placeholder="พิมพ์เพื่อค้นหา หรือกรอกชื่อ Reseller โดยตรง"
                        error={errors['res.resellerCompanyName']}
                        style={{ paddingRight: rs.resellerCompanyName ? 32 : undefined }}
                      />
                      {rs.resellerCompanyName && (
                        <button
                          onClick={() => update({ reseller: { ...rs, resellerId: '', resellerCompanyName: '' } })}
                          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#929EB4', padding: 2, display: 'flex' }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    {comboDropdown(resellerResults, resellerDropdownOpen, selectReseller)}
                  </div>
                </FormGroup>
                {rs.resellerId && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(102,197,197,0.08)', border: '1px solid rgba(102,197,197,0.3)', borderRadius: 8 }}>
                    <span style={{ fontSize: 11, color: '#66C5C5', fontWeight: 700 }}>✓ เชื่อมกับฐานข้อมูล</span>
                  </div>
                )}
              </div>

              {/* End Customer */}
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
                    <Input value={rs.endCustomerContactPerson ?? ''} onChange={e => update({ reseller: { ...rs, endCustomerContactPerson: e.target.value } })} placeholder="ชื่อ-นามสกุล" />
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

      {/* ─── Section 3: ราคา ─── */}
      <Card title="ราคาขายและต้นทุน">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Hardware group */}
          <div style={{ border: '1px solid #D0D6DF', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ background: '#002B5C', padding: '7px 14px' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hardware</span>
            </div>
            <div style={{ padding: '0 14px' }}>
              {priceRow('Hardware', 'hardwareSellingPrice', 'hardwareCost')}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: '#F2F6F8', borderTop: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: 11, color: '#586782', fontWeight: 600, textTransform: 'uppercase' }}>รวม Hardware</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#004081', fontSize: 14 }}>{hwSelling > 0 ? formatCurrency(hwSelling) : '—'}</span>
            </div>
          </div>

          {/* Software & Installation group */}
          {showSw && (
            <div style={{ border: '1px solid #D0D6DF', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ background: '#3D5580', padding: '7px 14px' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Software &amp; Installation</span>
              </div>
              <div style={{ padding: '0 14px' }}>
                {priceRow('Software', 'softwareSellingPrice', 'softwareCost')}
                {priceRow('Installation', 'installationSellingPrice', 'installationCost')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: '#F2F6F8', borderTop: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 11, color: '#586782', fontWeight: 600, textTransform: 'uppercase' }}>รวม SW &amp; Inst</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#3D5580', fontSize: 14 }}>{(swSelling + instSelling) > 0 ? formatCurrency(swSelling + instSelling) : '—'}</span>
              </div>
            </div>
          )}

          {/* Summary card */}
          {(totalSelling > 0 || totalCost > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
              <div style={{ padding: '12px 16px', background: '#004081', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>ราคาขายรวม</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#fff', fontSize: 16 }}>{totalSelling > 0 ? formatCurrency(totalSelling) : '—'}</div>
              </div>
              <div style={{ padding: '12px 16px', background: '#F2F6F8', border: '1px solid #D0D6DF', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#929EB4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>ราคาทุนรวม</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#586782', fontSize: 16 }}>{totalCost > 0 ? formatCurrency(totalCost) : '—'}</div>
              </div>
            </div>
          )}

        </div>
      </Card>

      {/* ─── Section 4: งวดชำระ ─── */}
      <Card title="งวดชำระและ Credit Term">
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

          {/* Preset split suggestions */}
          {installmentCount >= 2 && (INSTALLMENT_PRESETS[installmentCount] ?? []).length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: '#929EB4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>แนะนำสัดส่วน</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(INSTALLMENT_PRESETS[installmentCount] ?? []).map(p => {
                  const isActive = p.percents.every((v, idx) => v === curPcts[idx])
                  return (
                    <button key={p.label} type="button" onClick={() => applyPreset(p.percents)}
                      style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.1s',
                        border: `1.5px solid ${isActive ? '#004081' : '#D0D6DF'}`,
                        background: isActive ? '#004081' : '#fff',
                        color: isActive ? '#fff' : '#586782' }}
                    >{p.label}</button>
                  )
                })}
                <button type="button"
                  onClick={() => {
                    const cleared = installments.slice(0, installmentCount).map(row => ({ ...row, installmentPercent: '' as '' }))
                    update({ installments: cleared })
                  }}
                  style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.1s',
                    border: `1.5px ${isCustomPreset ? 'solid #586782' : 'dashed #D0D6DF'}`,
                    background: isCustomPreset ? '#586782' : '#FAFBFC',
                    color: isCustomPreset ? '#fff' : '#929EB4' }}
                >ระบุเอง</button>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${installmentCount}, 1fr)`, gap: 8 }}>
            {installments.slice(0, installmentCount).map((row, i) => {
              const pct = numVal(row.installmentPercent)
              const totalAmt = totalSelling > 0 && pct > 0 ? calcInstallmentAmount(totalSelling, pct) : 0
              return (
                <div key={i} style={{ background: '#FAFBFC', border: `1px solid ${errors[`inst${i}.pct`] ? '#F3554F' : '#D0D6DF'}`, borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#004081', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontSize: 11, color: '#929EB4', fontWeight: 600 }}>งวดที่ {i + 1}</span>
                  </div>
                  <FormGroup error={errors[`inst${i}.pct`]}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Input type="number" min="1" max="100" value={row.installmentPercent}
                        onChange={e => updateInst(i, 'installmentPercent', e.target.value ? Number(e.target.value) : '')}
                        style={{ textAlign: 'right', flex: 1 }} error={errors[`inst${i}.pct`]} />
                      <span style={{ color: '#586782', fontSize: 12, fontWeight: 600 }}>%</span>
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Input type="number" min="0" value={row.creditTermDays}
                        onChange={e => updateInst(i, 'creditTermDays', e.target.value !== '' ? Number(e.target.value) : 0)}
                        placeholder="0" style={{ flex: 1, textAlign: 'right' }} />
                      <span style={{ color: '#586782', fontSize: 11, whiteSpace: 'nowrap' }}>วัน</span>
                    </div>
                  </FormGroup>
                  {numVal(row.creditTermDays) > 0 && (
                    <div style={{ fontSize: 10, color: '#66C5C5', fontWeight: 600 }}>{formatCreditTerm(numVal(row.creditTermDays))}</div>
                  )}
                  {totalAmt > 0 && (
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#004081', textAlign: 'right', paddingTop: 8, borderTop: '1px solid #E2E8F0', marginTop: 'auto' }}>
                      {formatCurrency(totalAmt)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 100% progress bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: '#586782', fontWeight: 600 }}>รวมสัดส่วนงวดทั้งหมด</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: pctOk ? '#66C5C5' : '#F3554F' }}>
                {totalPct.toFixed(0)}%{pctOk ? ' ✓' : ' ≠ 100%'}
              </span>
            </div>
            <div style={{ height: 7, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(totalPct, 100)}%`, background: pctOk ? '#66C5C5' : '#F3554F', borderRadius: 4, transition: 'width 0.3s' }} />
            </div>
          </div>

          {/* Grand total summary — Q1/Q2 breakdown */}
          {totalSelling > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: showSw ? '1fr 1fr 1fr' : '1fr', gap: 12, padding: '12px 14px', background: '#F2F6F8', borderRadius: 8, border: '1px solid #D0D6DF' }}>
              {showSw && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#586782', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Q1 Hardware</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#004081', fontSize: 14 }}>{formatCurrency(hwSelling)}</div>
                </div>
              )}
              {showSw && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#586782', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Q2 SW &amp; Inst</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#004081', fontSize: 14 }}>{formatCurrency(swSelling + instSelling)}</div>
                </div>
              )}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#586782', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>ยอดรวม</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#004081', fontSize: showSw ? 16 : 14 }}>{formatCurrency(totalSelling)}</div>
              </div>
            </div>
          )}
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
    existingCustomer: { companyName: '', defaultCreditTerm: 0, contactPerson: '', contactPhone: '' },
    reseller: { resellerId: '', resellerCompanyName: '', endCustomerCompanyName: '', endCustomerContactPerson: '', endCustomerPhone: '' },
    hardwareSellingPrice: '',
    hardwareCost: '',
    softwareSellingPrice: '',
    softwareCost: '',
    installationSellingPrice: '',
    installationCost: '',
    installmentCount: 1,
    installments: [{ installmentPercent: '', creditTermDays: 0, paymentCondition: 'on_delivery' }],
  }
}

function flattenRequest(req: Request): Record<string, unknown> {
  const hw = req.quotationItems.filter(i => i.type === 'hardware')
  const sw = req.quotationItems.find(i => i.type === 'software')
  const inst = req.quotationItems.find(i => i.type === 'installation')

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
    existingCustomer: { companyName: '', defaultCreditTerm: 0, contactPerson: '', contactPhone: '' },
    reseller: { resellerId: '', resellerCompanyName: '', endCustomerCompanyName: '', endCustomerContactPerson: '', endCustomerPhone: '' },
    hardwareSellingPrice: hw.reduce((s, i) => s + i.sellingPrice, 0),
    hardwareCost: hw.reduce((s, i) => s + i.cost, 0),
    softwareSellingPrice: sw?.sellingPrice ?? '',
    softwareCost: sw?.cost ?? '',
    installationSellingPrice: inst?.sellingPrice ?? '',
    installationCost: inst?.cost ?? '',
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

  return d
}
