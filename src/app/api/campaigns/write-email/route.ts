import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeEmail } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { companyInfo, lead, campaignId, leadId } = await req.json();

  if (!companyInfo || !lead) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  try {
    const result = await writeEmail(companyInfo, lead);

    if (campaignId) {
      await prisma.email.create({
        data: {
          campaignId,
          leadId: leadId || null,
          subject: result.subject || `Intro to ${lead.name}`,
          body: result.body || "",
          status: "DRAFT",
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Email writing error:", error);
    return NextResponse.json(
      { error: "Failed to write email" },
      { status: 500 }
    );
  }
}
