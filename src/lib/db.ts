import { AuroraDSQLPool } from "@aws/aurora-dsql-node-postgres-connector"

const pool = new AuroraDSQLPool({
  host: process.env.DSQL_ENDPOINT!,
  user: "admin",
  database: "postgres",
  max: 1,
})

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query(text, params)
  return result.rows as T[]
}

export async function isAuroraReachable(): Promise<boolean> {
  try {
    await query("SELECT 1")
    return true
  } catch (err) {
    console.error(
      "[Sentinel] No alcanzable:",
      err instanceof Error ? err.message : err
    )
    return false
  }
}
