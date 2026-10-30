import { PageHeader } from '../components/ui'
import { Icon } from '../components/Icon'

const STEPS = [
  ['Create a cloud account', 'Sign up with the provider and add a payment method.'],
  ['Create an access token', 'Read and write. Store it only through the provider CLI, never in this app.'],
  ['Add your SSH key', 'You need a local key, for example ~/.ssh/id_ed25519.'],
  ['Sign in to your agent', 'Log in on the box, or put your API key in ~/.box-env on the box.'],
  ['Pick a project folder', 'A small test project is enough to start.'],
]

export default function Setup() {
  return (
    <>
      <PageHeader title="Setup guide" sub="What you need before the first box." />
      <ol className="card space-y-4">
        {STEPS.map(([t, d], i) => (
          <li key={t} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-50 text-xs font-semibold text-accent-700 dark:bg-accent-500/10 dark:text-accent-300">{i + 1}</span>
            <div><p className="type-section-title">{t}</p><p className="type-muted mt-0.5">{d}</p></div>
          </li>
        ))}
      </ol>
      <p className="type-muted mt-4 flex items-center gap-1.5"><Icon name="alert" className="h-3.5 w-3.5" />This guide is static text. Nothing is checked on your machine.</p>
    </>
  )
}
