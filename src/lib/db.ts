import { Pool } from "pg"
import { Signer } from "@aws-sdk/rds-signer"

declare global {
  var __sentinelPool: Pool | undefined
}

async function createPool(): Promise<Pool> {
  const signer = new Signer({
    region: process.env.AURORA_REGION || "us-east-1",
    hostname: process.env.AURORA_HOST!,
    port: Number(process.env.AURORA_PORT) || 5432,
    username: process.env.AURORA_USER!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  const token = await signer.getAuthToken()

  const pool = new Pool({
    host: process.env.AURORA_HOST,
    port: Number(process.env.AURORA_PORT) || 5432,
    database: process.env.AURORA_DATABASE || "postgres",
    user: process.env.AURORA_USER,
    password: token,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  })

  pool.on("error", (err) => {
    console.error("[Sentinel] Aurora error:", err.message)
  })

  return pool
}

export async function getPool(): Promise<Pool> {
  if (!global.__sentinelPool) {
    global.__sentinelPool = await createPool()
  }
  return global.__sentinelPool
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = await getPool()
  const result = await pool.query(text, params)
  return result.rows as T[]
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
