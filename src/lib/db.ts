import { Pool } from "pg"
import { Signer } from "@aws-sdk/rds-signer"

declare global {
  var __sentinelPool: Pool | undefined
}

interface AuroraConfig {
  host: string
  port: number
  database: string
  user: string
  region: string
}

function getConfig(): AuroraConfig {
  const host = process.env.AURORA_HOST
  const port = process.env.AURORA_PORT
  const database = process.env.AURORA_DATABASE
  const user = process.env.AURORA_USER
  const region = process.env.AURORA_REGION || "us-east-1"

  if (!host || !user) {
    throw new Error(
      "Aurora no esta configurada. Define AURORA_HOST y AURORA_USER en .env.local"
    )
  }

  return {
    host,
    port: port ? Number(port) : 5432,
    database: database || "postgres",
    user,
    region,
  }
}

async function getIamToken(config: AuroraConfig): Promise<string> {
  const signer = new Signer({
    region: config.region,
    hostname: config.host,
    port: config.port,
    username: config.user,
  })
  return signer.getAuthToken()
}

function createPool(): Pool {
  const config = getConfig()

  const pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    password: () => getIamToken(config),
    options: "-c search_path=sentinel,public",
  })

  pool.on("error", (err) => {
    console.error("[Sentinel/Aurora] Error inesperado en el pool:", err.message)
  })

  return pool
}

export function getPool(): Pool {
  if (!global.__sentinelPool) {
    global.__sentinelPool = createPool()
  }
  return global.__sentinelPool
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = getPool()
  const result = await pool.query(text, params)
  return result.rows as T[]
}

export async function isAuroraReachable(): Promise<boolean> {
  try {
    await query("SELECT 1")
    return true
  } catch (err) {
    console.error("[Sentinel/Aurora] No alcanzable:", err instanceof Error ? err.message : err)
    return false
  }
}
