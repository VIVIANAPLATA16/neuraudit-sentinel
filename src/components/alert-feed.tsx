import { cn } from '@/lib/utils'
import type { Alert } from '@/lib/data'
import { RiskBadge } from './risk-badge'

export function AlertFeed({ items }: { items: Alert[] }) {
  return (
    <ul className="flex flex-col">
      {items.map((alert) => (
        <li
          key={alert.id}
          className={cn(
            'flex flex-col gap-2 border-b border-border px-4 py-3.5 last:border-b-0 transition-colors hover:bg-secondary/40',
            alert.nivel === 'ALTO' && 'border-l-2 border-l-risk-high',
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium leading-snug text-pretty">
              {alert.titulo}
            </p>
            <RiskBadge level={alert.nivel} />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
            <span className="text-foreground/80">{alert.entidad}</span>
            <span className="rounded border border-border px-1.5 py-0.5">
              {alert.fuente}
            </span>
            <span>{alert.fecha}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
