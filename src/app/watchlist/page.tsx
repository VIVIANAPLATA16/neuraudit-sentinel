'use client'

import { useMemo, useState } from 'react'
import { Eye, Plus, Search, X, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/page-header'
import { RiskBadge } from '@/components/risk-badge'
import { EmptyState } from '@/components/empty-state'
import { entities as seedEntities, type Entity, type RiskLevel } from '@/lib/data'

const filters: ('TODOS' | RiskLevel)[] = ['TODOS', 'ALTO', 'MEDIO', 'BAJO']

export default function WatchlistPage() {
  const [list, setList] = useState<Entity[]>(seedEntities)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'TODOS' | RiskLevel>('TODOS')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    return list.filter((e) => {
      const matchesQuery =
        e.nombre.toLowerCase().includes(query.toLowerCase()) ||
        e.nit.includes(query)
      const matchesFilter = filter === 'TODOS' || e.riesgo === filter
      return matchesQuery && matchesFilter
    })
  }, [list, query, filter])

  function handleAdd(entity: Entity) {
    setList((prev) => [entity, ...prev])
    setOpen(false)
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        icon={<Eye className="size-5" />}
        title="Watchlist"
        subtitle="Entidades públicas bajo monitoreo permanente"
        action={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            Agregar entidad
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o NIT..."
            className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-md border px-3 py-1.5 font-mono text-xs font-medium transition-colors',
                filter === f
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Sin resultados"
          description="No hay entidades que coincidan con tu búsqueda o filtro. Ajusta los criterios o agrega una nueva entidad."
          action={
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus className="size-4" />
              Agregar entidad
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">NIT</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Nivel de riesgo</th>
                <th className="px-4 py-3 font-medium">Última alerta</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-border last:border-b-0 transition-colors hover:bg-secondary/40"
                >
                  <td className="px-4 py-3 font-medium">{e.nombre}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {e.nit}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.tipo}</td>
                  <td className="px-4 py-3">
                    <RiskBadge level={e.riesgo} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {e.ultimaAlerta}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddEntitySlideOver
        open={open}
        onClose={() => setOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  )
}

function AddEntitySlideOver({
  open,
  onClose,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (entity: Entity) => void
}) {
  const [nombre, setNombre] = useState('')
  const [nit, setNit] = useState('')
  const [tipo, setTipo] = useState('Entidad territorial')
  const [riesgo, setRiesgo] = useState<RiskLevel>('MEDIO')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) return
    onAdd({
      id: `e-${Date.now()}`,
      nombre: nombre.trim(),
      nit: nit.trim() || 'Pendiente',
      tipo,
      riesgo,
      ultimaAlerta: 'Recién agregada',
      riskScore: riesgo === 'ALTO' ? 80 : riesgo === 'MEDIO' ? 50 : 20,
      contratos: 0,
    })
    setNombre('')
    setNit('')
    setTipo('Entidad territorial')
    setRiesgo('MEDIO')
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 transition-opacity',
        open ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Agregar entidad"
        className={cn(
          'absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-xl transition-transform',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">Agregar entidad</h2>
            <p className="text-xs text-muted-foreground">
              Registra una entidad para vigilancia
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-1 flex-col gap-5 p-5">
          <Field label="Nombre de la entidad">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Alcaldía de Cali"
              className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
            />
          </Field>
          <Field label="NIT">
            <input
              value={nit}
              onChange={(e) => setNit(e.target.value)}
              placeholder="Ej. 890.399.011-3"
              className="w-full rounded-md border border-border bg-secondary px-3 py-2 font-mono text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
            />
          </Field>
          <Field label="Tipo de entidad">
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary/50"
            >
              <option>Entidad territorial</option>
              <option>Entidad nacional</option>
              <option>Entidad distrital</option>
              <option>Empresa pública</option>
            </select>
          </Field>
          <Field label="Nivel de riesgo inicial">
            <div className="flex gap-2">
              {(['ALTO', 'MEDIO', 'BAJO'] as RiskLevel[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRiesgo(r)}
                  className={cn(
                    'flex-1 rounded-md border py-2 font-mono text-xs font-semibold transition-colors',
                    riesgo === r
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </Field>

          <div className="mt-auto flex gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-border py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Agregar a watchlist
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
