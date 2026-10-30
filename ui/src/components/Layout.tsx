import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon, Logo } from './Icon'
import SearchPalette from './SearchPalette'
import { ADVANCED, NAV } from './nav'
import { useTheme } from '../lib/theme'
import { useAgents } from '../lib/mock'

const OPEN = 232, CLOSED = 52

function NavItem({ to, icon, text, end, collapsed, count }: { to: string; icon: string; text: string; end?: boolean; collapsed: boolean; count?: number }) {
  return (
    <NavLink to={to} end={end} title={text} aria-label={text} className="relative mt-0.5 flex items-center rounded-lg px-2.5 py-2 text-sm">
      {({ isActive }) => (
        <>
          {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-lg bg-accent-50 dark:bg-accent-500/10" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
          <span className={`relative z-10 flex flex-1 items-center gap-2.5 ${isActive ? 'font-medium text-accent-700 dark:text-accent-300' : 'text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-100'}`}>
            <Icon name={icon as never} className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="flex-1 truncate">{text}</span>}
            {!collapsed && !!count && <span className="badge badge-warn">{count}</span>}
          </span>
        </>
      )}
    </NavLink>
  )
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(() => { try { return localStorage.getItem('ab-nav') === '1' } catch { return false } })
  const [menu, setMenu] = useState(false)
  const [palette, setPalette] = useState(false)
  const { theme, toggle } = useTheme()
  const { pending } = useAgents()
  const loc = useLocation()
  const outlet = useOutlet()
  const current = [...NAV, ...ADVANCED].find((n) => ('end' in n && n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to)))

  useEffect(() => { const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(true) } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [])
  const setNav = (v: boolean) => { setCollapsed(v); try { localStorage.setItem('ab-nav', v ? '1' : '0') } catch {} }

  return (
    <div className="flex h-screen bg-white dark:bg-neutral-950">
      <motion.aside initial={false} id="sidebar" animate={{ width: collapsed ? CLOSED : OPEN }} transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative hidden shrink-0 flex-col border-r md:flex border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex h-14 items-center justify-between px-3.5">
          {!collapsed && <Link to="/app" aria-label="Agent Box home"><Logo /></Link>}
          <button className="btn btn-ghost !px-1.5" onClick={() => setNav(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed}><Icon name="panel" /></button>
        </div>

        <div className="px-2">
          <button onClick={() => setPalette(true)} title="Search (Ctrl+K)" aria-label="Search"
            className="flex w-full items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-neutral-500 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950">
            <Icon name="search" className="h-4 w-4" />{!collapsed && <><span className="flex-1 text-left">Search</span><kbd className="rounded border border-neutral-200 px-1 text-[10px] dark:border-neutral-700">Ctrl K</kbd></>}
          </button>
        </div>

        <nav aria-label="Main" className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
          {NAV.map((n) => <NavItem key={n.to} to={n.to} icon={n.icon} text={n.text} end={'end' in n ? n.end : undefined} count={'badge' in n ? pending : undefined} collapsed={collapsed} />)}
          {!collapsed && <p className="type-label-caps mb-1 mt-5 px-2.5">Advanced</p>}
          {collapsed && <div className="my-2 border-t border-neutral-200 dark:border-neutral-800" />}
          {ADVANCED.map((n) => <NavItem key={n.to} to={n.to} icon={n.icon} text={n.text} collapsed={collapsed} />)}
        </nav>

        <div className="relative border-t border-neutral-200 p-2 dark:border-neutral-800">
          <button onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu} aria-label="User menu" className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-500 text-xs font-semibold text-white">D</span>
            {!collapsed && <span className="min-w-0 text-left"><span className="block truncate text-sm font-medium">Developer</span><span className="type-muted block truncate">Solo account</span></span>}
          </button>
          <AnimatePresence>
            {menu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                <motion.div role="menu" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.12 }}
                  className="absolute bottom-14 left-2 z-20 w-56 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                  <button role="menuitem" onClick={() => window.location.reload()} className="btn btn-ghost w-full !justify-start"><Icon name="swap" /> Reset sample data</button>
                  <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />
                  <button role="menuitem" onClick={toggle} className="btn btn-ghost w-full !justify-start"><Icon name={theme === 'dark' ? 'sun' : 'moon'} /> {theme === 'dark' ? 'Light theme' : 'Dark theme'}</button>
                  <Link role="menuitem" to="/" className="btn btn-ghost w-full !justify-start"><Icon name="out" /> Sign out</Link>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      <main className="min-w-0 flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-1.5 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">Prototype: this screen is not linked to any cloud account. All data is sample data.</div>
        <div className="px-4 pt-5 md:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500">
            <span>Agent Box</span><Icon name="chevron" className="h-3 w-3 -rotate-90 opacity-60" /><span aria-current="page" className="font-medium text-neutral-900 dark:text-neutral-100">{current?.text}</span>
          </nav>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={loc.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="px-4 pb-8 pt-4 md:px-6 lg:px-8">
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
      <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-neutral-200 bg-white/95 backdrop-blur md:hidden dark:border-neutral-800 dark:bg-neutral-950/95">
        {[...NAV, { to: '/app/box', icon: 'server', text: 'More' }].map((n) => (
          <NavLink key={n.to} to={n.to} end={'end' in n ? n.end : false} className={({ isActive }) => `relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${isActive ? 'font-medium text-accent-700 dark:text-accent-300' : 'text-neutral-500'}`}>
            <Icon name={n.icon as never} className="h-5 w-5" />{n.text}
            {'badge' in n && pending > 0 && <span className="absolute right-[28%] top-1 h-2 w-2 rounded-full bg-amber-500" aria-label={`${pending} waiting`} />}
          </NavLink>
        ))}
      </nav>
      <SearchPalette open={palette} onClose={() => setPalette(false)} />
    </div>
  )
}
