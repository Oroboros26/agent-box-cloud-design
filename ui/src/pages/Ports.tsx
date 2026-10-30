import { useState } from 'react'
import { PageHeader, EmptyState, Banner } from '../components/ui'
import { useBox } from '../lib/mock'

export default function Ports() {
  const { state, ports, togglePort, addPort } = useBox()
  const [v, setV] = useState('')
  const n = Number(v)
  const valid = Number.isInteger(n) && n > 0 && n < 65536
  const running = state === 'running'
  return (
    <>
      <PageHeader title="Ports" sub="Reach an app on the box from localhost through a private SSH tunnel. Nothing is opened to the internet." />
      {!running && <div className="mb-4"><Banner kind="info">Tunnels need a running box.</Banner></div>}
      <form className="card mb-4 flex items-end gap-3" onSubmit={(e) => { e.preventDefault(); if (valid) { addPort(n); setV('') } }}>
        <div className="w-40"><label className="label" htmlFor="port">Port number</label><input id="port" className="input" inputMode="numeric" value={v} onChange={(e) => setV(e.target.value)} placeholder="8000" /></div>
        <button className="btn btn-outline" disabled={!valid}>Add port</button>
        {v && !valid && <p className="type-muted pb-2 text-red-600 dark:text-red-400">Enter a number from 1 to 65535.</p>}
      </form>
      {ports.length === 0 ? <EmptyState title="No ports" hint="Add the port your app listens on." /> : (
        <div className="card !p-0 overflow-hidden"><table className="w-full text-left">
          <thead><tr className="border-b border-neutral-200 dark:border-neutral-800"><th className="type-table-header px-5 py-2.5">Port</th><th className="type-table-header px-5 py-2.5">Local address</th><th className="type-table-header px-5 py-2.5">Tunnel</th><th /></tr></thead>
          <tbody>{ports.map((p) => (
            <tr key={p.port} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
              <td className="type-mono px-5 py-3">{p.port}</td>
              <td className="type-mono px-5 py-3 text-neutral-500">localhost:{p.port}</td>
              <td className="px-5 py-3">{p.open ? <span className="badge badge-success">Open</span> : <span className="badge badge-neutral">Closed</span>}</td>
              <td className="px-5 py-3 text-right"><button className="btn btn-outline" disabled={!running} onClick={() => togglePort(p.port)}>{p.open ? 'Close' : 'Open'}</button></td>
            </tr>))}</tbody>
        </table></div>
      )}
    </>
  )
}
