import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Plus, ChevronRight } from 'lucide-react'
import { useCurrentUser } from '../../app/UserContext'

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
  roles?: string[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/requests', icon: <ClipboardList size={18} />, label: 'รายการคำขอ' },
  { to: '/requests/new', icon: <Plus size={18} />, label: 'สร้างคำขอใหม่', roles: ['sales'] },
]

export function Sidebar() {
  const { currentUser } = useCurrentUser()

  const visibleItems = NAV_ITEMS.filter(
    item => !item.roles || item.roles.includes(currentUser.role),
  )

  return (
    <aside
      style={{ width: 240, minHeight: '100vh', background: '#1E3A5F', display: 'flex', flexDirection: 'column', flexShrink: 0 }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: '#2563EB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>CT</span>
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>Credit & Payment</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>Approval System</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {visibleItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 8,
              marginBottom: 2,
              textDecoration: 'none',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
              background: isActive ? 'rgba(37,99,235,0.35)' : 'transparent',
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s',
            })}
          >
            {item.icon}
            <span style={{ flex: 1 }}>{item.label}</span>
            <ChevronRight size={14} style={{ opacity: 0.4 }} />
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 500, marginBottom: 2 }}>
          {currentUser.name}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{currentUser.email}</div>
      </div>
    </aside>
  )
}
