export const NAV = [
  { to: '/app', icon: 'home', text: 'Home', end: true },
  { to: '/app/inbox', icon: 'inbox', text: 'Needs you', badge: true },
  { to: '/app/agents', icon: 'bot', text: 'My agents' },
  { to: '/app/plan', icon: 'coin', text: 'Plan' },
] as const

/** Infrastructure screens, kept out of the way for people who want them. */
export const ADVANCED = [
  { to: '/app/box', icon: 'server', text: 'Box' },
  { to: '/app/ports', icon: 'plug', text: 'Ports' },
  { to: '/app/sync', icon: 'refresh', text: 'File sync' },
  { to: '/app/cost', icon: 'chart', text: 'Server cost' },
  { to: '/app/setup', icon: 'book', text: 'Setup guide' },
] as const
