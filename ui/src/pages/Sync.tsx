import { useQuery } from '@tanstack/react-query'
import { PageHeader, Skeleton, ErrorState, EmptyState } from '../components/ui'
import { SYNC_SAMPLE, useBox, wait } from '../lib/mock'

export default function Sync() {
  const { state } = useBox()
  const q = useQuery({ queryKey: ['sync'], queryFn: () => wait(SYNC_SAMPLE) })
  return (
    <>
      <PageHeader title="File sync" sub="Your local project folder and the box stay identical, in both directions." />
      {q.isError ? <ErrorState message="Could not load sync details." onRetry={() => q.refetch()} /> : q.isLoading ? <div className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-40" /></div> : state !== 'running' ? (
        <EmptyState title="Sync is stopped" hint="Sync runs while the box is running. Going to sleep flushes pending changes first." />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card"><p className="type-label-caps">Mode</p><p className="type-mono mt-2">{q.data!.mode}</p><p className="type-muted mt-1">If both sides change the same file, your local copy wins.</p></div>
            <div className="card"><p className="type-label-caps">Ignored</p><div className="mt-2 flex flex-wrap gap-1.5">{q.data!.ignored.map((i) => <span key={i} className="badge badge-neutral type-mono">{i}</span>)}</div></div>
          </div>
          <h2 className="type-section-title mb-2 mt-8">Recent changes (sample)</h2>
          <div className="card !p-0"><ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {q.data!.recent.map((r) => <li key={r.path} className="flex items-center justify-between px-5 py-2.5 text-sm"><span className="type-mono">{r.path}</span><span className="type-muted">{r.dir} · {r.ago}</span></li>)}
          </ul></div>
        </>
      )}
    </>
  )
}
