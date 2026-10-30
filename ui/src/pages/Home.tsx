import { Link } from 'react-router-dom'
import { PageHeader, EmptyState, AgentBadge } from '../components/ui'
import { Icon } from '../components/Icon'
import { useAgents } from '../lib/mock'

export default function Home() {
  const { agents, approvals, pending } = useAgents()
  const working = agents.filter((a) => a.status === 'working').length
  const feed = agents.flatMap((a) => a.feed.map((f) => ({ ...f, agent: a.name, id: a.id }))).slice(0, 8)
  const waiting = approvals.filter((a) => a.state === 'pending')
  return (
    <>
      <PageHeader title="Home" sub="What your agents are doing right now. You can close your laptop; they keep going."
        action={<Link to="/app/agents/new" className="btn btn-primary"><Icon name="plus" />Add agent</Link>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card"><p className="type-label-caps">Working</p><p className="mt-2 text-2xl font-bold">{working}</p></div>
        <Link to="/app/inbox" className="card block hover:border-accent-500/60"><p className="type-label-caps">Needs you</p><p className="mt-2 text-2xl font-bold">{pending}</p></Link>
        <div className="card"><p className="type-label-caps">Agents</p><p className="mt-2 text-2xl font-bold">{agents.length}</p></div>
      </div>

      {waiting.length > 0 && (
        <>
          <h2 className="type-section-title mb-2 mt-8">Waiting for your OK</h2>
          <div className="card !p-0"><ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {waiting.map((p) => <li key={p.id}><Link to="/app/inbox" className="flex items-center justify-between px-5 py-3 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800/40"><span>{p.title}</span><Icon name="arrow" className="h-4 w-4 text-neutral-400" /></Link></li>)}
          </ul></div>
        </>
      )}

      <h2 className="type-section-title mb-2 mt-8">Latest activity</h2>
      {feed.length === 0 ? <EmptyState title="Nothing yet" hint="Add an agent and its activity shows up here." /> : (
        <div className="card !p-0"><ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {feed.map((f, i) => <li key={i} className="flex items-start justify-between gap-3 px-5 py-3 text-sm">
            <span><Link to={`/app/agents/${f.id}`} className="font-medium hover:underline">{f.agent}</Link><span className="block text-neutral-600 dark:text-neutral-400">{f.text}</span></span>
            <span className="type-muted shrink-0">{f.when}</span></li>)}
        </ul></div>
      )}
      <p className="type-muted mt-3 flex items-center gap-1.5"><AgentBadge s="idle" />Agents, tasks and activity here are sample data.</p>
    </>
  )
}
