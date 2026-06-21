'use client'

import { useMemo, useState } from 'react'
import {
  Search,
  Sparkles,
  Building2,
  UserRound,
  Banknote,
  Flag,
  Loader2,
  FileSearch,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/page-header'
import { RiskBadge } from '@/components/risk-badge'
import { EmptyState } from '@/components/empty-state'
import { contractResults, formatCOP, type ContractResult } from '@/lib/data'

export default function InvestigarPage() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const results = useMemo(() => {
    if (!submitted) return contractResults
    const q = query.toLowerCase()
    return contractResults.filter(
      (c) =>
        c.objeto.toLowerCase().includes(q) ||
        c.entidad.toLowerCase().includes(q) ||
        c.contratista.toLowerCase().includes(q),
    )
  }, [query, submitted])

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        icon={<FileSearch className="size-5" />}
        title="Investigar"
        subtitle="Explora contratos y entidades con análisis de riesgo asistido por IA"
      />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSubmitted(true)
        }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar entidad o contrato..."
          className="w-full rounded-lg border border-border bg-card py-3.5 pl-12 pr-28 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Buscar
        </button>
      </form>

      <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
        <span>
          {results.length} contrato{results.length === 1 ? '' : 's'} encontrado
          {results.length === 1 ? '' : 's'}
        </span>
        <span>Fuente: SECOP II</span>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="Sin coincidencias"
          description="No encontramos contratos para tu búsqueda. Intenta con el nombre de la entidad, el contratista o el objeto contractual."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {results.map((c) => (
            <ContractCard key={c.id} contract={c} />
          ))}
        </div>
      )}
    </div>
  )
}

function ContractCard({ contract }: { contract: ContractResult }) {
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)

  function runAnalysis() {
    setAnalyzing(true)
    setAnalysis(null)
    setTimeout(() => {
      setAnalyzing(false)
      setAnalysis(
        `El modelo asigna un score de ${contract.riskScore}/100 a este contrato. Se identificaron ${contract.banderas.length} indicador(es) de riesgo, con énfasis en "${contract.banderas[0]}". Se recomienda revisión documental y cruce con antecedentes del contratista.`,
      )
    }, 1400)
  }

  const scoreColor =
    contract.riesgo === 'ALTO'
      ? 'text-risk-high'
      : contract.riesgo === 'MEDIO'
        ? 'text-risk-medium'
        : 'text-risk-low'

  return (
    <article
      className={cn(
        'rounded-lg border bg-card p-5 transition-colors',
        contract.riesgo === 'ALTO'
          ? 'border-risk-high/30'
          : 'border-border hover:border-primary/30',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-snug text-pretty">
          {contract.objeto}
        </h3>
        <RiskBadge level={contract.riesgo} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        <Meta icon={Building2} label="Entidad" value={contract.entidad} />
        <Meta icon={UserRound} label="Contratista" value={contract.contratista} />
        <Meta
          icon={Banknote}
          label="Valor"
          value={formatCOP(contract.valor)}
          mono
        />
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Score
          </span>
          <span className={cn('font-mono text-sm font-bold', scoreColor)}>
            {contract.riskScore}/100
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {contract.banderas.map((b) => (
          <span
            key={b}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
          >
            <Flag className="size-3" />
            {b}
          </span>
        ))}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <button
          type="button"
          onClick={runAnalysis}
          disabled={analyzing}
          className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3.5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15 disabled:opacity-70"
        >
          {analyzing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {analyzing ? 'Analizando...' : 'Análisis con IA'}
        </button>

        {analysis ? (
          <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 p-3">
            <p className="flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" />
              Análisis NeurAudit
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90 text-pretty">
              {analysis}
            </p>
          </div>
        ) : null}
      </div>
    </article>
  )
}

function Meta({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Building2
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={cn('truncate text-sm text-foreground/90', mono && 'font-mono')}
      >
        {value}
      </span>
    </div>
  )
}
