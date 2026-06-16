import { useCurrentUser } from '../../app/UserContext'
import type { UserRole } from '../../features/credit-payment-term/types/user'
import { ROLE_LABELS } from '../../features/credit-payment-term/types/user'

const ROLES: UserRole[] = ['sales', 'approver', 'accounting']

export function RoleSwitcher() {
  const { currentUser, setRole } = useCurrentUser()

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 50,
        background: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: 12,
        padding: '10px 14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 600, color: '#4A5568', marginBottom: 6, fontSize: 11 }}>
        DEV — เปลี่ยนบทบาท
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {ROLES.map(role => (
          <button
            key={role}
            onClick={() => setRole(role)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              borderColor: currentUser.role === role ? '#2563EB' : '#E2E8F0',
              background: currentUser.role === role ? '#EFF6FF' : '#fff',
              color: currentUser.role === role ? '#2563EB' : '#4A5568',
              transition: 'all 0.15s',
            }}
          >
            {ROLE_LABELS[role]}
          </button>
        ))}
      </div>
    </div>
  )
}
