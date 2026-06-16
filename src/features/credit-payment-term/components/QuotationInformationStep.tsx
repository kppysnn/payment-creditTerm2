import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { FormGroup, Input, Textarea } from '../../../components/ui/FormField'
import { Alert } from '../../../components/ui/Alert'
import { calcGrossProfit, calcMarginPercent, formatCurrency } from '../utils/calculations'
import { ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { SaleType } from '../types/request'

interface HwItem { name: string; description: string; sellingPrice: number | ''; cost: number | ''; remark: string }

interface Props {
  data: Record<string, unknown>
  onChange: (patch: Record<string, unknown>) => void
  onNext: () => void
  onBack: () => void
}

function numVal(v: unknown): number { return Number(v) || 0 }

export function QuotationInformationStep({ data, onChange, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const saleType = String(data.saleType || '') as SaleType
  const showHw = saleType === 'hardware' || saleType === 'mixed'
  const showSw = saleType === 'software_installation' || saleType === 'mixed'
  const hwItems = (data.hardwareItems as HwItem[]) ?? [{ name: '', description: '', sellingPrice: '', cost: '', remark: '' }]

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (showHw) {
      hwItems.forEach((item, i) => {
        if (!item.name.trim()) e[`hw${i}.name`] = 'กรุณาระบุชื่อสินค้า'
        if (numVal(item.sellingPrice) <= 0) e[`hw${i}.selling`] = 'กรุณาระบุราคาขาย'
      })
    }
    if (showSw) {
      if (!String(data.softwareName || '').trim()) e.softwareName = 'กรุณาระบุชื่อ Software'
      if (numVal(data.softwareSellingPrice) <= 0) e.softwareSellingPrice = 'กรุณาระบุราคาขาย'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function updateHwItem(i: number, field: keyof HwItem, value: unknown) {
    const updated = [...hwItems]
    updated[i] = { ...updated[i], [field]: value }
    onChange({ hardwareItems: updated })
  }

  function addHwItem() {
    onChange({ hardwareItems: [...hwItems, { name: '', description: '', sellingPrice: '', cost: '', remark: '' }] })
  }

  function removeHwItem(i: number) {
    onChange({ hardwareItems: hwItems.filter((_, idx) => idx !== i) })
  }

  /* Totals */
  const hwSelling = hwItems.reduce((s, i) => s + numVal(i.sellingPrice), 0)
  const hwCost = hwItems.reduce((s, i) => s + numVal(i.cost), 0)
  const swSelling = numVal(data.softwareSellingPrice)
  const swCost = numVal(data.softwareCost)
  const instSelling = numVal(data.installationSellingPrice)
  const instCost = numVal(data.installationCost)
  const totalSelling = hwSelling + swSelling + instSelling
  const totalCost = hwCost + swCost + instCost
  const grossProfit = totalSelling - totalCost
  const margin = calcMarginPercent(totalSelling, grossProfit)

  const warnings: string[] = []
  if (totalSelling === 0) warnings.push('ราคาขายรวมยังเป็น 0')
  if (grossProfit < 0) warnings.push('Gross Profit ติดลบ — ต้นทุนสูงกว่าราคาขาย')
  if (margin < 10 && totalSelling > 0) warnings.push(`Margin ต่ำมาก (${margin.toFixed(1)}%)`)

  return (
    <Card title="Step 3 — ข้อมูลใบเสนอราคา">
      {/* Hardware */}
      {showHw && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#1E3A5F' }}>Hardware</div>
            <Button variant="secondary" size="sm" icon={<Plus size={13} />} onClick={addHwItem}>เพิ่มรายการ</Button>
          </div>
          {hwItems.map((item, i) => (
            <div key={i} style={{ background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#718096' }}>รายการที่ {i + 1}</span>
                {hwItems.length > 1 && (
                  <button onClick={() => removeHwItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 4 }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                <FormGroup label="ชื่อสินค้า / Hardware" required error={errors[`hw${i}.name`]} style={{ gridColumn: 'span 2' } as React.CSSProperties}>
                  <Input value={item.name} onChange={e => updateHwItem(i, 'name', e.target.value)} placeholder="ชื่อสินค้า รุ่น ยี่ห้อ" error={errors[`hw${i}.name`]} />
                </FormGroup>
                <FormGroup label="รายละเอียด" style={{ gridColumn: 'span 2' } as React.CSSProperties}>
                  <Input value={item.description} onChange={e => updateHwItem(i, 'description', e.target.value)} placeholder="รายละเอียดเพิ่มเติม" />
                </FormGroup>
                <FormGroup label="ราคาขาย (THB)" required error={errors[`hw${i}.selling`]}>
                  <Input type="number" value={item.sellingPrice} onChange={e => updateHwItem(i, 'sellingPrice', e.target.value ? Number(e.target.value) : '')} min="0" step="1000" error={errors[`hw${i}.selling`]} />
                </FormGroup>
                <FormGroup label="ต้นทุน (THB)">
                  <Input type="number" value={item.cost} onChange={e => updateHwItem(i, 'cost', e.target.value ? Number(e.target.value) : '')} min="0" step="1000" />
                </FormGroup>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#718096', fontWeight: 600, marginBottom: 3 }}>Gross Profit</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: calcGrossProfit(numVal(item.sellingPrice), numVal(item.cost)) >= 0 ? '#1A202C' : '#DC2626' }}>
                      {formatCurrency(calcGrossProfit(numVal(item.sellingPrice), numVal(item.cost)))}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#718096', fontWeight: 600, marginBottom: 3 }}>Margin %</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1A202C' }}>
                      {calcMarginPercent(numVal(item.sellingPrice), calcGrossProfit(numVal(item.sellingPrice), numVal(item.cost))).toFixed(2)}%
                    </div>
                  </div>
                </div>
                <FormGroup label="หมายเหตุ">
                  <Input value={item.remark} onChange={e => updateHwItem(i, 'remark', e.target.value)} />
                </FormGroup>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Software */}
      {showSw && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1E3A5F', marginBottom: 12 }}>Software</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
            <FormGroup label="ชื่อ Software" required error={errors.softwareName} style={{ gridColumn: 'span 2' } as React.CSSProperties}>
              <Input value={String(data.softwareName || '')} onChange={e => onChange({ softwareName: e.target.value })} placeholder="ชื่อ software, license, subscription..." error={errors.softwareName} />
            </FormGroup>
            <FormGroup label="รายละเอียด" style={{ gridColumn: 'span 2' } as React.CSSProperties}>
              <Textarea value={String(data.softwareDescription || '')} onChange={e => onChange({ softwareDescription: e.target.value })} rows={2} />
            </FormGroup>
            <FormGroup label="ราคาขาย Software (THB)" required error={errors.softwareSellingPrice}>
              <Input type="number" value={String(data.softwareSellingPrice ?? '')} onChange={e => onChange({ softwareSellingPrice: e.target.value ? Number(e.target.value) : '' })} min="0" error={errors.softwareSellingPrice} />
            </FormGroup>
            <FormGroup label="ต้นทุน Software (THB)">
              <Input type="number" value={String(data.softwareCost ?? '')} onChange={e => onChange({ softwareCost: e.target.value ? Number(e.target.value) : '' })} min="0" />
            </FormGroup>
          </div>
        </div>
      )}

      {/* Installation */}
      {showSw && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1E3A5F', marginBottom: 12 }}>Installation</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
            <FormGroup label="รายละเอียดงาน Installation" style={{ gridColumn: 'span 2' } as React.CSSProperties}>
              <Textarea value={String(data.installationDescription || '')} onChange={e => onChange({ installationDescription: e.target.value })} rows={2} placeholder="รายละเอียดขอบเขตงาน installation" />
            </FormGroup>
            <FormGroup label="ราคาขาย Installation (THB)">
              <Input type="number" value={String(data.installationSellingPrice ?? '')} onChange={e => onChange({ installationSellingPrice: e.target.value ? Number(e.target.value) : '' })} min="0" />
            </FormGroup>
            <FormGroup label="ต้นทุน Installation (THB)">
              <Input type="number" value={String(data.installationCost ?? '')} onChange={e => onChange({ installationCost: e.target.value ? Number(e.target.value) : '' })} min="0" />
            </FormGroup>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      {totalSelling > 0 && (
        <div style={{ background: '#EBF0F6', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1E3A5F', marginBottom: 12 }}>สรุปทางการเงิน</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Total Selling', value: formatCurrency(totalSelling) },
              { label: 'Total Cost', value: formatCurrency(totalCost) },
              { label: 'Gross Profit', value: formatCurrency(grossProfit), danger: grossProfit < 0 },
              { label: 'Margin %', value: `${margin.toFixed(2)}%`, danger: margin < 0 },
            ].map(f => (
              <div key={f.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#718096', marginBottom: 3 }}>{f.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: f.danger ? '#DC2626' : '#1A202C' }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Alert type="warning" title="ข้อควรระวัง">
            <ul style={{ margin: '4px 0 0', paddingLeft: 16 }}>
              {warnings.map(w => <li key={w}>{w}</li>)}
            </ul>
          </Alert>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <Button variant="secondary" icon={<ArrowLeft size={15} />} onClick={onBack}>ย้อนกลับ</Button>
        <Button icon={<ArrowRight size={15} />} onClick={() => validate() && onNext()}>ถัดไป — Payment & Credit Term</Button>
      </div>
    </Card>
  )
}
