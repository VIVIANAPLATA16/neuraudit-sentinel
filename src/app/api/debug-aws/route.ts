import { NextResponse } from "next/server"
import { DsqlSigner } from "@aws-sdk/dsql-signer"
import { Client } from "pg"

export async function GET() {
  try {
    const endpoint = process.env.DSQL_ENDPOINT!
    const signer = new DsqlSigner({
      hostname: endpoint,
      region: process.env.DSQL_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })

    const token = await signer.getDbConnectAdminAuthToken()

    const client = new Client({
      host: endpoint,
      port: 5432,
      database: "postgres",
      user: "admin",
      password: token,
      ssl: true,
      connectionTimeoutMillis: 15000,
    })

    await client.connect()
    const result = await client.query("SELECT NOW()")
    await client.end()

    return NextResponse.json({ success: true, now: result.rows[0] })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
