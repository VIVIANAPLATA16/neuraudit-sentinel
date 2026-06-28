import { NextResponse } from "next/server"
import { query } from "@/lib/db"

async function checkEntity(nombre: string, watchlistId: number) {
  try {
    const url = `https://www.datos.gov.co/resource/jbjy-vk9h.json?$where=upper(nombre_entidad) like '%25${nombre.toUpperCase()}%25'&$limit=50&$order=valor_del_contrato DESC`
    const res = await fetch(url)
    const contratos = await res.json()
    let alertasCreadas = 0
    for (const c of contratos) {
      const valor = Number(c.valor_del_contrato || 0)
      if (valor < 1000000000) continue
      const existe = await query(
        `SELECT id FROM alerts WHERE watchlist_id = $1 AND titulo = $2`,
        [watchlistId, `Contrato de alto valor detectado: ${c.nombre_entidad}`]
      )
      if ((existe as any[]).length > 0) continue
      await query(
        `INSERT INTO alerts (watchlist_id, titulo, descripcion, nivel, fuente)
         VALUES ($1, $2, $3, 'alto', 'SECOP II')`,
        [
          watchlistId,
          `Contrato de alto valor detectado: ${c.nombre_entidad}`,
          `Valor: $${Number(valor).toLocaleString('es-CO')} — ${c.descripcion_del_proceso?.slice(0, 150) || 'Sin descripción'} — Estado: ${c.estado_contrato || 'N/A'}`,
        ]
      )
      alertasCreadas++
    }
    return alertasCreadas
  } catch {
    return 0
  }
}

export async function GET() {
  try {
    const watchlists = await query(`SELECT id, nombre FROM watchlists`)
    let total = 0
    for (const w of watchlists as any[]) {
      const creadas = await checkEntity(w.nombre, w.id)
      total += creadas
    }
    return NextResponse.json({ success: true, alertasCreadas: total })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
