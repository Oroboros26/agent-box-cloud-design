import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, EmptyState, Banner, BoxBadge } from '../components/ui'
import { Icon } from '../components/Icon'
import { money, SAMPLE, useBox } from '../lib/mock'

const fmt = (ms: number) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 3600)}h ${String(Math.floor(s / 60) % 60).padStart(2, '0')}m ${String(s % 60).padStart(2, '0')}s` }

export default function Overview() {
  const { state, upSince, up, sleep, destroy, log } = useBox()
  const [, tick] = useState(0)
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(t) }, [])
  const busy = state === 'starting' || state === 'waking'
  const up_ms = upSince ? Date.now() - upSince : 0
  const hours = up_ms / 3_600_000

  return (
    <>
      <PageHeader title="Box" sub="The cloud machine your agents run on. Most people never need this page."
        action={<div className="flex gap-2">
          {(state === 'none' || state === 'sleeping' || busy) && <button className="btn btn-primary" onClick={up} disabled={busy}><Icon name="play" className="h-3.5 w-3.5" />{busy ? 'Working…' : state === 'sleeping' ? 'Wake the box' : 'Start a box'}</button>}
          {state === 'running' && <button className="btn btn-outline" onClick={sleep}><Icon name="moon" />Sleep</button>}
          {(state === 'running' || state === 'sleeping') && <button className="btn btn-ghost" onClick={() => window.confirm('Remove the box and its snapshot? This cannot be undone.') && destroy()}>Destroy</button>}
        </div>} />

      {state === 'running' && hours > 8 && <div className="mb-4"><Banner kind="warn">This box has been running for more than 8 hours and is still costing money. Put it to sleep if you are done.</Banner></div>}
      {state === 'sleeping' && <div className="mb-4"><Banner kind="info">The box is asleep. Only the snapshot is stored. Waking creates a new server, so the IP address changes.</Banner></div>}

      {state === 'none' ? (
        <EmptyState title="No box yet" hint="Start one and it will be ready with your agent installed and your project synced." action={<button className="btn btn-primary" onClick={up}>Start a box</button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card"><p className="type-label-caps">Status</p><div className="mt-2"><BoxBadge s={state} /></div><p className="type-muted mt-2">{state === 'running' ? `Up for ${fmt(up_ms)}` : state === 'sleeping' ? 'No server running' : 'Please wait'}</p></div>
          <div className="card"><p className="type-label-caps">Server</p><p className="type-section-title mt-2">{SAMPLE.type}</p><p className="type-mono mt-1 text-neutral-500">{state === 'running' ? SAMPLE.ip : 'no IP while asleep'}</p><p className="type-muted mt-1">{SAMPLE.location}</p></div>
          <div className="card"><p className="type-label-caps">Cost so far (sample)</p><p className="type-section-title mt-2">{money(hours * SAMPLE.hourly)}</p><Link to="/app/cost" className="type-muted mt-1 inline-block underline">See cost details</Link></div>
        </div>
      )}

      <h2 className="type-section-title mb-2 mt-8">Activity</h2>
      {log.length === 0 ? <EmptyState title="Nothing yet" hint="Actions on the box show up here." /> : (
        <div className="card !p-0"><ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {log.map((l) => <li key={l.id} className="flex gap-3 px-5 py-2.5 text-sm"><span className="type-mono w-20 shrink-0 text-neutral-500">{l.when}</span>{l.text}</li>)}
        </ul></div>
      )}
    </>
  )
}
