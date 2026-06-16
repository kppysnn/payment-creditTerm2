import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { RoleSwitcher } from './RoleSwitcher'
import { useCurrentUser } from '../../app/UserContext'
import { ROLE_LABELS } from '../../features/credit-payment-term/types/user'

export function AppShell() {
  const { currentUser } = useCurrentUser()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F7FA' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header
          className="topbar no-print"
          style={{
            height: 56,
            background: '#fff',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <span style={{ flex: 1, fontWeight: 600, fontSize: 15, color: '#1A202C' }}>
            Credit &amp; Payment Term Approval
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: '4px 10px',
              borderRadius: 6,
              background: '#EFF6FF',
              color: '#2563EB',
              border: '1px solid #BFDBFE',
            }}
          >
            {ROLE_LABELS[currentUser.role]}
          </span>
          <span style={{ fontSize: 13, color: '#4A5568' }}>{currentUser.name}</span>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <Outlet />
        </main>
      </div>
      <RoleSwitcher />
    </div>
  )
}
