'use client'

import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'

function colorFor(score: number) {
  if (score >= 70) return '#ef4444'
  if (score >= 40) return '#f59e0b'
  return '#22c55e'
}

function labelFor(score: number) {
  if (score >= 70) return 'RIESGO ALTO'
  if (score >= 40) return 'RIESGO MEDIO'
  return 'RIESGO BAJO'
}

export function RiskGauge({ score }: { score: number }) {
  const color = colorFor(score)
  const data = [{ name: 'risk', value: score, fill: color }]

  return (
    <div className="relative flex flex-col items-center">
      <RadialBarChart
        width={220}
        height={220}
        cx="50%"
        cy="50%"
        innerRadius="78%"
        outerRadius="100%"
        barSize={14}
        data={data}
        startAngle={225}
        endAngle={-45}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 100]}
          angleAxisId={0}
          tick={false}
        />
        <RadialBar
          background={{ fill: 'rgba(255,255,255,0.06)' }}
          dataKey="value"
          cornerRadius={8}
          angleAxisId={0}
        />
      </RadialBarChart>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono text-5xl font-bold tabular-nums"
          style={{ color }}
        >
          {score}
        </span>
        <span className="font-mono text-xs text-muted-foreground">/ 100</span>
        <span
          className="mt-2 font-mono text-xs font-semibold tracking-widest"
          style={{ color }}
        >
          {labelFor(score)}
        </span>
      </div>
    </div>
  )
}
