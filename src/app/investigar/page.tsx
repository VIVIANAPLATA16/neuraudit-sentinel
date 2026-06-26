'use client'
import { useEffect, useRef, useState } from 'react'
import { Search, Building2 } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { PageHeader } from '@/components/page-header'
import { ColombiaMap } from '@/components/colombia-map'
import { RiskBadge } from '@/components/risk-badge'
import { EmptyState } from '@/components/empty-state'
import type { RiskLevel } from '@/lib/data'

interface Contrato {
  nombre_entidad?: string
  descripcion_del_proceso?: string
  valor_del_contrato?: string
  estado_contrato?: string
  tipo_de_contrato?: string
  departamento?: string
  municipio?: string
}

function getRiskLevel(c: Contrato): RiskLevel {
  const v = Number(c.valor_del_contrato || 0)
  if (v > 1000000000) return 'ALTO'
  if (v > 100000000) return 'MEDIO'
  return 'BAJO'
}

function formatCOP(value: string | number | undefined) {
  if (!value || value === '0') return '—'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(value))
}

const COLORS = { ALTO: '#ef4444', MEDIO: '#f59e0b', BAJO: '#22c55e' }

const LOADING_STEPS = [
  'Consultando SECOP...',
  'Analizando contratos...',
  'Calculando riesgo...',
  'Generando visualizaciones...',
]

const DEPARTAMENTOS: Record<string, [number, number]> = {
  'CUNDINAMARCA': [4.6, -74.1], 'BOGOTA': [4.7, -74.07], 'ANTIOQUIA': [6.25, -75.56],
  'VALLE DEL CAUCA': [3.45, -76.53], 'SANTANDER': [6.64, -73.13], 'BOLIVAR': [9.0, -74.0],
  'ATLANTICO': [10.96, -74.81], 'NARIÑO': [1.21, -77.28], 'TOLIMA': [4.09, -75.15],
  'HUILA': [2.53, -75.52], 'CAUCA': [2.7, -76.82], 'CORDOBA': [8.76, -75.88],
  'MAGDALENA': [10.47, -74.25], 'META': [4.15, -73.63], 'RISARALDA': [4.81, -75.69],
  'CALDAS': [5.29, -75.04], 'CESAR': [9.33, -73.37], 'BOYACA': [5.45, -73.36],
  'NORTE DE SANTANDER': [7.89, -72.5], 'QUINDIO': [4.53, -75.68],
  'SUCRE': [9.3, -75.4], 'PUTUMAYO': [0.86, -76.65], 'ARAUCA': [7.08, -70.76],
  'CASANARE': [5.75, -72.0], 'GUAJIRA': [11.35, -72.53], 'CHOCO': [5.69, -76.65],
  'VAUPES': [1.25, -70.23], 'GUAVIARE': [2.57, -72.65], 'VICHADA': [4.42, -69.29],
  'AMAZONAS': [-1.44, -71.57], 'CAQUETA': [1.61, -75.61], 'GUAINIA': [2.58, -68.53],
}

const DEPARTMENT_KEYS = Object.keys(DEPARTAMENTOS)

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function getDeptoFromEntity(nombre: string): string {
  const n = normalizeText(nombre)
  for (const dep of DEPARTMENT_KEYS) {
    if (n.includes(normalizeText(dep))) return dep
  }
  if (n.includes('bogota') || n.includes('sede nacional')) return 'BOGOTA'
  return ''
}

function getDepartmentKey(c: Contrato) {
  return getDeptoFromEntity(c.departamento || '') || getDeptoFromEntity(c.nombre_entidad || '')
}

const PAGE_SIZE = 5

export default function InvestigarPage() {
  const [q, setQ] = useState('')
  const [all, setAll] = useState<Contrato[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [page, setPage] = useState(1)
  const loadingLockRef = useRef(false)

  useEffect(() => {
    if (!loading) {
      setLoadingStep(0)
      return
    }

    const interval = window.setInterval(() => {
      setLoadingStep(step => (step + 1) % LOADING_STEPS.length)
    }, 2800)

    return () => window.clearInterval(interval)
  }, [loading])

  async function handleSearch(query?: string) {
    if (loadingLockRef.current) return

    const term = (query || q).trim()
    if (!term) return

    if (query) setQ(query)
    loadingLockRef.current = true
    setAll([])
    setLoadingStep(0)
    setLoading(true)
    setSearched(true)
    setPage(1)
    try {
      const res = await fetch('/api/investigar?q=' + encodeURIComponent(term))
      const data = await res.json()
      if (data.success) {
        const sorted = data.data.sort((a: Contrato, b: Contrato) => {
          const order: Record<RiskLevel, number> = { ALTO: 0, MEDIO: 1, BAJO: 2 }
          return order[getRiskLevel(a)] - order[getRiskLevel(b)]
        })
        setAll(sorted)
      } else {
        setAll([])
      }
    } catch {
      setAll([])
    } finally {
      setLoading(false)
      loadingLockRef.current = false
    }
  }

  const alto = all.filter(c => getRiskLevel(c) === 'ALTO')
  const medio = all.filter(c => getRiskLevel(c) === 'MEDIO')
  const bajo = all.filter(c => getRiskLevel(c) === 'BAJO')
  const totalRiesgo = alto.reduce((s, c) => s + Number(c.valor_del_contrato || 0), 0)

  const donaData = [
    { name: 'ALTO', value: alto.length },
    { name: 'MEDIO', value: medio.length },
    { name: 'BAJO', value: bajo.length },
  ].filter(d => d.value > 0)

  const deptoMap: Record<string, { alto: number, medio: number, bajo: number, total: number }> = {}
  all.forEach(c => {
    const dep = getDepartmentKey(c)
    if (!dep) return
    if (!deptoMap[dep]) deptoMap[dep] = { alto: 0, medio: 0, bajo: 0, total: 0 }
    const risk = getRiskLevel(c)
    deptoMap[dep][risk.toLowerCase() as 'alto' | 'medio' | 'bajo']++
    deptoMap[dep].total++
  })

  const deptoEntries = Object.entries(deptoMap).sort((a, b) => b[1].total - a[1].total)
  const visible = all.slice(0, page * PAGE_SIZE)

  return (
    <div className={`space-y-4 ${loading ? 'cursor-wait' : ''}`} aria-busy={loading}>
      <PageHeader
        title="Investigar"
        subtitle="Contratos públicos en tiempo real — SECOP II"
        icon={<Search className="size-5" />}
      />

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar entidad en SECOP II..."
            disabled={loading}
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary disabled:cursor-wait disabled:opacity-70" />
        </div>
        <button onClick={() => handleSearch()} disabled={loading}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-50">
          {loading ? 'Consultando...' : 'Analizar →'}
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['ICBF', 'Min. Transporte', 'Alcaldia', 'UNGRD', 'Invías'].map(e => (
          <button key={e} onClick={() => handleSearch(e)}
            disabled={loading}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-wait disabled:opacity-50">
            {e}
          </button>
        ))}
      </div>

      {loading && (
        <div className="rounded-2xl border border-border bg-card/70 px-6 py-10 shadow-lg shadow-black/10 backdrop-blur-sm" style={{ animation: 'investigar-fade-in 220ms ease-out' }}>
          <div className="flex flex-col items-center justify-center">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-muted/80"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent" style={{ animation: 'investigar-spin 0.9s linear infinite' }}></div>
              <div className="absolute inset-3 rounded-full border border-primary/30 bg-primary/5"></div>
            </div>

            <h3 className="mt-6 text-lg font-semibold text-foreground">
              Consultando SECOP II...
            </h3>

            <p className="mt-2 text-center text-sm text-muted-foreground max-w-md">
              Analizando contratos públicos. Esto puede tardar entre 10 y 30 segundos.
            </p>

            <p className="mt-3 text-center text-sm font-medium text-primary">
              {LOADING_STEPS[loadingStep]}
            </p>

            <div className="mt-6 w-full max-w-md overflow-hidden rounded-full bg-muted/80">
              <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-transparent via-primary/80 to-transparent" style={{ animation: 'investigar-shimmer 1.8s ease-in-out infinite' }} />
            </div>

            <p className="mt-3 text-center text-xs text-muted-foreground/80">
              La consulta sigue ejecutándose mientras preparamos los resultados.
            </p>
          </div>
        </div>
      )}

      {!loading && searched && all.length === 0 && (
        <EmptyState icon={Building2} title="Sin resultados" description="No se encontraron contratos" />
      )}

      {!loading && all.length > 0 && (
        <div className="space-y-4" style={{ animation: 'investigar-fade-in 260ms ease-out' }}>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Riesgo ALTO', value: alto.length, color: 'text-risk-high', border: 'border-risk-high/30', bg: 'bg-risk-high/5' },
              { label: 'Riesgo MEDIO', value: medio.length, color: 'text-yellow-500', border: 'border-yellow-500/30', bg: 'bg-yellow-500/5' },
              { label: 'Riesgo BAJO', value: bajo.length, color: 'text-risk-low', border: 'border-risk-low/30', bg: 'bg-risk-low/5' },
              { label: 'Valor en riesgo', value: formatCOP(totalRiesgo), color: 'text-primary', border: 'border-primary/30', bg: 'bg-primary/5' },
            ].map(({ label, value, color, border, bg }) => (
              <div key={label} className={`rounded-xl border ${border} ${bg} px-4 py-3`}>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Distribución por nivel de riesgo</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={donaData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                    paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}>
                    {donaData.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[entry.name as RiskLevel]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} contratos`]} contentStyle={{ background: '#0f0f1a', border: '1px solid #1e1b4b', borderRadius: 8 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Distribución por departamento</h3>
              <div className="h-[300px]"><ColombiaMap data={deptoMap} /></div>
              <div className="space-y-3 rounded-lg border border-border bg-background/40 p-3">
                {deptoEntries.length > 0 ? (
                  deptoEntries.map(([dep, info]) => {
                    const riskLevel = info.alto > 0 ? 'ALTO' : info.medio > 0 ? 'MEDIO' : 'BAJO'
                    const width = `${Math.max(12, (info.total / deptoEntries[0][1].total) * 100)}%`
                    return (
                      <div key={dep} className="space-y-1">
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="min-w-0 flex-1 truncate font-medium text-foreground">{dep}</span>
                          <span className="shrink-0 text-muted-foreground">{info.total} contratos</span>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 font-semibold ${riskLevel === 'ALTO' ? 'bg-risk-high/10 text-risk-high' : riskLevel === 'MEDIO' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-risk-low/10 text-risk-low'}`}>
                            {riskLevel}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted/80">
                          <div
                            className={`h-full rounded-full ${riskLevel === 'ALTO' ? 'bg-risk-high' : riskLevel === 'MEDIO' ? 'bg-yellow-500' : 'bg-risk-low'}`}
                            style={{ width }}
                          />
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No hay datos de departamento para esta consulta.</p>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">Top {visible.length} contratos más críticos de {all.length} encontrados</p>

          <div className="space-y-2">
            {visible.map((c, i) => {
              const risk = getRiskLevel(c)
              return (
                <div key={i} className={`rounded-lg border bg-card px-4 py-2.5 mx-2 transition-colors hover:border-primary/30 ${
                  risk === 'ALTO' ? 'border-risk-high/30' : risk === 'MEDIO' ? 'border-yellow-500/20' : 'border-border'
                }`}>
                  <div className="flex items-center gap-3">
                    <RiskBadge level={risk} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.nombre_entidad || '—'}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.descripcion_del_proceso || 'Sin descripción'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-mono font-semibold">{formatCOP(c.valor_del_contrato)}</p>
                      <p className="text-xs text-muted-foreground">{c.estado_contrato || '—'}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {visible.length < all.length && (
            <div className="text-center pt-2">
              <button onClick={() => setPage(p => p + 1)}
                className="rounded-lg border border-border px-6 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                Ver todos los contratos ({all.length - visible.length} restantes)
              </button>
            </div>
          )}
        </div>
      )}

      {!searched && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="size-12 text-muted-foreground/20 mb-4" />
          <p className="text-sm text-muted-foreground">Ingresa el nombre de una entidad para consultar sus contratos</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Fuente: datos.gov.co — SECOP II en tiempo real</p>
        </div>
      )}

      <style jsx global>{`
        @keyframes investigar-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes investigar-shimmer {
          0% {
            transform: translateX(-40%);
          }
          100% {
            transform: translateX(40%);
          }
        }

        @keyframes investigar-fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
