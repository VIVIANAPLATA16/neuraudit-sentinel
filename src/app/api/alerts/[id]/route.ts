import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await query(`DELETE FROM alerts WHERE id = $1`, [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
