import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

// All data in this file is sample data. Nothing here talks to a cloud provider.
export type BoxState = 'none' | 'starting' | 'running' | 'sleeping' | 'waking'

export const SAMPLE = {
  name: 'box-test',
  ip: '203.0.113.10',
  type: 'sample 2 vCPU / 4 GB',
  location: 'sample EU location',
  hourly: 0.01,
  snapshotGb: 6.2,
  snapshotMonthlyPerGb: 0.012,
}

export type Port = { port: number; open: boolean }
export type Log = { id: number; when: string; text: string }

type Ctx = {
  state: BoxState
  upSince: number | null
  ports: Port[]
  log: Log[]
  up: () => void
  sleep: () => void
  destroy: () => void
  togglePort: (p: number) => void
  addPort: (p: number) => void
}

const BoxCtx = createContext<Ctx>(null as never)
export const useBox = () => useContext(BoxCtx)

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export function BoxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BoxState>('none')
  const [upSince, setUpSince] = useState<number | null>(null)
  const [ports, setPorts] = useState<Port[]>([{ port: 3000, open: false }])
  const [log, setLog] = useState<Log[]>([])
  const id = useRef(0)
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const add = (text: string) => setLog((l) => [{ id: ++id.current, when: now(), text }, ...l].slice(0, 30))
  const later = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)) }

  const up = () => {
    if (state === 'starting' || state === 'waking' || state === 'running') return
    const wake = state === 'sleeping'
    setState(wake ? 'waking' : 'starting')
    add(wake ? 'Restoring the box from its snapshot (sample)' : 'Creating a new box (sample)')
    later(1800, () => { setState('running'); setUpSince(Date.now()); add('Box ready, sync started (sample)') })
  }
  const sleep = () => {
    if (state !== 'running') return
    add('Syncing files, taking a snapshot, deleting the server (sample)')
    setState('sleeping'); setUpSince(null); setPorts((p) => p.map((x) => ({ ...x, open: false })))
  }
  const destroy = () => { setState('none'); setUpSince(null); setPorts((p) => p.map((x) => ({ ...x, open: false }))); add('Box and snapshot removed (sample)') }
  const togglePort = (n: number) => setPorts((p) => p.map((x) => (x.port === n ? { ...x, open: !x.open } : x)))
  const addPort = (n: number) => setPorts((p) => (p.some((x) => x.port === n) ? p : [...p, { port: n, open: false }]))

  return <BoxCtx.Provider value={{ state, upSince, ports, log, up, sleep, destroy, togglePort, addPort }}>{children}</BoxCtx.Provider>
}

export const wait = <T,>(v: T, ms = 500) => new Promise<T>((r) => setTimeout(() => r(v), ms))

export const SYNC_SAMPLE = {
  mode: 'two-way-resolved (local wins)',
  ignored: ['node_modules', '.venv', 'build output'],
  recent: [
    { path: 'src/app.py', dir: 'local to box', ago: '4 s ago' },
    { path: 'tests/test_app.py', dir: 'box to local', ago: '21 s ago' },
    { path: 'README.md', dir: 'local to box', ago: '2 min ago' },
  ],
}

export const money = (n: number) => `$${n.toFixed(2)}`

// ---- Agents, approvals and alerts (sample data only) ----
export type AgentKind = 'coding' | 'social' | 'shopping' | 'research' | 'custom'
export type AgentStatus = 'working' | 'idle' | 'finished' | 'needs_you' | 'paused' | 'stopped'
export type Agent = { id: string; name: string; kind: AgentKind; provider: string; status: AgentStatus; task: string; started: string; feed: { when: string; text: string }[] }
export type Approval = { id: string; agentId: string; title: string; detail: string; risk: 'public' | 'money' | 'low'; state: 'pending' | 'approved' | 'rejected' }
export type Prefs = { done: boolean; needs: boolean; error: boolean }

export const KINDS: Record<AgentKind, { label: string; blurb: string; limit: string }> = {
  coding: { label: 'Coding', blurb: 'Writes and tests code in your project.', limit: 'Can change files in the project folder only.' },
  social: { label: 'Social media', blurb: 'Drafts posts and replies.', limit: 'Never posts without your approval.' },
  shopping: { label: 'Shopping', blurb: 'Finds items and compares prices.', limit: 'Never buys without your approval and a spend limit.' },
  research: { label: 'Research', blurb: 'Reads sources and writes a summary.', limit: 'Read-only. Cannot publish or buy.' },
  custom: { label: 'Your own agent', blurb: 'Bring an agent you built.', limit: 'You choose what it may do.' },
}
export const PROVIDERS = ['Claude', 'ChatGPT', 'Other / my own']

const SEED_AGENTS: Agent[] = [
  { id: 'a1', name: 'Code helper', kind: 'coding', provider: 'Claude', status: 'working', task: 'Build a small web app with tests', started: '42 min ago',
    feed: [{ when: '2 min ago', text: 'Ran the tests: 11 passed' }, { when: '9 min ago', text: 'Added the login page' }, { when: '31 min ago', text: 'Created the project structure' }] },
  { id: 'a2', name: 'Social drafts', kind: 'social', provider: 'ChatGPT', status: 'needs_you', task: 'Write this week\'s posts', started: '1 h ago',
    feed: [{ when: '6 min ago', text: 'Drafted 3 posts and is waiting for your approval' }] },
  { id: 'a3', name: 'Deal finder', kind: 'shopping', provider: 'Claude', status: 'finished', task: 'Find a sample desk lamp under the limit', started: 'yesterday',
    feed: [{ when: 'yesterday', text: 'Compared 5 sample offers and picked one' }] },
]
const SEED_APPROVALS: Approval[] = [
  { id: 'p1', agentId: 'a2', title: 'Publish 3 posts?', detail: 'Sample posts about the product launch. They go public once you approve.', risk: 'public', state: 'pending' },
  { id: 'p2', agentId: 'a3', title: 'Buy the sample desk lamp?', detail: 'Sample item, $24.00, under your $40 limit.', risk: 'money', state: 'pending' },
]

type AgentsCtx = {
  agents: Agent[]; approvals: Approval[]; prefs: Prefs; pending: number
  decide: (id: string, ok: boolean) => void
  setStatus: (id: string, s: AgentStatus) => void
  addAgent: (a: { name: string; kind: AgentKind; provider: string; task: string }) => string
  setPref: (k: keyof Prefs, v: boolean) => void
}
const AgentsContext = createContext<AgentsCtx>(null as never)
export const useAgents = () => useContext(AgentsContext)

export function AgentsProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>(SEED_AGENTS)
  const [approvals, setApprovals] = useState<Approval[]>(SEED_APPROVALS)
  const [prefs, setPrefs] = useState<Prefs>({ done: true, needs: true, error: true })
  const decide = (id: string, ok: boolean) => {
    const a = approvals.find((x) => x.id === id)
    setApprovals((l) => l.map((x) => (x.id === id ? { ...x, state: ok ? 'approved' : 'rejected' } : x)))
    if (a) setAgents((l) => l.map((g) => (g.id === a.agentId ? { ...g, status: ok ? 'working' : 'idle', feed: [{ when: 'just now', text: ok ? `You approved: ${a.title}` : `You rejected: ${a.title}` }, ...g.feed] } : g)))
  }
  const setStatus = (id: string, s: AgentStatus) => setAgents((l) => l.map((g) => (g.id === id ? { ...g, status: s, feed: [{ when: 'just now', text: s === 'paused' ? 'You paused the agent' : s === 'stopped' ? 'You stopped the agent' : 'You resumed the agent' }, ...g.feed] } : g)))
  const addAgent = (a: { name: string; kind: AgentKind; provider: string; task: string }) => {
    const id = `a${Date.now()}`
    setAgents((l) => [{ id, ...a, status: 'working', started: 'just now', feed: [{ when: 'just now', text: 'Agent created and started (sample)' }] }, ...l])
    return id
  }
  const pending = approvals.filter((x) => x.state === 'pending').length
  return <AgentsContext.Provider value={{ agents, approvals, prefs, pending, decide, setStatus, addAgent, setPref: (k, v) => setPrefs((p) => ({ ...p, [k]: v })) }}>{children}</AgentsContext.Provider>
}
