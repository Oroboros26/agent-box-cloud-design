import { Link } from 'react-router-dom'
import { PageHeader, EmptyState, Banner } from '../components/ui'
import { useAgents, type Approval } from '../lib/mock'

const RISK: Record<Approval['risk'], { label: string; cls: string }> = {
  public: { label: 'Goes public', cls: 'badge-warn' }, money: { label: 'Spends money', cls: 'badge-error' }, low: { label: 'Low risk', cls: 'badge-neutral' },
}

export default function Inbox() {
  const { approvals, agents, prefs, setPref, decide } = useAgents()
  const open = approvals.filter((a) => a.state === 'pending')
  const done = approvals.filter((a) => a.state !== 'pending')
  const name = (id: string) => agents.find((a) => a.id === id)?.name ?? 'Agent'
  return (
    <>
      <PageHeader title="Needs you" sub="Agents ask before they do anything public or spend money." />
      {open.length === 0 ? <EmptyState title="All clear" hint="Nothing is waiting for you right now." /> : (
        <ul className="space-y-3">
          {open.map((p) => (
            <li key={p.id} className="card">
              <div className="flex flex-wrap items-center gap-2"><span className={`badge ${RISK[p.risk].cls}`}>{RISK[p.risk].label}</span><Link to={`/app/agents/${p.agentId}`} className="type-muted hover:underline">{name(p.agentId)}</Link></div>
              <p className="type-section-title mt-2">{p.title}</p>
              <p className="type-muted mt-1">{p.detail}</p>
              <div className="mt-4 flex gap-2"><button className="btn btn-primary" onClick={() => decide(p.id, true)}>Approve</button><button className="btn btn-outline" onClick={() => decide(p.id, false)}>Reject</button></div>
            </li>
          ))}
        </ul>
      )}
      {done.length > 0 && <>
        <h2 className="type-section-title mb-2 mt-8">Decided</h2>
        <div className="card !p-0"><ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {done.map((p) => <li key={p.id} className="flex items-center justify-between px-5 py-2.5 text-sm"><span>{p.title}</span>{p.state === 'approved' ? <span className="badge badge-success">Approved</span> : <span className="badge badge-neutral">Rejected</span>}</li>)}
        </ul></div></>}

      <h2 className="type-section-title mb-2 mt-8">Phone alerts</h2>
      <div className="mb-3"><Banner kind="info">Sample only: this prototype does not send real notifications.</Banner></div>
      <div className="card space-y-3">
        {([['done', 'When an agent finishes'], ['needs', 'When an agent needs you'], ['error', 'When something goes wrong']] as const).map(([k, t]) => (
          <label key={k} className="flex items-center justify-between text-sm"><span>{t}</span><input type="checkbox" className="h-4 w-4 accent-teal-600" checked={prefs[k]} onChange={(e) => setPref(k, e.target.checked)} /></label>
        ))}
      </div>
    </>
  )
}
