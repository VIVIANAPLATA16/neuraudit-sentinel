import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = 'default',
}: {
  label: string
  value: string
  icon: LucideIcon
  trend?: string
  accent?: 'default' | 'high' | 'medium'
}) {
  const accentClasses = {
    default: 'text-primary border-primary/20 bg-primary/10',
    high: 'text-risk-high border-risk-high/20 bg-risk-high/10',
    medium: 'text-risk-medium border-risk-medium/20 bg-risk-medium/10',
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div
          className={cn(
            'flex size-9 items-center justify-center rounded-md border',
            accentClasses[accent],
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
      <p className="mt-3 font-mono text-3xl font-bold tabular-nums">{value}</p>
      {trend ? (
        <p className="mt-1 font-mono text-xs text-muted-foreground">{trend}</p>
      ) : null}
    </div>
  )
}
