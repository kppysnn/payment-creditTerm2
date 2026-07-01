import { useState, useEffect } from 'react'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { FormGroup, Input, Select, Textarea } from '../../../components/ui/FormField'
import { Alert } from '../../../components/ui/Alert'
import { PAYMENT_CONDITION_LABELS, type PaymentCondition } from '../types/request'
import { calcInstallmentAmount, calcTotalInstallmentPercent, formatCurrency } from '../utils/calculations'
import { formatCreditTerm } from '../utils/formatters'
import { ChevronIcon } from '../../../components/icons/FigmaIcons'

const TH = (children: React.ReactNode, style?: React.CSSProperties) => (
  <th style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 700, color: '#586782', fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.05em', background: '#F2F6F8', whiteSpace: 'nowrap' as const, ...style }}>{children}</th>
)

interface InstallmentRow {
  installmentPercent: number | ''
  creditTermDays: number | ''
  paymentCondition: PaymentCondition | ''
  creditTermReason: string
  remark: string
}

interface Props {
  data: Record<string, unknown>
  onChange: (patch: Record<string, unknown>) => void
  onNext: () => void
  onBack: () => void
}

function numVal(v: unknown): number { return Number(v) || 0 }

export function PaymentCreditTermStep({ data, onChange, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const installmentCount = numVal(data.installmentCount) || 1
  const installments = (data.installments as InstallmentRow[]) ?? []
  const customerType = String(data.customerType || '')

  const totalSelling =
    (data.hardwareItems as Array<{ sellingPrice: number | '' }>)?.reduce((s, i) => s + numVal(i.sellingPrice), 0) +
    numVal(data.softwareSellingPrice) +
    numVal(data.installationSellingPrice)

  /* Sync rows when count changes */
  useEffect(() => {
    const current = [...installments]
    while (current.length < installmentCount) {
      current.push({ installmentPercent: '', creditTermDays: '', paymentCondition: '', creditTermReason: '', remark: '' })
    }
    onChange({ installments: current.slice(0, installmentCount) })
  }, [installmentCount])

  function updateRow(i: number, field: keyof InstallmentRow, value: unknown) {
    const updated = [...installments]
    if (!updated[i]) updated[i] = { installmentPercent: '', creditTermDays: '', paymentCondition: '', creditTermReason: '', remark: '' }
    updated[i] = { ...updated[i], [field]: value }
    onChange({ installments: updated })
  }

  const totalPercent = calcTotalInstallmentPercent(installments)
  const maxCreditTerm = installments.reduce((m, i) => Math.max(m, numVal(i.creditTermDays)), 0)
  const newCustomerWithCreditTerm = customerType === 'new' && maxCreditTerm > 0

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!String(data.paymentTermReason || '').trim()) e.paymentTermReason = 'กรุณาระบุเหตุผล'
    installments.slice(0, installmentCount).forEach((row, i) => {
      if (!row.installmentPercent) e[`inst${i}.pct`] = 'กรุณาระบุ%'
      if (row.creditTermDays === '' || row.creditTermDays === undefined) e[`inst${i}.days`] = 'กรุณาระบุวัน'
      if (!row.paymentCondition) e[`inst${i}.cond`] = 'กรุณาเลือก'
      if (!row.creditTermReason.trim()) e[`inst${i}.reason`] = 'กรุณาระบุเหตุผล'
    })
    if (Math.abs(totalPercent - 100) > 0.01) e.totalPct = 'ผลรวม % ต้องเท่ากับ 100%'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <Card title="Step 4 — Credit & Payment Term">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Count + reason */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#586782', marginBottom: 8 }}>
                จำนวนงวด <span style={{ color: '#F3554F', marginLeft: 3 }}>*</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {([
                  { n: 1, hint: '100%' },
                  { n: 2, hint: '30/70' },
                  { n: 3, hint: '30/30/40' },
                  { n: 4, hint: '25×4' },
                ] as const).map(({ n, hint }) => (
                  <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <button
                      onClick={() => onChange({ installmentCount: n })}
                      style={{
                        width: 42, height: 42, borderRadius: 6,
                        border: `2px solid ${installmentCount === n ? '#004081' : '#D0D6DF'}`,
                        background: installmentCount === n ? '#004081' : '#fff',
                        color: installmentCount === n ? '#fff' : '#586782',
                        fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {n}
                    </button>
                    <span style={{ fontSize: 10, color: '#929EB4', fontWeight: 600, whiteSpace: 'nowrap' }}>{hint}</span>
                  </div>
                ))}
              </div>
            </div>
            <FormGroup label="เหตุผลการขอเงื่อนไขการชำระ (Payment Term Reason)" required error={errors.paymentTermReason} style={{ flex: 1 } as React.CSSProperties}>
              <Textarea
                value={String(data.paymentTermReason || '')}
                onChange={e => onChange({ paymentTermReason: e.target.value })}
                rows={2}
                placeholder="อธิบายเหตุผลในการขอเงื่อนไขการชำระ..."
                error={errors.paymentTermReason}
              />
            </FormGroup>
          </div>
        </div>

        <FormGroup label="เหตุผล Credit Term โดยรวม (ถ้ามี)">
          <Textarea
            value={String(data.overallCreditTermReason || '')}
            onChange={e => onChange({ overallCreditTermReason: e.target.value })}
            rows={2}
          />
        </FormGroup>

        {/* Warnings */}
        {newCustomerWithCreditTerm && (
          <Alert type="error" title="ลูกค้าใหม่มี Credit Term มากกว่า 0 วัน">
            กรุณาตรวจสอบความถูกต้องและระบุเหตุผลในแต่ละงวดให้ชัดเจน
          </Alert>
        )}
        {Math.abs(totalPercent - 100) > 0.01 && totalPercent > 0 && (
          <Alert type="warning">ผลรวมเปอร์เซ็นต์ = {totalPercent.toFixed(1)}% (ต้องเท่ากับ 100%)</Alert>
        )}

        {/* Payment Schedule Table */}
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#004081', marginBottom: 12 }}>
            ตาราง Payment Schedule ({installmentCount} งวด)
          </div>

          <div style={{ border: '1px solid #D0D6DF', borderRadius: 6, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #D0D6DF' }}>
                  {TH('#', { width: 40, textAlign: 'center' as const })}
                  {TH('% งวด', { width: 90 })}
                  {TH('Credit Term', { width: 130 })}
                  {TH('เงื่อนไขการชำระ', { width: '20%' })}
                  {TH('เหตุผล Credit Term')}
                  {TH('หมายเหตุ', { width: '14%' })}
                  {TH('จำนวนเงิน', { textAlign: 'right' as const, width: 130 })}
                </tr>
              </thead>
              <tbody>
                {installments.slice(0, installmentCount).map((row, i) => {
                  const amount = calcInstallmentAmount(totalSelling, numVal(row.installmentPercent))
                  const hasRowError = !!(errors[`inst${i}.pct`] || errors[`inst${i}.days`] || errors[`inst${i}.cond`] || errors[`inst${i}.reason`])
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #F2F6F8', background: hasRowError ? 'rgba(243,85,79,0.03)' : undefined }}>
                      <td style={{ padding: '8px 10px', verticalAlign: 'middle', textAlign: 'center' as const }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#004081', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, margin: '0 auto' }}>
                          {i + 1}
                        </div>
                      </td>
                      <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                        <FormGroup error={errors[`inst${i}.pct`]}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Input
                              type="number" min="1" max="100"
                              value={row.installmentPercent}
                              onChange={e => updateRow(i, 'installmentPercent', e.target.value ? Number(e.target.value) : '')}
                              error={errors[`inst${i}.pct`]}
                              style={{ textAlign: 'right', width: 56 }}
                            />
                            <span style={{ color: '#586782', fontSize: 13 }}>%</span>
                          </div>
                        </FormGroup>
                      </td>
                      <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                        <FormGroup error={errors[`inst${i}.days`]}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Input
                                type="number" min="0"
                                value={row.creditTermDays}
                                onChange={e => updateRow(i, 'creditTermDays', e.target.value !== '' ? Number(e.target.value) : '')}
                                placeholder="วัน"
                                error={errors[`inst${i}.days`]}
                                style={{ width: 72, textAlign: 'right' }}
                              />
                              <span style={{ color: '#586782', fontSize: 12 }}>วัน</span>
                            </div>
                            {row.creditTermDays !== '' && (
                              <span style={{ fontSize: 11, color: '#66C5C5', fontWeight: 600 }}>{formatCreditTerm(numVal(row.creditTermDays))}</span>
                            )}
                          </div>
                        </FormGroup>
                      </td>
                      <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                        <FormGroup error={errors[`inst${i}.cond`]}>
                          <Select
                            value={row.paymentCondition}
                            onChange={e => updateRow(i, 'paymentCondition', e.target.value)}
                            error={errors[`inst${i}.cond`]}
                          >
                            <option value="">— เลือก —</option>
                            {(Object.entries(PAYMENT_CONDITION_LABELS) as [PaymentCondition, string][]).map(([k, v]) => (
                              <option key={k} value={k}>{v}</option>
                            ))}
                          </Select>
                        </FormGroup>
                      </td>
                      <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                        <FormGroup error={errors[`inst${i}.reason`]}>
                          <Input
                            value={row.creditTermReason}
                            onChange={e => updateRow(i, 'creditTermReason', e.target.value)}
                            placeholder="เหตุผลเฉพาะสำหรับงวดนี้..."
                            error={errors[`inst${i}.reason`]}
                          />
                        </FormGroup>
                      </td>
                      <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                        <Input value={row.remark} onChange={e => updateRow(i, 'remark', e.target.value)} />
                      </td>
                      <td style={{ padding: '8px 10px', verticalAlign: 'middle', textAlign: 'right' as const }}>
                        {totalSelling > 0 && numVal(row.installmentPercent) > 0 && (
                          <span style={{ fontFamily: 'JetBrains Mono, Noto Sans Thai, monospace', fontSize: 13, fontWeight: 700, color: '#82C566', whiteSpace: 'nowrap' }}>
                            {formatCurrency(amount)}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#F2F6F8', borderTop: '2px solid #D0D6DF' }}>
                  <td colSpan={2} style={{ padding: '10px 12px', fontSize: 13 }}>
                    <span style={{ color: '#586782' }}>รวม: </span>
                    <span style={{ fontWeight: 700, color: Math.abs(totalPercent - 100) < 0.01 ? '#82C566' : '#F3554F' }}>
                      {totalPercent.toFixed(1)}%
                    </span>
                    {Math.abs(totalPercent - 100) < 0.01 && <span style={{ color: '#82C566' }}> ✓</span>}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 13 }}>
                    <span style={{ color: '#586782' }}>Max: </span>
                    <span style={{ fontWeight: 700 }}>{formatCreditTerm(maxCreditTerm)}</span>
                  </td>
                  <td colSpan={3} />
                  <td style={{ padding: '10px 12px', textAlign: 'right' as const, fontFamily: 'JetBrains Mono, Noto Sans Thai, monospace', fontSize: 13, fontWeight: 700, color: '#001122' }}>
                    {totalSelling > 0 ? formatCurrency(totalSelling) : '—'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {errors.totalPct && <div style={{ color: '#F3554F', fontSize: 12, marginTop: 6 }}>{errors.totalPct}</div>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="secondary" icon={<ChevronIcon direction="left" size={15} />} onClick={onBack}>ย้อนกลับ</Button>
          <Button icon={<ChevronIcon direction="right" size={15} />} onClick={() => validate() && onNext()}>ถัดไป — สรุปและส่ง</Button>
        </div>
      </div>
    </Card>
  )
}
