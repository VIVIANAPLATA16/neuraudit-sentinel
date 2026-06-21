import { Building2, Clock, FileText } from 'lucide-react'
import type { Entity } from '@/lib/data'
import { RiskBadge } from './risk-badge'

export function EntityCard({ entity }: { entity: Entity }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{entity.nombre}</p>
            <p className="font-mono text-xs text-muted-foreground">
              NIT {entity.nit}
            </p>
          </div>
        </div>
        <RiskBadge level={entity.riesgo} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <FileText className="size-3.5" />
          <span className="font-mono">{entity.contratos} contratos</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5" />
          {entity.ultimaAlerta}
        </span>
      </div>
    </div>
  )
}
