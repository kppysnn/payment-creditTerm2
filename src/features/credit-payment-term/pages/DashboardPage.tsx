import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentUser } from '../../../app/UserContext'
import { getRequests } from '../services/creditTermService'
import type { RequestListItem } from '../types/request'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { formatCurrency } from '../utils/calculations'
import { formatDate } from '../utils/formatters'
import { Plus, FileText, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export function DashboardPage() {
  const { currentUser } = useCurrentUser()
  const [requests, setRequests] = useState<RequestListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const viewAll = currentUser.role === 'approver' || currentUser.role === 'accounting'
    getRequests(currentUser.id, viewAll).then(r => { setRequests(r); setLoading(false) })
  }, [currentUser])

  const counts = {
    draft:     requests.filter(r => r.status === 'draft').length,
    pending:   requests.filter(r => r.status === 'pending').length,
    approved:  requests.filter(r => r.status === 'approved').length,
    rejected:  requests.filter(r => r.status === 'rejected').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
  }

  const recent = requests.slice(0, 8)

  const statCards = currentUser.role === 'sales'
    ? [
        { label: 'แบบร่าง', count: counts.draft,    icon: <FileText size={20} />, color: '#718096', bg: '#F7FAFC' },
        { label: 'รออนุมัติ', count: counts.pending,  icon: <Clock size={20} />,    color: '#D97706', bg: '#FFFBEB' },
        { label: 'อนุมัติแล้ว', count: counts.approved, icon: <CheckCircle size={20} />, color: '#16A34A', bg: '#F0FDF4' },
        { label: 'ไม่อนุมัติ', count: counts.rejected,  icon: <XCircle size={20} />,    color: '#DC2626', bg: '#FEF2F2' },
      ]
    : currentUser.role === 'approver'
    ? [
        { label: 'รออนุมัติ', count: counts.pending,  icon: <Clock size={20} />,    color: '#D97706', bg: '#FFFBEB' },
        { label: 'อนุมัติแล้ว', count: counts.approved, icon: <CheckCircle size={20} />, color: '#16A34A', bg: '#F0FDF4' },
        { label: 'ไม่อนุมัติ', count: counts.rejected,  icon: <XCircle size={20} />,    color: '#DC2626', bg: '#FEF2F2' },
      ]
    : [
        { label: 'คำขอทั้งหมด', count: requests.length, icon: <FileText size={20} />, color: '#1E3A5F', bg: '#EBF0F6' },
        { label: 'อนุมัติแล้ว', count: counts.approved, icon: <CheckCircle size={20} />, color: '#16A34A', bg: '#F0FDF4' },
        { label: 'ไม่อนุมัติ', count: counts.rejected, icon: <XCircle size={20} />, color: '#DC2626', bg: '#FEF2F2' },
        { label: 'รออนุมัติ', count: counts.pending, icon: <Clock size={20} />, color: '#D97706', bg: '#FFFBEB' },
      ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1A202C' }}>Dashboard</h1>
          <p style={{ margin: '4px 0 0', color: '#718096', fontSize: 14 }}>สวัสดี, {currentUser.name}</p>
        </div>
        {currentUser.role === 'sales' && (
          <Link to="/requests/new">
            <Button icon={<Plus size={16} />}>สร้างคำขอใหม่</Button>
          </Link>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${statCards.length}, 1fr)`, gap: 16 }}>
        {statCards.map(sc => (
          <div
            key={sc.label}
            style={{
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sc.color }}>
              {sc.icon}
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: sc.color, lineHeight: 1 }}>{sc.count}</div>
              <div style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>{sc.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending attention for approver */}
      {currentUser.role === 'approver' && counts.pending > 0 && (
        <Card style={{ border: '1px solid #FCD34D', background: '#FFFBEB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#92400E' }}>
            <AlertTriangle size={18} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>มี {counts.pending} คำขอรอการพิจารณา</span>
            <Link to="/requests?status=pending" style={{ marginLeft: 'auto' }}>
              <Button variant="secondary" size="sm">ดูทั้งหมด</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Rejected reminder for sales */}
      {currentUser.role === 'sales' && counts.rejected > 0 && (
        <Card style={{ border: '1px solid #FCA5A5', background: '#FEF2F2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#7F1D1D' }}>
            <AlertTriangle size={18} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>มี {counts.rejected} คำขอที่ถูกปฏิเสธ — กรุณาแก้ไขและส่งใหม่</span>
            <Link to="/requests?status=rejected" style={{ marginLeft: 'auto' }}>
              <Button variant="secondary" size="sm">ดูทั้งหมด</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Recent requests */}
      <Card title="คำขอล่าสุด" actions={
        <Link to="/requests"><Button variant="ghost" size="sm">ดูทั้งหมด</Button></Link>
      }>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#A0AEC0' }}>กำลังโหลด...</div>
        ) : recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#A0AEC0' }}>ยังไม่มีคำขอ</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                {['Request No.', 'Project', 'ลูกค้า', 'Total Selling', 'Max Credit', 'สถานะ', 'อัปเดต', ''].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#718096', fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid #F7FAFC' }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#1E3A5F', fontWeight: 600 }}>{req.requestNo}</td>
                  <td style={{ padding: '10px 12px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.projectName}</td>
                  <td style={{ padding: '10px 12px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.customerName}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{formatCurrency(req.totalSelling)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    {req.maxCreditTerm === 0 ? 'COD' : `Net ${req.maxCreditTerm}`}
                  </td>
                  <td style={{ padding: '10px 12px' }}><StatusBadge status={req.status} size="sm" /></td>
                  <td style={{ padding: '10px 12px', color: '#A0AEC0', fontSize: 12 }}>{formatDate(req.updatedAt)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <Link to={`/requests/${req.id}`}><Button variant="ghost" size="sm">ดู</Button></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
