'use client'

import { useState } from 'react'
import {
  Settings,
  Database,
  Bell,
  SlidersHorizontal,
  Mail,
  MessageSquare,
  Webhook,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'

type ToggleProps = {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
}

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-secondary'
      }`}
    >
      <span
        className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

const initialSources = [
  {
    id: 'secop',
    name: 'SECOP',
    desc: 'Sistema Electrónico de Contratación Pública',
    contracts: '4.2M contratos',
    on: true,
  },
  {
    id: 'contraloria',
    name: 'Contraloría',
    desc: 'Hallazgos fiscales y procesos de responsabilidad',
    contracts: '128K registros',
    on: true,
  },
  {
    id: 'procuraduria',
    name: 'Procuraduría',
    desc: 'Sanciones disciplinarias e inhabilidades',
    contracts: '96K registros',
    on: true,
  },
  {
    id: 'rues',
    name: 'RUES',
    desc: 'Registro Único Empresarial y Social',
    contracts: '2.1M empresas',
    on: false,
  },
]

const channels = [
  { id: 'email', name: 'Correo electrónico', value: 'alertas@entidad.gov.co', icon: Mail, on: true },
  { id: 'slack', name: 'Slack', value: '#sentinel-alertas', icon: MessageSquare, on: true },
  { id: 'webhook', name: 'Webhook', value: 'https://api.entidad.gov.co/hooks/sentinel', icon: Webhook, on: false },
]

function SectionCard({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: React.ElementType
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-start gap-3 border-b border-border p-5">
        <div className="flex size-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

export default function ConfiguracionPage() {
  const [sources, setSources] = useState(initialSources)
  const [chans, setChans] = useState(channels)
  const [threshold, setThreshold] = useState(70)
  const [autoWatch, setAutoWatch] = useState(true)
  const [digest, setDigest] = useState(true)

  return (
    <div className="soc-grid min-h-full">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <PageHeader
          icon={<Settings className="size-5" />}
          title="Configuración"
          subtitle="Fuentes de datos, umbrales de riesgo y notificaciones"
        />

        <SectionCard
          icon={Database}
          title="Fuentes de datos"
          desc="Conecta y sincroniza los registros públicos monitoreados"
        >
          <div className="flex flex-col divide-y divide-border">
            {sources.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{s.name}</p>
                    <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {s.contracts}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
                <Toggle
                  label={`Activar ${s.name}`}
                  checked={s.on}
                  onChange={(v) =>
                    setSources((prev) =>
                      prev.map((p) => (p.id === s.id ? { ...p, on: v } : p)),
                    )
                  }
                />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          icon={SlidersHorizontal}
          title="Umbrales de riesgo"
          desc="Define cuándo se genera una alerta automática"
        >
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="threshold" className="text-sm font-medium">
                  Puntaje mínimo para alerta
                </label>
                <span className="font-mono text-sm font-bold text-primary">
                  {threshold}
                </span>
              </div>
              <input
                id="threshold"
                type="range"
                min={0}
                max={100}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="mt-3 w-full accent-primary"
              />
              <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <span className="text-risk-low">Bajo</span>
                <span className="text-risk-medium">Medio</span>
                <span className="text-risk-high">Alto</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
              <div>
                <p className="text-sm font-medium">
                  Vigilancia automática de reincidentes
                </p>
                <p className="text-xs text-muted-foreground">
                  Añadir a la watchlist entidades con 3+ hallazgos
                </p>
              </div>
              <Toggle
                label="Vigilancia automática"
                checked={autoWatch}
                onChange={setAutoWatch}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={Bell}
          title="Notificaciones"
          desc="Canales y frecuencia de envío de alertas"
        >
          <div className="flex flex-col gap-3">
            {chans.map((c) => {
              const Icon = c.icon
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-secondary/40 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {c.value}
                      </p>
                    </div>
                  </div>
                  <Toggle
                    label={`Activar ${c.name}`}
                    checked={c.on}
                    onChange={(v) =>
                      setChans((prev) =>
                        prev.map((p) => (p.id === c.id ? { ...p, on: v } : p)),
                      )
                    }
                  />
                </div>
              )
            })}

            <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
              <div>
                <p className="text-sm font-medium">Resumen diario</p>
                <p className="text-xs text-muted-foreground">
                  Enviar un consolidado de alertas cada mañana a las 8:00
                </p>
              </div>
              <Toggle
                label="Resumen diario"
                checked={digest}
                onChange={setDigest}
              />
            </div>
          </div>
        </SectionCard>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
          >
            Restablecer
          </button>
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}
