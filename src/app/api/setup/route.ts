import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const sql = fs.readFileSync(path.join(process.cwd(), "src/lib/schema.sql"), "utf8")
    await query(sql)
    return NextResponse.json({ success: true, message: "Tablas creadas" })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
