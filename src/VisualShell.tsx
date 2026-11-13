import wordmark from './assets/wordmark.png'

import type { ReactNode } from 'react'

const links = [
  ['home', '⌂', 'خانه', 'خانه'],
  ['account', '▤', 'پاسپورت من', 'پاسپورت'],
  ['chat', '♧', 'دستیار و مشاوره', 'مشاوره'],
  ['followups', '◷', 'پیگیری روتین', 'پیگیری'],
  ['partners', '♙', 'پنل نماینده / مدرس', 'نماینده'],
  ['company', '▦', 'پنل شرکت زویتر', 'شرکت'],
]

type ShellRole = 'guest' | 'customer' | 'representative' | 'consultant' | 'administrator'

export function VisualShell({ page, role, children }: {
  page: string
  role: ShellRole
  children: ReactNode
}) {
  const visibleLinks = links.filter(([id]) => {
    if (role === 'guest') return id === 'home'
    if (role === 'customer') return ['home', 'account', 'chat', 'followups'].includes(id)
    if (role === 'representative') return ['home', 'account', 'chat', 'partners'].includes(id)
    if (role === 'consultant') return ['home', 'account', 'chat'].includes(id)
    return ['home', 'account', 'chat', 'company'].includes(id)
  })
  return <div className="app">
    <aside className="side">
      <a className="brand" href="#home"><img src={wordmark} alt="Zuyter" /><small>SKIN PASSPORT</small></a>
      <nav className="nav" aria-label="بخش‌های اپلیکیشن">
        {visibleLinks.map(([id, icon, label]) => <a key={id} href={'#' + id} aria-current={page === id ? 'page' : undefined}>
          <span className="ico" aria-hidden="true">{icon}</span>{label}
        </a>)}
      </nav>
    </aside>
    <div className="content">
      <header className="top"><div><div className="eyebrow">ZUYTER · DIGITAL SKINCARE EXPERIENCE</div>
        <h1>پاسپورت پوستی زویتر</h1></div>
        <div className="top-actions"><a className="btn light small" href="#questions">＋ ساخت پاسپورت</a></div>
      </header>
      <main className="main">{children}</main>
      <footer className="footer"><span>ZUYTER · SKIN PASSPORT</span></footer>
    </div>
    <nav className="mobile-nav" aria-label="بخش‌های اپلیکیشن">
      {visibleLinks.map(([id, icon, , label]) => <a key={id} href={'#' + id} aria-current={page === id ? 'page' : undefined}>
        <b aria-hidden="true">{icon}</b>{label}
      </a>)}
    </nav>
  </div>
}
