import Link from 'next/link'
import {
  Building2,
  Bell,
  FileWarning,
  Banknote,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { KpiCard } from '@/components/kpi-card'
import { RiskGauge } from '@/components/risk-gauge'
import { AlertFeed } from '@/components/alert-feed'
import { RiskBadge } from '@/components/risk-badge'
import { alerts, entities, kpis, formatCOP } from '@/lib/data'

export default function DashboardPage() {
  return (
    <div className="soc-grid min-h-full">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <PageHeader
          icon={<ShieldCheck className="size-5" />}
          title="NeurAudit Sentinel"
          subtitle="Inteligencia anti-corrupción en tiempo real"
        />

        {/* KPIs */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Entidades monitoreadas"
            value={kpis.entidadesMonitoreadas.toString()}
            icon={Building2}
            trend="+12 este mes"
          />
          <KpiCard
            label="Alertas activas"
            value={kpis.alertasActivas.toString()}
            icon={Bell}
            trend="+8 en 24h"
            accent="high"
          />
          <KpiCard
            label="Contratos en riesgo"
            value={kpis.contratosEnRiesgo.toString()}
            icon={FileWarning}
            trend="Requieren revisión"
            accent="medium"
          />
          <KpiCard
            label="Valor en riesgo (COP)"
            value={formatCOP(kpis.valorEnRiesgo)}
            icon={Banknote}
            trend="Acumulado vigente"
            accent="high"
          />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Risk gauge */}
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-sm font-semibold">Índice de riesgo global</h2>
            <p className="text-xs text-muted-foreground">
              Score agregado de las entidades vigiladas
            </p>
            <div className="mt-2 flex items-center justify-center">
              <RiskGauge score={kpis.riskScoreGlobal} />
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
              <div>
                <p className="font-mono text-lg font-bold text-risk-high">14</p>
                <p className="text-[10px] text-muted-foreground">ALTO</p>
              </div>
              <div>
                <p className="font-mono text-lg font-bold text-risk-medium">
                  29
                </p>
                <p className="text-[10px] text-muted-foreground">MEDIO</p>
              </div>
              <div>
                <p className="font-mono text-lg font-bold text-risk-low">205</p>
                <p className="text-[10px] text-muted-foreground">BAJO</p>
              </div>
            </div>
          </section>

          {/* Alert feed */}
          <section className="rounded-lg border border-border bg-card lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <div>
                <h2 className="text-sm font-semibold">Alertas recientes</h2>
                <p className="text-xs text-muted-foreground">
                  Detecciones del motor de IA
                </p>
              </div>
              <Link
                href="/alertas"
                className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
              >
                Ver todas <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <AlertFeed items={alerts.slice(0, 5)} />
          </section>
        </div>

        {/* Watchlist */}
        <section className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
            <div>
              <h2 className="text-sm font-semibold">Watchlist</h2>
              <p className="text-xs text-muted-foreground">
                Entidades bajo vigilancia activa
              </p>
            </div>
            <Link
              href="/watchlist"
              className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
            >
              Gestionar <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Entidad</th>
                  <th className="px-4 py-3 font-medium">NIT</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Riesgo</th>
                  <th className="px-4 py-3 font-medium">Última actividad</th>
                </tr>
              </thead>
              <tbody>
                {entities.map((e) => (
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
        </section>
      </div>
    </div>
  )
}
