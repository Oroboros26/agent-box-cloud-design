import { PageHeader, Banner } from '../components/ui'
import { Icon } from '../components/Icon'

const INCLUDED = [
  'A private cloud box for your agents, always on or asleep to save cost',
  'Phone alerts and approvals for every agent',
  'Spend and action limits on each agent',
  'Your project files synced to the box',
]

export default function Plan() {
  return (
    <>
      <PageHeader title="Plan" sub="How billing could work. Nothing here is charged." />
      <div className="mb-4"><Banner kind="warn">Draft structure only. No prices are set. They should be decided after real server and snapshot costs are measured.</Banner></div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card"><p className="type-label-caps">You pay us</p><p className="type-section-title mt-2">Monthly plan + usage</p>
          <ul className="mt-3 space-y-2">{INCLUDED.map((t) => <li key={t} className="flex gap-2 text-sm"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />{t}</li>)}</ul>
          <p className="type-muted mt-3">Metered by the hour while the box runs. Only disk storage while asleep.</p></div>
        <div className="card"><p className="type-label-caps">You pay your AI provider</p><p className="type-section-title mt-2">Bring your own key</p>
          <p className="type-muted mt-2">Claude, ChatGPT or your own agent bills you directly for the AI. We never mark up or carry that cost.</p></div>
      </div>
    </>
  )
}
