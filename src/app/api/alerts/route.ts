import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const rows = await query(`
      SELECT a.*, w.nombre as entidad_nombre 
      FROM alerts a
      LEFT JOIN watchlists w ON a.watchlist_id = w.id
      ORDER BY a.created_at DESC
    `)
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { watchlist_id, titulo, descripcion, nivel, fuente } = body
    const rows = await query(
      `INSERT INTO alerts (watchlist_id, titulo, descripcion, nivel, fuente)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [watchlist_id || null, titulo, descripcion || '', nivel || 'medio', fuente || 'SECOP']
    )
    return NextResponse.json({ success: true, data: rows[0] })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
