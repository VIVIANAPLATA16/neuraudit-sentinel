import { Pool } from "pg"
import { DsqlSigner } from "@aws-sdk/dsql-signer"

async function getToken(): Promise<string> {
  const signer = new DsqlSigner({
    hostname: process.env.DSQL_ENDPOINT!,
    region: process.env.DSQL_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })
  return signer.getDbConnectAdminAuthToken()
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const token = await getToken()
  const pool = new Pool({
    connectionString: `postgresql://admin:${encodeURIComponent(token)}@${process.env.DSQL_ENDPOINT}:5432/postgres?sslmode=require`,
    max: 1,
    connectionTimeoutMillis: 15000,
  })
  try {
    const result = await pool.query(text, params)
    return result.rows as T[]
  } finally {
    await pool.end()
  }
}

export async function isAuroraReachable(): Promise<boolean> {
  try {
    await query("SELECT 1")
    return true
  } catch (err) {
    console.error("[Sentinel] No alcanzable:", err instanceof Error ? err.message : err)
    return false
  }
}
