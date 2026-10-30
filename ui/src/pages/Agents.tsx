import { Link } from 'react-router-dom'
import { PageHeader, EmptyState, AgentBadge } from '../components/ui'
import { Icon } from '../components/Icon'
import { KINDS, useAgents } from '../lib/mock'

export default function Agents() {
  const { agents } = useAgents()
  return (
    <>
      <PageHeader title="My agents" sub="Every agent you have connected, and what it is doing." action={<Link to="/app/agents/new" className="btn btn-primary"><Icon name="plus" />Add agent</Link>} />
      {agents.length === 0 ? <EmptyState title="No agents yet" hint="Connect your first agent in three short steps." action={<Link to="/app/agents/new" className="btn btn-primary">Add agent</Link>} /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {agents.map((a) => (
            <Link key={a.id} to={`/app/agents/${a.id}`} className="card block transition-colors hover:border-accent-500/60">
              <div className="flex items-start justify-between gap-2"><p className="type-section-title">{a.name}</p><AgentBadge s={a.status} /></div>
              <p className="type-muted mt-1">{KINDS[a.kind].label} · {a.provider}</p>
              <p className="mt-3 text-sm">{a.task}</p>
              <p className="type-muted mt-1">Started {a.started}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
