import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || ""

  if (!q) return NextResponse.json({ success: false, error: "Query requerida" }, { status: 400 })

  try {
    const url = `https://www.datos.gov.co/resource/jbjy-vk9h.json?$where=nombre_entidad like '%25${encodeURIComponent(q.toUpperCase())}%25'&$limit=1000`
    const res = await fetch(url)
    const data = await res.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
