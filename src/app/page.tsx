import { query } from "@/lib/db"
import { PageHeader } from "@/components/page-header"
import { RiskBadge } from "@/components/risk-badge"
import { LayoutDashboard, Building2, Bell, AlertTriangle } from "lucide-react"

async function getStats() {
  try {
    const [w, a, ah] = await Promise.all([
      query("SELECT COUNT(*) as total FROM watchlists"),
      query("SELECT COUNT(*) as total FROM alerts"),
      query("SELECT COUNT(*) as total FROM alerts WHERE nivel = 'alto'"),
    ])
    return {
      watchlists: Number((w[0] as any).total),
      alerts: Number((a[0] as any).total),
      alertsAltas: Number((ah[0] as any).total),
    }
  } catch {
    return { watchlists: 0, alerts: 0, alertsAltas: 0 }
  }
}

async function getRecentWatchlist() {
  try { return await query("SELECT * FROM watchlists ORDER BY created_at DESC LIMIT 5") }
  catch { return [] }
}

async function getRecentAlerts() {
  try { return await query("SELECT * FROM alerts ORDER BY created_at DESC LIMIT 5") }
  catch { return [] }
}

export default async function Home() {
  const [stats, watchlist, alerts] = await Promise.all([
    getStats(), getRecentWatchlist(), getRecentAlerts()
  ])

  return (
    <div className="space-y-4 p-1">
      <PageHeader
        title="Dashboard"
        subtitle="Inteligencia anti-corrupción en tiempo real"
        icon={<LayoutDashboard className="size-5" />}
      />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Entidades monitoreadas", value: stats.watchlists, icon: Building2, color: "text-primary", border: "border-primary/20", bg: "bg-primary/5" },
          { label: "Alertas totales", value: stats.alerts, icon: Bell, color: "text-yellow-500", border: "border-yellow-500/20", bg: "bg-yellow-500/5" },
          { label: "Alertas críticas", value: stats.alertsAltas, icon: AlertTriangle, color: "text-risk-high", border: "border-risk-high/20", bg: "bg-risk-high/5" },
        ].map(({ label, value, icon: Icon, color, border, bg }) => (
          <div key={label} className={`group rounded-xl border ${border} ${bg} p-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
              <div className={`rounded-lg border ${border} p-1.5`}>
                <Icon className={`size-3.5 ${color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors duration-200">
          <h2 className="mb-3 text-sm font-semibold flex items-center gap-2">
            <Building2 className="size-4 text-primary" /> Watchlist reciente
          </h2>
          {(watchlist as any[]).length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin entidades aún</p>
          ) : (
            <div className="space-y-2">
              {(watchlist as any[]).map((e: any) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-white/5 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{e.nombre}</p>
                    <p className="font-mono text-xs text-muted-foreground">{e.nit}</p>
                  </div>
                  <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-muted-foreground capitalize">{e.tipo}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 hover:border-yellow-500/30 transition-colors duration-200">
          <h2 className="mb-3 text-sm font-semibold flex items-center gap-2">
            <Bell className="size-4 text-yellow-500" /> Alertas recientes
          </h2>
          {(alerts as any[]).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="size-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Sin alertas aún</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Las alertas aparecerán aquí cuando se detecten riesgos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(alerts as any[]).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-white/5 transition-colors">
                  <p className="text-sm font-medium">{a.titulo}</p>
                  <RiskBadge level={a.nivel?.toUpperCase()} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
