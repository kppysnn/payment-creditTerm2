import { Outlet, useLocation } from 'react-router-dom'
import { RoleSwitcher } from './RoleSwitcher'

const PAGE_TITLES: Record<string, string> = {
  '/requests': 'Payment & Credit Terms',
  '/requests/new': 'สร้างคำขออนุมัติใหม่',
}

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.endsWith('/edit')) return 'แก้ไขคำขอ'
  if (/^\/requests\/[^/]+$/.test(pathname)) return 'รายละเอียดคำขอ'
  return 'Payment & Credit Terms'
}

export function AppShell() {
  const location = useLocation()
  const pageTitle = getPageTitle(location.pathname)

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Topbar */}
      <header
        className="no-print"
        style={{
          height: 60,
          background: '#FFFFFF',
          borderBottom: '1px solid #D0D6DF',
          boxShadow: '0 1px 2px rgba(0,64,129,0.04), inset 0 3px 0 0 #66C5C5',
          display: 'flex',
          alignItems: 'center',
          padding: '0 28px',
          gap: 16,
          zIndex: 10,
          position: 'sticky',
          top: 0,
        }}
      >
        <h1 style={{
          flex: 1,
          margin: 0,
          fontWeight: 600,
          fontSize: 18,
          color: '#001122',
          letterSpacing: '-0.01em',
        }}>
          {pageTitle}
        </h1>

        <RoleSwitcher />
      </header>

      {/* Page content */}
      <main style={{ padding: '28px 32px' }}>
        <Outlet />
      </main>
    </div>
  )
}
