'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Eye,
  Bell,
  Search,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/watchlist', label: 'Watchlist', icon: Eye },
  { href: '/alertas', label: 'Alertas', icon: Bell, badge: 37 },
  { href: '/investigar', label: 'Investigar', icon: Search },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ShieldCheck className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight">NeurAudit</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
            Sentinel
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {nav.map((item) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground',
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="rounded-full bg-risk-high/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-risk-high">
                  {item.badge}
                </span>
              ) : null}
              {active ? (
                <span className="h-4 w-0.5 rounded-full bg-primary" />
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-md border border-risk-low/30 bg-risk-low/5 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-risk-low opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-risk-low" />
            </span>
            <p className="text-xs font-semibold text-risk-low">EN VIVO</p>
          </div>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            SECOP · Contraloría · Procuraduría
          </p>
        </div>
      </div>
    </aside>
  )
}
