import { useEffect, useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { ChevronIcon, MenuIcon, XMarkIcon } from '../icons/FigmaIcons'
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

// Full-width row version of the same module switcher, for the mobile
// hamburger dropdown — the horizontal-scroll strip that works fine on
// desktop just clips/crowds on a phone-width viewport, so mobile gets its
// own vertical list instead of trying to reuse ModuleTab's layout.
function MobileModuleRow({ icon, label, active, to, onNavigate }: { icon: string; label: string; active?: boolean; to?: string; onNavigate: () => void }) {
  const row = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 20px',
      borderLeft: `3px solid ${active ? '#66C5C5' : 'transparent'}`,
      background: active ? 'rgba(102,197,197,0.08)' : 'transparent',
      cursor: to ? 'pointer' : 'default',
    }}>
      <img src={icon} alt="" width={24} height={24} style={{ flexShrink: 0 }} />
      <span style={{ fontWeight: active ? 600 : 400, fontSize: 14, color: active ? '#004081' : '#586782' }}>{label}</span>
    </div>
  )
  return to ? <Link to={to} onClick={onNavigate} style={{ textDecoration: 'none' }}>{row}</Link> : row
}

export function AppShell() {
  const { currentUser } = useCurrentUser()
  const { isMobile } = useBreakpoint()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Menu only exists on mobile — if the viewport grows past the breakpoint
  // while it's open (e.g. rotating a tablet), drop the open state so it
  // can't get stuck rendered on a layout that no longer has a toggle for it.
  useEffect(() => {
    if (!isMobile) setMobileMenuOpen(false)
  }, [isMobile])

  useEffect(() => {
    if (!mobileMenuOpen) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Hamburger — mobile only. Replaces the horizontal module-tabs
                strip below (hidden on mobile) with an on-demand dropdown,
                since that strip only ever scrolled sideways and crowded the
                role switcher/profile off-screen at phone widths. */}
            {isMobile && (
              <button
                aria-label={mobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(open => !open)}
                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #D0D6DF', borderRadius: 4, background: 'none', cursor: 'pointer', color: '#586782', flexShrink: 0 }}
              >
                {mobileMenuOpen ? <XMarkIcon size={16} /> : <MenuIcon size={16} />}
              </button>
            )}
            <img src={workxLogo} alt="WorkX" style={{ height: isMobile ? 32 : 44 }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14 }}>
            {/* Dev role switcher moves into the mobile dropdown below — on a
                phone-width topbar it was the thing actually pushing the
                avatar/chevron off-screen. */}
            {!isMobile && <RoleSwitcher />}
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

        {/* Module tabs: hidden on mobile in favor of the hamburger dropdown
            below. Desktop keeps the always-horizontally-scrollable strip via
            .module-tabs-row so it never wraps to a second line or clips. */}
        {!isMobile && (
          <nav aria-label="เมนูโมดูล" className="module-tabs-row" style={{
            display: 'flex',
            gap: 14,
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px 28px',
            borderTop: '1px solid #D0D6DF',
          }}>
            {OTHER_MODULES.map(m => <ModuleTab key={m.label} icon={m.icon} label={m.label} />)}
            <ModuleTab icon={tabPaymentCreditTerm} label="Credit & Payment Term" active to="/requests" />
          </nav>
        )}

        {/* Mobile dropdown — anchored to the header (its own sticky position
            makes it a valid containing block for this), so it always sits
            right below the header row regardless of that row's own height,
            without needing to measure it in JS. */}
        {isMobile && mobileMenuOpen && (
          <nav aria-label="เมนูโมดูล" style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#FFFFFF',
            borderTop: '1px solid #D0D6DF',
            boxShadow: '0 16px 34px rgba(0,64,129,0.10), 0 2px 6px rgba(0,64,129,0.06)',
            maxHeight: 'calc(100vh - 60px)',
            overflowY: 'auto',
          }}>
            <div style={{ padding: '6px 0' }}>
              {OTHER_MODULES.map(m => (
                <MobileModuleRow key={m.label} icon={m.icon} label={m.label} onNavigate={() => setMobileMenuOpen(false)} />
              ))}
              <MobileModuleRow icon={tabPaymentCreditTerm} label="Credit & Payment Term" active to="/requests" onNavigate={() => setMobileMenuOpen(false)} />
            </div>
            <div style={{ borderTop: '1px solid #D0D6DF', padding: '14px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#929EB4', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Dev — Role
              </div>
              <RoleSwitcher />
            </div>
          </nav>
        )}
      </header>

      {/* Backdrop — dims the page content while the mobile dropdown is open,
          without dimming the header itself (lower z-index than the sticky
          header), and closes the menu on tap-outside. */}
      {isMobile && mobileMenuOpen && (
        <div
          className="no-print"
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.50)', zIndex: 9 }}
        />
      )}

      {/* Page content — reduced padding on mobile so content gets more room */}
      <main className="app-main" style={{ padding: '28px 32px' }}>
        <Outlet />
      </main>
    </div>
  )
}
