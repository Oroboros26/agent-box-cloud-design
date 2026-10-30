import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Icon, Logo } from '../components/Icon'

const STEPS = [
  { icon: 'server', title: 'Connect an agent', text: 'Pick what it should do and paste your AI key. We run it in the cloud for you.' },
  { icon: 'refresh', title: 'Give it a job', text: 'Describe the task in plain words. It asks before anything public or any spending.' },
  { icon: 'terminal', title: 'Check your phone', text: 'See progress and approve or reject from anywhere.' },
] as const

export default function Landing() {
  return (
    <div className="dark relative min-h-screen overflow-hidden bg-neutral-950 text-neutral-50">
      <div aria-hidden className="absolute -top-32 left-1/2 h-[400px] w-[640px] -translate-x-1/2 rounded-full bg-teal-600/20 blur-[130px]" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <header className="relative mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Logo />
        <Link to="/login" className="btn btn-outline !border-neutral-700 !text-neutral-200">Sign in</Link>
      </header>
      <main className="relative mx-auto max-w-5xl px-6 pb-20 pt-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-2xl">
          <p className="type-label-caps">Cloud box for AI agents</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Your AI agents keep working when your laptop is off.</h1>
          <p className="mt-4 text-base text-neutral-400">Connect Claude, ChatGPT or your own agent. Get a message on your phone when it needs you or when it is done.</p>
          <div className="mt-7 flex gap-3">
            <Link to="/login" className="btn btn-primary">Open the prototype <Icon name="arrow" /></Link>
          </div>
          <p className="type-muted mt-3">Prototype with sample data. The 5-minute target is not measured yet.</p>
        </motion.div>
        <ul className="mt-16 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.li key={s.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
              <Icon name={s.icon} className="h-5 w-5 text-accent-400" />
              <h2 className="mt-3 text-sm font-semibold">{s.title}</h2>
              <p className="type-muted mt-1">{s.text}</p>
            </motion.li>
          ))}
        </ul>
      </main>
    </div>
  )
}
