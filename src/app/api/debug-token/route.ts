import { NextResponse } from "next/server";
import { Signer } from "@aws-sdk/rds-signer";

export async function GET() {
  try {
    const signer = new Signer({
      region: process.env.AURORA_REGION || "us-east-1",
      hostname: process.env.AURORA_HOST!,
      port: Number(process.env.AURORA_PORT) || 5432,
      username: process.env.AURORA_USER!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const token = await signer.getAuthToken();

    return NextResponse.json({
      success: true,
      user: process.env.AURORA_USER,
      host: process.env.AURORA_HOST,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 30),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error),
    });
  }
}
