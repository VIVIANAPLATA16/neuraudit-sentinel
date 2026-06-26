import { NextResponse } from "next/server"

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildSearchTerms(query: string) {
  const normalized = normalizeText(query).toUpperCase()
  const terms = new Set<string>()

  const add = (value: string) => {
    const cleaned = normalizeText(value).toUpperCase()
    if (cleaned) terms.add(cleaned)
  }

  add(normalized)

  if (normalized.includes('ICBF')) {
    add('Instituto Colombiano de Bienestar Familiar')
  }

  if (normalized.includes('UNGRD') || normalized.includes('GESTION DEL RIESGO')) {
    add('Unidad Nacional para la Gestion del Riesgo de Desastres')
    add('UNGRD')
  }

  if (normalized.includes('INVIAS') || normalized.includes('VIAS')) {
    add('Instituto Nacional de Vias')
    add('Instituto Nacional de Vías')
    add('INVIAS')
    add('INVÍAS')
  }

  if (normalized.includes('MIN TRANSPORTE') || normalized.includes('MINISTERIO DE TRANSPORTE') || normalized.includes('TRANSPORTE')) {
    add('Ministerio de Transporte')
    add('Min. Transporte')
  }

  if (normalized.includes('ALCALDIA MEDELLIN') || normalized.includes('ALCALDIA DE MEDELLIN') || normalized.includes('MEDELLIN')) {
    add('ALCALDIA')
    add('Alcaldía de Medellín')
    add('Alcaldia Medellin')
  }

  return [...terms]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || ""

  if (!q) return NextResponse.json({ success: false, error: "Query requerida" }, { status: 400 })

  try {
    const terms = buildSearchTerms(q)
    const where = terms
      .map((term) => `upper(nombre_entidad) like '%${term.replace(/'/g, "''")}%'`)
      .join(' OR ')
    const url = `https://www.datos.gov.co/resource/jbjy-vk9h.json?${new URLSearchParams({
      $where: where,
      $limit: '1000',
    }).toString()}`
    const res = await fetch(url)
    const data = await res.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
