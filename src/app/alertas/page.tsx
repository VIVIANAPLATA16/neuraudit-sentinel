'use client'
import { useState, useEffect } from 'react'
import { Bell, Plus, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/page-header'
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

const PAGE_SIZE = 5

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [monitoring, setMonitoring] = useState(false)
  const [filter, setFilter] = useState<'TODOS' | RiskLevel>('ALTO')
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [form, setForm] = useState({ watchlist_id: '', titulo: '', descripcion: '', nivel: 'medio', fuente: 'SECOP' })
  const [saving, setSaving] = useState(false)
  const [lastScan, setLastScan] = useState<string | null>(null)
  const [newCount, setNewCount] = useState<number | null>(null)

  async function loadAlerts() {
    const [a, w] = await Promise.all([
      fetch('/api/alerts').then(r => r.json()),
      fetch('/api/watchlist').then(r => r.json()),
    ])
    if (a.success) setAlerts(a.data)
    if (w.success) setEntities(w.data)
    setLoading(false)
  }

  useEffect(() => { loadAlerts() }, [])

  async function runMonitor() {
    setMonitoring(true)
    const res = await fetch('/api/monitor')
    const data = await res.json()
    if (data.success) {
      setNewCount(data.alertasCreadas)
      setLastScan(new Date().toLocaleTimeString('es-CO'))
      await loadAlerts()
    }
    setMonitoring(false)
  }

  const filtered = alerts.filter(a =>
    filter === 'TODOS' || a.nivel?.toUpperCase() === filter
  )

  const alto = alerts.filter(a => a.nivel === 'alto').length
  const medio = alerts.filter(a => a.nivel === 'medio').length
  const bajo = alerts.filter(a => a.nivel === 'bajo').length
  const totalValor = alerts.filter(a => a.nivel === 'alto').length
  const visible = filtered.slice(0, page * PAGE_SIZE)

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

  const borderColor = (nivel: string) => {
    if (nivel === 'alto') return 'border-l-risk-high bg-red-950/20'
    if (nivel === 'medio') return 'border-l-yellow-500 bg-yellow-950/10'
    return 'border-l-risk-low bg-green-950/10'
  }

  const dotColor = (nivel: string) => {
    if (nivel === 'alto') return 'bg-risk-high animate-pulse'
    if (nivel === 'medio') return 'bg-yellow-500'
    return 'bg-risk-low'
  }

  const textColor = (nivel: string) => {
    if (nivel === 'alto') return 'text-risk-high'
    if (nivel === 'medio') return 'text-yellow-500'
    return 'text-risk-low'
  }

  return (
    <div className="space-y-4 font-mono">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-widest text-foreground">NEURAUDIT SENTINEL — THREAT MONITOR</h1>
          <p className="text-xs text-muted-foreground tracking-widest mt-0.5">CENTRO DE ALERTAS EN TIEMPO REAL</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-risk-low animate-pulse" />
          <span className="text-xs text-risk-low tracking-widest">EN VIVO</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          { label: 'AMENAZAS ALTO', value: alto, color: 'text-red-400', sub: `+${alto} HOY` },
          { label: 'AMENAZAS MEDIO', value: medio, color: 'text-yellow-400', sub: `+${medio} HOY` },
          { label: 'ENTIDADES', value: entities.length, color: 'text-violet-400', sub: 'MONITOREADAS' },
          { label: 'CONTRATOS', value: alto, color: 'text-cyan-400', sub: 'CRÍTICOS' },
        ].map(({ label, value, color, sub }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/5 bg-gradient-to-b from-[#0b1324] to-[#111827] px-6 py-5 shadow-lg"
          >
            <p className="text-[10px] text-slate-500 tracking-[0.18em] mb-3">{label}</p>
            <p className={cn('text-4xl font-bold mb-2', color)}>
              {String(value).padStart(2, '0')}
            </p>
            <p className={cn('text-[11px] font-medium opacity-80', color)}>{sub}</p>
          </div>
        ))}
      </div>

      {lastScan && (
        <div className={cn(
          'px-4 py-2 text-xs tracking-widest flex items-center justify-between border',
          newCount && newCount > 0
            ? 'border-risk-high/40 bg-risk-high/10 text-risk-high'
            : 'border-risk-low/40 bg-risk-low/10 text-risk-low'
        )}>
          <span>[ {newCount && newCount > 0 ? `ALERTA CRÍTICA — ${newCount} NUEVAS AMENAZAS DETECTADAS VÍA SECOP II` : 'SISTEMA OK — SIN NUEVAS AMENAZAS'} ]</span>
          <span className="opacity-60">{lastScan}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['ALTO', 'MEDIO', 'BAJO', 'TODOS'] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1) }}
              className={cn(
                'px-3 py-1 text-[10px] tracking-widest border rounded-sm',
                filter === f
                  ? f === 'ALTO' ? 'border-risk-high bg-risk-high/10 text-risk-high'
                    : f === 'MEDIO' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                    : f === 'BAJO' ? 'border-risk-low bg-risk-low/10 text-risk-low'
                    : 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground'
              )}>
              {f} {f !== 'TODOS' && '●'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={runMonitor} disabled={monitoring}
            className="flex items-center gap-2 border border-primary text-primary px-3 py-1 text-[10px] tracking-widest rounded-sm hover:bg-primary/10 disabled:opacity-50">
            <RefreshCw className={cn('size-3', monitoring && 'animate-spin')} />
            {monitoring ? 'ESCANEANDO...' : '⟳ ESCANEAR'}
          </button>
          <button onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 text-[10px] tracking-widest rounded-sm">
            <Plus className="size-3" /> NUEVA
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12 text-xs tracking-widest">CARGANDO AMENAZAS...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 text-xs tracking-widest">[ SIN REGISTROS PARA ESTE NIVEL ]</div>
      ) : (
        <>
          <div className="space-y-4">
            {visible.map(a => (
              <div
                key={a.id}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-r from-[#081122] to-[#0d1325] p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_25px_rgba(139,92,246,0.15)]"
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-primary opacity-70" />

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn(
                        "h-2.5 w-2.5 rounded-full animate-pulse",
                        dotColor(a.nivel)
                      )} />

                      <span className={cn(
                        "rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase border",
                        a.nivel === "alto"
                          ? "border-red-500/20 bg-red-500/10 text-red-400"
                          : a.nivel === "medio"
                          ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                          : "border-green-500/20 bg-green-500/10 text-green-400"
                      )}>
                        {a.nivel}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-white mb-2 leading-relaxed">
                      {a.titulo}
                    </h3>

                    {a.descripcion && (
                      <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                        {a.descripcion}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-[11px] text-slate-500">
                      <span>{a.fuente}</span>
                      <span>{a.entidad_nombre || 'SISTEMA'}</span>
                      <span>{new Date(a.created_at).toLocaleDateString('es-CO')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(a.id)}
                    className="opacity-40 hover:opacity-100 hover:text-red-400 transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {visible.length < filtered.length && (
            <div className="text-center">
              <button onClick={() => setPage(p => p + 1)}
                className="border border-border text-muted-foreground px-6 py-2 text-[10px] tracking-widest rounded-sm hover:border-primary hover:text-primary transition-colors">
                [ VER MÁS — {filtered.length - visible.length} REGISTROS RESTANTES ]
              </button>
            </div>
          )}
        </>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 space-y-4 font-sans">
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
