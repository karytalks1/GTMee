import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { geminiKey, resendKey, hunterKey } = await req.json();

  const keys = [
    { provider: "gemini", key: geminiKey },
    { provider: "resend", key: resendKey },
    { provider: "hunter", key: hunterKey },
  ].filter((k) => k.key);

  for (const { provider, key } of keys) {
    await prisma.apiKey.upsert({
      where: {
        id: `${session.user.id}_${provider}`,
      },
      create: {
        id: `${session.user.id}_${provider}`,
        userId: session.user.id,
        provider,
        key,
      },
      update: { key },
    });
  }

  return NextResponse.json({ saved: true });
}
