'use client'

import { useMemo, useState } from 'react'
import {
  Bell,
  ChevronDown,
  Building2,
  Calendar,
  Database,
  BellOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/page-header'
import { RiskBadge } from '@/components/risk-badge'
import { EmptyState } from '@/components/empty-state'
import { alerts, type RiskLevel, type Source } from '@/lib/data'

const levelFilters: ('TODOS' | RiskLevel)[] = ['TODOS', 'ALTO', 'MEDIO', 'BAJO']
const sourceFilters: ('TODAS' | Source)[] = [
  'TODAS',
  'SECOP',
  'Contraloría',
  'Procuraduría',
]

export default function AlertasPage() {
  const [level, setLevel] = useState<'TODOS' | RiskLevel>('TODOS')
  const [source, setSource] = useState<'TODAS' | Source>('TODAS')
  const [expanded, setExpanded] = useState<string | null>(alerts[0]?.id ?? null)

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      const matchesLevel = level === 'TODOS' || a.nivel === level
      const matchesSource = source === 'TODAS' || a.fuente === source
      return matchesLevel && matchesSource
    })
  }, [level, source])

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        icon={<Bell className="size-5" />}
        title="Alertas"
        subtitle="Detecciones del motor de IA sobre contratación pública"
      />

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <FilterRow label="Nivel">
          {levelFilters.map((f) => (
            <FilterChip
              key={f}
              active={level === f}
              onClick={() => setLevel(f)}
            >
              {f}
            </FilterChip>
          ))}
        </FilterRow>
        <FilterRow label="Fuente">
          {sourceFilters.map((f) => (
            <FilterChip
              key={f}
              active={source === f}
              onClick={() => setSource(f)}
            >
              {f}
            </FilterChip>
          ))}
        </FilterRow>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="Sin alertas"
          description="No hay alertas que coincidan con los filtros seleccionados. Ajusta el nivel o la fuente para ver más resultados."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((alert) => {
            const isOpen = expanded === alert.id
            return (
              <li
                key={alert.id}
                className={cn(
                  'rounded-lg border bg-card transition-colors',
                  alert.nivel === 'ALTO'
                    ? 'border-risk-high/30'
                    : 'border-border',
                  alert.nivel === 'ALTO' && isOpen && 'glow-critical',
                )}
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : alert.id)}
                  className="flex w-full items-start gap-3 px-4 py-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <RiskBadge level={alert.nivel} />
                      <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {alert.fuente}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-snug text-pretty">
                      {alert.titulo}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {alert.entidad}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      'mt-1 size-4 shrink-0 text-muted-foreground transition-transform',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>

                {isOpen ? (
                  <div className="border-t border-border px-4 py-4">
                    <p className="text-sm text-foreground/90 text-pretty">
                      {alert.descripcion}
                    </p>
                    <p className="mt-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      Indicadores detectados
                    </p>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {alert.detalle.map((d, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-foreground/80"
                        >
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-risk-high" />
                          {d}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-3 font-mono text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="size-3.5" />
                        {alert.entidad}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Database className="size-3.5" />
                        {alert.fuente}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        {alert.fecha}
                      </span>
                    </div>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function FilterRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span className="w-16 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md border px-3 py-1.5 font-mono text-xs font-medium transition-colors',
        active
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-border text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
