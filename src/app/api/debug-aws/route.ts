import { NextResponse } from "next/server"
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts"

export async function GET() {
  try {
    const sts = new STSClient({
      region: process.env.DSQL_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })

    const identity = await sts.send(new GetCallerIdentityCommand({}))

    return NextResponse.json({
      endpoint: process.env.DSQL_ENDPOINT,
      region: process.env.DSQL_REGION,
      accessKeyLast4: process.env.AWS_ACCESS_KEY_ID?.slice(-4),
      arn: identity.Arn,
      account: identity.Account,
      userId: identity.UserId,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    )
  }
}
