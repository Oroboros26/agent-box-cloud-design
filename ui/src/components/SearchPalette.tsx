import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from './Icon'
import { ADVANCED, NAV } from './nav'


export default function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { if (open) { setQ(''); setTimeout(() => ref.current?.focus(), 30) } }, [open])
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [onClose])

  const items = useMemo(() => {
    const all: { kind: string; title: string; run: () => void }[] = [
      ...[...NAV, ...ADVANCED].map((n) => ({ kind: 'Page', title: n.text, run: () => nav(n.to) })),
      { kind: 'Action', title: 'Add an agent', run: () => nav('/app/agents/new') },
    ]
    const s = q.trim().toLowerCase()
    return s ? all.filter((i) => i.title.toLowerCase().includes(s)) : all
  }, [q, nav])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
          <motion.div role="dialog" aria-label="Search" initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.12 }}
            className="fixed left-1/2 top-[15vh] z-50 w-[92vw] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-2 border-b border-neutral-200 px-4 dark:border-neutral-800">
              <Icon name="search" className="h-4 w-4 text-neutral-400" />
              <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search pages and actions" placeholder="Search pages and actions"
                className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-neutral-400" />
              <kbd className="rounded border border-neutral-200 px-1.5 text-[10px] text-neutral-500 dark:border-neutral-700">Esc</kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-1.5" aria-live="polite">
              {items.length === 0 && <p className="p-4 text-sm text-neutral-500">Nothing found for "{q}". Try a simpler word.</p>}
              {items.map((it, i) => (
                <button key={i} onClick={() => { it.run(); onClose() }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <span className="badge badge-neutral w-16 shrink-0 justify-center">{it.kind}</span>
                  <span className="truncate text-sm font-medium">{it.title}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
