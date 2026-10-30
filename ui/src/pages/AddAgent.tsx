import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, Banner } from '../components/ui'
import { KINDS, PROVIDERS, useAgents, type AgentKind } from '../lib/mock'

export default function AddAgent() {
  const nav = useNavigate()
  const { addAgent } = useAgents()
  const [step, setStep] = useState(0)
  const [kind, setKind] = useState<AgentKind>('coding')
  const [provider, setProvider] = useState(PROVIDERS[0])
  const [key, setKey] = useState('')
  const [name, setName] = useState('')
  const [task, setTask] = useState('')
  const [limit, setLimit] = useState('40')
  const money = kind === 'shopping'
  const ok = [true, key.trim().length > 0, name.trim() && task.trim() && (!money || Number(limit) > 0)][step]
  const finish = () => nav(`/app/agents/${addAgent({ name: name.trim(), kind, provider, task: task.trim() })}`)
  return (
    <>
      <PageHeader title="Add an agent" sub={`Step ${step + 1} of 3`} />
      <div className="mb-6 grid grid-cols-3 gap-2" aria-hidden>{[0, 1, 2].map((i) => <div key={i} className={`h-1 rounded-full ${i <= step ? 'bg-accent-500' : 'bg-neutral-200 dark:bg-neutral-800'}`} />)}</div>
      <div className="max-w-2xl">
        {step === 0 && <><h2 className="type-section-title mb-3">What should it do?</h2>
          <div className="grid gap-3 sm:grid-cols-2">{(Object.keys(KINDS) as AgentKind[]).map((k) => (
            <button key={k} onClick={() => setKind(k)} aria-pressed={kind === k} className={`card text-left transition-colors ${kind === k ? 'border-accent-500 ring-1 ring-accent-500' : 'hover:border-neutral-400'}`}>
              <p className="type-section-title">{KINDS[k].label}</p><p className="type-muted mt-1">{KINDS[k].blurb}</p></button>))}</div></>}
        {step === 1 && <><h2 className="type-section-title mb-3">Which AI does the work?</h2>
          <div className="mb-4 flex flex-wrap gap-2">{PROVIDERS.map((p) => <button key={p} onClick={() => setProvider(p)} aria-pressed={provider === p} className={`btn ${provider === p ? 'btn-primary' : 'btn-outline'}`}>{p}</button>)}</div>
          <label className="label" htmlFor="key">API key</label>
          <input id="key" type="password" autoComplete="off" className="input" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Paste your key" />
          <div className="mt-3"><Banner kind="info">Prototype: the key is kept in this page only and is lost on reload. In the real product it would be stored encrypted on your box, never shown again, and you pay your AI provider directly.</Banner></div></>}
        {step === 2 && <><h2 className="type-section-title mb-3">Give it a job</h2>
          <div className="space-y-4">
            <div><label className="label" htmlFor="name">Name</label><input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="My helper" /></div>
            <div><label className="label" htmlFor="task">First task</label><textarea id="task" rows={3} className="input" value={task} onChange={(e) => setTask(e.target.value)} placeholder="Describe the job in plain words" /></div>
            {money && <div className="w-40"><label className="label" htmlFor="limit">Spend limit ($)</label><input id="limit" inputMode="decimal" className="input" value={limit} onChange={(e) => setLimit(e.target.value)} /></div>}
            <Banner kind="success">{KINDS[kind].limit} It will always ask before anything public or any spending.</Banner>
          </div></>}
        <div className="mt-6 flex gap-2">
          {step > 0 && <button className="btn btn-outline" onClick={() => setStep(step - 1)}>Back</button>}
          {step < 2 ? <button className="btn btn-primary" disabled={!ok} onClick={() => setStep(step + 1)}>Next</button> : <button className="btn btn-primary" disabled={!ok} onClick={finish}>Start agent</button>}
        </div>
      </div>
    </>
  )
}
