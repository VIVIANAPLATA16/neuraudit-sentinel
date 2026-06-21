'use client'
import { useMemo, useState, useEffect } from 'react'
import { Plus, Search, Trash2, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/page-header'
import { RiskBadge } from '@/components/risk-badge'
import { EmptyState } from '@/components/empty-state'
import type { RiskLevel } from '@/lib/data'

interface Entity {
  id: number
  nombre: string
  nit: string
  tipo: string
  descripcion: string
  created_at: string
  riesgo?: RiskLevel
}

const filters: ('TODOS' | RiskLevel)[] = ['TODOS', 'ALTO', 'MEDIO', 'BAJO']

export default function WatchlistPage() {
  const [list, setList] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'TODOS' | RiskLevel>('TODOS')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nombre: '', nit: '', tipo: 'entidad', descripcion: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/watchlist')
      .then(r => r.json())
      .then(d => { if (d.success) setList(d.data) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return list.filter((e) => {
      const matchesQuery = e.nombre.toLowerCase().includes(query.toLowerCase()) || e.nit.includes(query)
      const matchesFilter = filter === 'TODOS' || e.riesgo === filter
      return matchesQuery && matchesFilter
    })
  }, [list, query, filter])

  async function handleAdd() {
    if (!form.nombre) return
    setSaving(true)
    const res = await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.success) {
      setList(prev => [data.data, ...prev])
      setForm({ nombre: '', nit: '', tipo: 'entidad', descripcion: '' })
      setOpen(false)
    }
    setSaving(false)
  }

  async function handleDelete(id: number) {
    await fetch('/api/watchlist/' + id, { method: 'DELETE' })
    setList(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Watchlist"
        subtitle="Entidades monitoreadas en tiempo real"
        action={
          <button onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Plus className="size-4" /> Agregar entidad
          </button>
        }
      />
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre o NIT..."
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-4 text-sm outline-none focus:border-primary" />
        </div>
        <div className="flex gap-2">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('rounded-lg border px-3 py-2 text-xs font-semibold',
                filter === f ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground')}>
              {f}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="text-center text-muted-foreground py-12">Cargando...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Building2} title="Sin entidades" description="Agrega una entidad para comenzar el monitoreo" />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-card/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">ENTIDAD</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">NIT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">TIPO</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">RIESGO</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="border-b border-border/50 hover:bg-card/50">
                  <td className="px-4 py-3 font-medium">{e.nombre}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{e.nit}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{e.tipo}</td>
                  <td className="px-4 py-3">
                    {e.riesgo ? <RiskBadge level={e.riesgo} /> : <span className="text-muted-foreground text-xs">Sin evaluar</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(e.id)} className="text-muted-foreground hover:text-red-500">
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Agregar entidad</h2>
            <input placeholder="Nombre *" value={form.nombre}
              onChange={e => setForm(p => ({...p, nombre: e.target.value}))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <input placeholder="NIT" value={form.nit}
              onChange={e => setForm(p => ({...p, nit: e.target.value}))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <select value={form.tipo} onChange={e => setForm(p => ({...p, tipo: e.target.value}))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="entidad">Entidad</option>
              <option value="empresa">Empresa</option>
              <option value="persona">Persona</option>
            </select>
            <textarea placeholder="Descripción" value={form.descripcion}
              onChange={e => setForm(p => ({...p, descripcion: e.target.value}))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" rows={3} />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-muted-foreground">Cancelar</button>
              <button onClick={handleAdd} disabled={saving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
