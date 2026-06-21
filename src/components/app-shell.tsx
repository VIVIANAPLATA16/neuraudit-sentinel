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
import { Sidebar } from './sidebar'

function LivePill({
  className,
  compact,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border border-risk-low/30 bg-risk-low/10 px-3 py-1',
        className,
      )}
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-risk-low opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-risk-low" />
      </span>
      <span className="text-[11px] font-semibold text-risk-low">EN VIVO</span>
      {!compact && (
        <span className="font-mono text-[11px] text-muted-foreground">
          SECOP · Contraloría · Procuraduría
        </span>
      )}
    </div>
  )
}

const mobileNav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/watchlist', label: 'Watchlist', icon: Eye },
  { href: '/alertas', label: 'Alertas', icon: Bell },
  { href: '/investigar', label: 'Investigar', icon: Search },
  { href: '/configuracion', label: 'Config', icon: Settings },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center gap-2 border-b border-border bg-sidebar px-4 py-3 md:hidden">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="size-4" />
          </div>
          <p className="text-sm font-bold">NeurAudit Sentinel</p>
          <LivePill className="ml-auto" compact />
        </header>

        {/* Desktop top bar */}
        <header className="hidden items-center justify-between border-b border-border bg-sidebar/60 px-6 py-3 md:flex">
          <p className="text-sm text-muted-foreground">
            Monitoreo continuo{' '}
            <span className="text-border">·</span> Alertas automáticas
          </p>
          <LivePill />
        </header>

        <main className="flex-1">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="sticky bottom-0 z-10 flex border-t border-border bg-sidebar md:hidden">
          {mobileNav.map((item) => {
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
                  'flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
