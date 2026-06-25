import { NextResponse } from "next/server"
import { DsqlSigner } from "@aws-sdk/dsql-signer"

export async function GET() {
  try {
    const endpoint = process.env.DSQL_ENDPOINT
    const region = process.env.DSQL_REGION
    const keyId = process.env.AWS_ACCESS_KEY_ID

    const signer = new DsqlSigner({
      hostname: endpoint!,
      region: region || "us-east-1",
      credentials: {
        accessKeyId: keyId!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })

    const token = await signer.getDbConnectAdminAuthToken()

    return NextResponse.json({
      endpoint,
      region,
      keyId: keyId?.substring(0, 8) + "...",
      tokenPreview: token.substring(0, 50),
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
