import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { FormGroup, Input, Select, Textarea } from '../../../components/ui/FormField'
import { SALE_TYPE_LABELS, type SaleType } from '../types/request'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

interface Props {
  data: Record<string, unknown>
  onChange: (patch: Record<string, unknown>) => void
  onNext: () => void
}

export function RequestInformationStep({ data, onChange, onNext }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!String(data.proposalNo || '').trim()) e.proposalNo = 'กรุณาระบุ Proposal No.'
    if (!String(data.projectName || '').trim()) e.projectName = 'กรุณาระบุชื่อโปรเจกต์'
    if (!data.saleType) e.saleType = 'กรุณาเลือกประเภทการขาย'
    if (String(data.requestPurpose || '').trim().length < 10) e.requestPurpose = 'กรุณาระบุวัตถุประสงค์อย่างน้อย 10 ตัวอักษร'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (validate()) onNext()
  }

  return (
    <Card title="Step 1 — ข้อมูลคำขอ">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
        {/* Auto-filled fields */}
        <FormGroup label="Sales Owner">
          <Input value={String(data.salesName || '')} readOnly style={{ background: '#F7FAFC' }} />
        </FormGroup>
        <FormGroup label="Sales Email">
          <Input value={String(data.salesEmail || '')} readOnly style={{ background: '#F7FAFC' }} />
        </FormGroup>

        <FormGroup label="Proposal No." required error={errors.proposalNo}>
          <Input
            value={String(data.proposalNo || '')}
            onChange={e => onChange({ proposalNo: e.target.value })}
            placeholder="PRO-2026-001"
            error={errors.proposalNo}
          />
        </FormGroup>
        <FormGroup label="Quotation No.">
          <Input
            value={String(data.quotationNo || '')}
            onChange={e => onChange({ quotationNo: e.target.value })}
            placeholder="QT-2026-001 (ถ้ามี)"
          />
        </FormGroup>

        <FormGroup label="ชื่อโปรเจกต์ (Project Name)" required error={errors.projectName} style={{ gridColumn: 'span 2' } as React.CSSProperties}>
          <Input
            value={String(data.projectName || '')}
            onChange={e => onChange({ projectName: e.target.value })}
            placeholder="ชื่อโปรเจกต์หรืองานที่ขาย"
            error={errors.projectName}
          />
        </FormGroup>

        <FormGroup label="ประเภทการขาย (Sale Type)" required error={errors.saleType}>
          <Select
            value={String(data.saleType || '')}
            onChange={e => onChange({ saleType: e.target.value })}
            error={errors.saleType}
          >
            <option value="">— เลือกประเภท —</option>
            {(Object.entries(SALE_TYPE_LABELS) as [SaleType, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </FormGroup>

        <div /> {/* spacer */}

        <FormGroup label="วัตถุประสงค์ (Request Purpose)" required error={errors.requestPurpose} style={{ gridColumn: 'span 2' } as React.CSSProperties}>
          <Textarea
            value={String(data.requestPurpose || '')}
            onChange={e => onChange({ requestPurpose: e.target.value })}
            rows={3}
            placeholder="อธิบายเหตุผลและที่มาของการขอเงื่อนไขพิเศษ (อย่างน้อย 10 ตัวอักษร)"
            error={errors.requestPurpose}
          />
        </FormGroup>

        <FormGroup label="หมายเหตุ (ถ้ามี)" style={{ gridColumn: 'span 2' } as React.CSSProperties}>
          <Textarea
            value={String(data.remark || '')}
            onChange={e => onChange({ remark: e.target.value })}
            rows={2}
            placeholder="ข้อมูลเพิ่มเติม"
          />
        </FormGroup>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <Button icon={<ArrowRight size={15} />} onClick={handleNext}>
          ถัดไป — ข้อมูลลูกค้า
        </Button>
      </div>
    </Card>
  )
}
