'use client'
import { useEffect, useRef, useState } from 'react'

interface MapProps {
  data: Record<string, { alto: number; medio: number; bajo: number; total: number }>
}

const DEPTO_MAP: Record<string, string> = {
  'BOGOTA': 'SANTAFE DE BOGOTA D.C',
  'BOGOTÁ': 'SANTAFE DE BOGOTA D.C',
  'VALLE DEL CAUCA': 'VALLE DEL CAUCA',
  'NORTE DE SANTANDER': 'NORTE DE SANTANDER',
  'NARIÑO': 'NARINO',
}

export function ColombiaMap({ data }: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; dep: string; info: any } | null>(null)

  useEffect(() => {
    async function draw() {
      const [d3geo, geojson] = await Promise.all([
        import('d3-geo'),
        fetch('/colombia.json').then(r => r.json()),
      ])

      const svg = svgRef.current
      if (!svg) return

      const width = svg.clientWidth || 320
      const height = svg.clientHeight || 400

      const projection = d3geo.geoMercator().fitSize([width, height], geojson)
      const path = d3geo.geoPath().projection(projection)

      svg.innerHTML = ''

      geojson.features.forEach((feature: any) => {
        const nombre = feature.properties.NOMBRE_DPT as string
        const key = Object.entries(DEPTO_MAP).find(([k]) => nombre.includes(k))?.[0] ||
          Object.keys(data).find(k => nombre.includes(k) || k.includes(nombre.split(' ')[0])) ||
          nombre

        const info = data[key] || data[nombre]
        const color = !info ? '#1a1a2e'
          : info.alto > 0 ? `rgba(239,68,68,${Math.min(0.3 + info.alto * 0.05, 0.9)})`
          : info.medio > 0 ? `rgba(245,158,11,${Math.min(0.3 + info.medio * 0.05, 0.9)})`
          : `rgba(34,197,94,${Math.min(0.3 + info.bajo * 0.02, 0.7)})`

        const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        pathEl.setAttribute('d', path(feature) || '')
        pathEl.setAttribute('fill', color)
        pathEl.setAttribute('stroke', '#2d2d4e')
        pathEl.setAttribute('stroke-width', '0.5')
        pathEl.style.cursor = info ? 'pointer' : 'default'
        pathEl.style.transition = 'opacity 0.2s'

        pathEl.addEventListener('mouseenter', (e) => {
          pathEl.setAttribute('opacity', '0.7')
          const rect = svg.getBoundingClientRect()
          const me = e as MouseEvent
          setTooltip({
            x: me.clientX - rect.left,
            y: me.clientY - rect.top,
            dep: nombre,
            info,
          })
        })
        pathEl.addEventListener('mouseleave', () => {
          pathEl.setAttribute('opacity', '1')
          setTooltip(null)
        })

        svg.appendChild(pathEl)
      })

      setLoaded(true)
    }

    draw()
  }, [data])

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
          Cargando mapa...
        </div>
      )}
      <svg ref={svgRef} width="100%" height="100%" />
      {tooltip && (
        <div className="absolute pointer-events-none z-10 rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg"
          style={{ left: tooltip.x + 10, top: tooltip.y - 40 }}>
          <p className="font-semibold">{tooltip.dep}</p>
          {tooltip.info ? (
            <>
              <p className="text-risk-high">ALTO: {tooltip.info.alto}</p>
              <p className="text-yellow-500">MEDIO: {tooltip.info.medio}</p>
              <p className="text-risk-low">BAJO: {tooltip.info.bajo}</p>
            </>
          ) : (
            <p className="text-muted-foreground">Sin datos</p>
          )}
        </div>
      )}
    </div>
  )
}
