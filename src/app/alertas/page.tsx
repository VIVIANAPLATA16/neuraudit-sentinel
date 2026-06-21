'use client'
import { useState, useEffect } from 'react'
import { Bell, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/page-header'
import { RiskBadge } from '@/components/risk-badge'
import { EmptyState } from '@/components/empty-state'
import type { RiskLevel } from '@/lib/data'

interface Alert {
  id: number
  watchlist_id: number | null
  titulo: string
  descripcion: string
  nivel: string
  fuente: string
  entidad_nombre: string | null
  created_at: string
}

interface Entity {
  id: number
  nombre: string
}

const filters: ('TODOS' | RiskLevel)[] = ['TODOS', 'ALTO', 'MEDIO', 'BAJO']

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'TODOS' | RiskLevel>('TODOS')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ watchlist_id: '', titulo: '', descripcion: '', nivel: 'medio', fuente: 'SECOP' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/alerts').then(r => r.json()),
      fetch('/api/watchlist').then(r => r.json()),
    ]).then(([a, w]) => {
      if (a.success) setAlerts(a.data)
      if (w.success) setEntities(w.data)
    }).finally(() => setLoading(false))
  }, [])

  const filtered = alerts.filter(a =>
    filter === 'TODOS' || a.nivel?.toUpperCase() === filter
  )

  async function handleAdd() {
    if (!form.titulo) return
    setSaving(true)
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, watchlist_id: form.watchlist_id || null }),
    })
    const data = await res.json()
    if (data.success) {
      setAlerts(prev => [data.data, ...prev])
      setForm({ watchlist_id: '', titulo: '', descripcion: '', nivel: 'medio', fuente: 'SECOP' })
      setOpen(false)
    }
    setSaving(false)
  }

  async function handleDelete(id: number) {
    await fetch('/api/alerts/' + id, { method: 'DELETE' })
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertas"
        subtitle="Centro de alertas de riesgo en tiempo real"
        icon={<Bell className="size-5" />}
        action={
          <button onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Plus className="size-4" /> Nueva alerta
          </button>
        }
      />

      <div className="flex gap-2">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('rounded-lg border px-3 py-2 text-xs font-semibold',
              filter === f ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground')}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Cargando...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="Sin alertas" description="No hay alertas para este nivel de riesgo" />
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.id} className={cn(
              'rounded-xl border bg-card px-4 py-2 mx-2 transition-all hover:scale-[1.01]',
              a.nivel === 'alto' ? 'border-risk-high/40 shadow-risk-high/10 shadow-md' :
              a.nivel === 'medio' ? 'border-yellow-500/30' : 'border-border'
            )}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <RiskBadge level={a.nivel?.toUpperCase() as RiskLevel} />
                    <span className="text-xs text-muted-foreground font-mono">{a.fuente}</span>
                    {a.entidad_nombre && (
                      <span className="text-xs text-muted-foreground">· {a.entidad_nombre}</span>
                    )}
                  </div>
                  <p className="font-semibold text-sm leading-tight">{a.titulo}</p>
                  {a.descripcion && <p className="text-xs text-muted-foreground mt-1">{a.descripcion}</p>}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(a.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <button onClick={() => handleDelete(a.id)} className="text-muted-foreground hover:text-red-500 mt-1">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Nueva alerta</h2>
            <input placeholder="Título *" value={form.titulo}
              onChange={e => setForm(p => ({...p, titulo: e.target.value}))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <select value={form.watchlist_id} onChange={e => setForm(p => ({...p, watchlist_id: e.target.value}))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">Sin entidad asociada</option>
              {entities.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
            <select value={form.nivel} onChange={e => setForm(p => ({...p, nivel: e.target.value}))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="alto">ALTO</option>
              <option value="medio">MEDIO</option>
              <option value="bajo">BAJO</option>
            </select>
            <select value={form.fuente} onChange={e => setForm(p => ({...p, fuente: e.target.value}))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="SECOP">SECOP</option>
              <option value="Contraloría">Contraloría</option>
              <option value="Procuraduría">Procuraduría</option>
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
