import { Outlet, Link } from 'react-router-dom'
import { ChevronIcon } from '../icons/FigmaIcons'
import { RoleSwitcher } from './RoleSwitcher'
import { useCurrentUser } from '../../app/UserContext'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import workxLogo from '../../assets/navbar/workx-logo.png'
import avatarPlaceholder from '../../assets/navbar/avatar-placeholder.png'
import tabTravelExpense from '../../assets/navbar/tab-travel-expense.png'
import tabTransportRequest from '../../assets/navbar/tab-transport-request.png'
import tabPurchaseRequest from '../../assets/navbar/tab-purchase-request.png'
import tabBoq from '../../assets/navbar/tab-boq.png'
import tabInternalMemo from '../../assets/navbar/tab-internal-memo.png'
import tabPaymentCreditTerm from '../../assets/navbar/tab-payment-credit-term.png'

// The other WorkX modules as they appear in the host's TopMenuBar (Figma node
// 1317:2565) — shown inert here since this app only owns the Payment & Credit
// Term route, but kept so the module switcher matches the host pixel-for-pixel
// once this module is embedded in the main platform.
const OTHER_MODULES = [
  { icon: tabTravelExpense, label: 'ใบเบิกค่าเดินทาง' },
  { icon: tabTransportRequest, label: 'ขอใช้บริการขนส่ง' },
  { icon: tabPurchaseRequest, label: 'ใบขอซื้อ PR' },
  { icon: tabBoq, label: 'BOQ' },
  { icon: tabInternalMemo, label: 'Internal Memo' },
]

function ModuleTab({ icon, label, active, to }: { icon: string; label: string; active?: boolean; to?: string }) {
  const tab = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 10px',
      borderRadius: 10,
      background: active ? 'rgba(102,197,197,0.1)' : 'transparent',
      border: `1px solid ${active ? '#66C5C5' : 'transparent'}`,
      cursor: to ? 'pointer' : 'default',
      whiteSpace: 'nowrap' as const,
      flexShrink: 0,
    }}>
      <img src={icon} alt="" width={24} height={24} style={{ flexShrink: 0 }} />
      <span style={{ fontWeight: 500, fontSize: 13, color: active ? '#004081' : '#586782' }}>{label}</span>
    </div>
  )
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{tab}</Link> : tab
}

export function AppShell() {
  const { currentUser } = useCurrentUser()
  const { isMobile } = useBreakpoint()

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Host chrome — same composition as the WorkX TopMenuBar (Figma node
          1371:11120 / 1317:2565: logo+profile row, then a CENTERED module
          switcher row below). Figma's own divider between the two rows is a
          literal 1px line ("Frame 7597", h=1px) — no drop-shadow at all — so
          that's the only separator here too. Logo is sized to roughly match
          Figma's logo-to-canvas-width ratio (229/1920) on our narrower
          viewport, rather than Figma's literal 60px, which read oversized
          against our actual screen width. Padding is more generous than the
          first pass so the logo and tabs aren't crowding the edges. */}
      <header className="no-print" style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFFFFF' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '12px 16px' : '18px 32px',
          boxSizing: 'border-box',
        }}>
          <img src={workxLogo} alt="WorkX" style={{ height: isMobile ? 32 : 44 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14 }}>
            <RoleSwitcher />
            {/* Sized literally off Figma's own "UserProfile" component
                (Exzy_WorkX 851:2488) — unlike the logo, this is fixed-scale
                app chrome (touch target + readability), not something that
                should shrink to a viewport ratio. 14px text, 32px avatar,
                32px bordered chevron box, 12px gap — all literal.
                On mobile the name is hidden to save space; avatar + chevron
                still give a clear "user menu" affordance. */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {!isMobile && (
                <span style={{ fontSize: 14, color: '#586782' }}>{currentUser.name}</span>
              )}
              <img src={avatarPlaceholder} alt="" width={32} height={32} style={{ borderRadius: '50%' }} />
              <button
                aria-label="เมนูผู้ใช้"
                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #D0D6DF', borderRadius: 4, background: 'none', cursor: 'pointer', color: '#586782' }}
              >
                <ChevronIcon direction="down" size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Module tabs: always horizontally scrollable via .module-tabs-row so
            the strip never wraps to a second line or clips on any viewport.
            On mobile padding is reduced and tabs no longer try to center-justify
            (a centered flex inside a scroll container works but means the first
            tab can still be partially off-screen on small widths). */}
        <nav aria-label="เมนูโมดูล" className="module-tabs-row" style={{
          display: 'flex',
          gap: 14,
          alignItems: 'center',
          justifyContent: isMobile ? 'flex-start' : 'center',
          padding: isMobile ? '10px 16px' : '14px 28px',
          borderTop: '1px solid #D0D6DF',
        }}>
          {OTHER_MODULES.map(m => <ModuleTab key={m.label} icon={m.icon} label={m.label} />)}
          <ModuleTab icon={tabPaymentCreditTerm} label="Credit & Payment Term" active to="/requests" />
        </nav>
      </header>

      {/* Page content — reduced padding on mobile so content gets more room */}
      <main className="app-main" style={{ padding: '28px 32px' }}>
        <Outlet />
      </main>
    </div>
  )
}
