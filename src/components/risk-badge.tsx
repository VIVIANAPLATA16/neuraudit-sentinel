import { cn } from '@/lib/utils'
import type { RiskLevel } from '@/lib/data'

const styles: Record<RiskLevel, string> = {
  ALTO: 'border-risk-high/40 bg-risk-high/10 text-risk-high',
  MEDIO: 'border-risk-medium/40 bg-risk-medium/10 text-risk-medium',
  BAJO: 'border-risk-low/40 bg-risk-low/10 text-risk-low',
}

const dot: Record<RiskLevel, string> = {
  ALTO: 'bg-risk-high',
  MEDIO: 'bg-risk-medium',
  BAJO: 'bg-risk-low',
}

export function RiskBadge({
  level,
  className,
}: {
  level: RiskLevel
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-xs font-semibold tracking-wide',
        styles[level],
        className,
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          dot[level],
          level === 'ALTO' && 'animate-pulse',
        )}
      />
      {level}
    </span>
  )
}
