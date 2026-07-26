import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaigns = await prisma.campaign.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { leads: true, emails: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { website, companyInfo, competitors, icpSegments } = await req.json();

  const campaign = await prisma.campaign.create({
    data: {
      userId: session.user.id,
      name: companyInfo?.companyName || website,
      website,
      description: companyInfo?.description || "",
      status: "READY",
      icpData: icpSegments ? { segments: icpSegments } : undefined,
      competitors: competitors || undefined,
    },
  });

  if (icpSegments?.length) {
    await prisma.segment.createMany({
      data: icpSegments.map(
        (seg: { segment: string; fitScore: number }) => ({
          campaignId: campaign.id,
          name: seg.segment,
          fitScore: seg.fitScore,
          status: "working",
        })
      ),
    });
  }

  return NextResponse.json({ id: campaign.id });
}
