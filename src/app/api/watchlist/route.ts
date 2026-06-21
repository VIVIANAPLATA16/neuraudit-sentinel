import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const rows = await query(`
      SELECT id, nombre, nit, tipo, descripcion, created_at 
      FROM watchlists 
      ORDER BY created_at DESC
    `)
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, nit, tipo, descripcion } = body
    const rows = await query(
      `INSERT INTO watchlists (nombre, nit, tipo, descripcion) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nombre, nit || '', tipo || 'entidad', descripcion || '']
    )
    return NextResponse.json({ success: true, data: rows[0] })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
