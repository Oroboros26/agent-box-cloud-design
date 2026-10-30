import { Link, useParams } from 'react-router-dom'
import { PageHeader, EmptyState, AgentBadge } from '../components/ui'
import { Icon } from '../components/Icon'
import { KINDS, useAgents } from '../lib/mock'

export default function AgentDetail() {
  const { id } = useParams()
  const { agents, approvals, setStatus } = useAgents()
  const a = agents.find((x) => x.id === id)
  if (!a) return <EmptyState title="Agent not found" hint="It may have been removed." action={<Link to="/app/agents" className="btn btn-outline">Back to agents</Link>} />
  const waiting = approvals.filter((p) => p.agentId === a.id && p.state === 'pending').length
  return (
    <>
      <PageHeader title={a.name} sub={`${KINDS[a.kind].label} · ${a.provider}`}
        action={<div className="flex gap-2">
          {a.status === 'paused' ? <button className="btn btn-primary" onClick={() => setStatus(a.id, 'working')}><Icon name="play" className="h-3.5 w-3.5" />Resume</button>
            : (a.status === 'working') && <button className="btn btn-outline" onClick={() => setStatus(a.id, 'paused')}>Pause</button>}
          {a.status !== 'stopped' && <button className="btn btn-ghost" onClick={() => window.confirm('Stop this agent?') && setStatus(a.id, 'stopped')}>Stop</button>}
        </div>} />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card"><p className="type-label-caps">Status</p><div className="mt-2"><AgentBadge s={a.status} /></div><p className="type-muted mt-2">Started {a.started}</p></div>
        <div className="card md:col-span-2"><p className="type-label-caps">Current task</p><p className="mt-2 text-sm">{a.task}</p></div>
      </div>
      {waiting > 0 && <Link to="/app/inbox" className="card mt-4 flex items-center justify-between border-amber-200 dark:border-amber-500/30"><span className="text-sm font-medium">{waiting} thing{waiting > 1 ? 's' : ''} waiting for your OK</span><Icon name="arrow" className="h-4 w-4" /></Link>}
      <div className="card mt-4"><p className="type-label-caps">What it may do</p><p className="mt-2 text-sm">{KINDS[a.kind].limit}</p></div>
      <h2 className="type-section-title mb-2 mt-8">Activity</h2>
      <div className="card !p-0"><ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {a.feed.map((f, i) => <li key={i} className="flex justify-between gap-3 px-5 py-2.5 text-sm"><span>{f.text}</span><span className="type-muted shrink-0">{f.when}</span></li>)}
      </ul></div>
    </>
  )
}
