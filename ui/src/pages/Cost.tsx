import { useQuery } from '@tanstack/react-query'
import { PageHeader, Skeleton, Banner } from '../components/ui'
import { SAMPLE, money, useBox, wait } from '../lib/mock'

export default function Cost() {
  const { state, upSince } = useBox()
  const q = useQuery({ queryKey: ['cost'], queryFn: () => wait(SAMPLE) })
  const hours = upSince ? (Date.now() - upSince) / 3_600_000 : 0
  const snap = q.data ? q.data.snapshotGb * q.data.snapshotMonthlyPerGb : 0
  return (
    <>
      <PageHeader title="Cost" sub="What the box costs while running and while asleep." />
      <div className="mb-4"><Banner kind="warn">Prices below are placeholders, not real Hetzner prices. Real prices must be read from the provider.</Banner></div>
      {q.isLoading ? <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div> : (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card"><p className="type-label-caps">Running (per hour)</p><p className="type-section-title mt-2">{money(SAMPLE.hourly)}</p><p className="type-muted mt-1">{state === 'running' ? 'Billing now' : 'Not billing'}</p></div>
          <div className="card"><p className="type-label-caps">This session</p><p className="type-section-title mt-2">{money(hours * SAMPLE.hourly)}</p></div>
          <div className="card"><p className="type-label-caps">Asleep (per month)</p><p className="type-section-title mt-2">{money(snap)}</p><p className="type-muted mt-1">{SAMPLE.snapshotGb} GB snapshot only</p></div>
        </div>
      )}
      <div className="card mt-4"><p className="type-section-title">Snapshots hold your secrets</p><p className="type-muted mt-1">A snapshot includes the <span className="type-mono">~/.box-env</span> file and any logged-in agent credentials. Never share a snapshot.</p></div>
    </>
  )
}
