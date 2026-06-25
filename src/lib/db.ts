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
  const client = new Pool({
    host: process.env.DSQL_ENDPOINT,
    port: 5432,
    database: "postgres",
    user: "admin",
    password: token,
    ssl: true,
    max: 1,
    connectionTimeoutMillis: 15000,
  })
  try {
    const result = await client.query(text, params)
    return result.rows as T[]
  } finally {
    await client.end()
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
