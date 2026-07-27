import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  searchHunter,
  searchApollo,
  findLeadsFromScraping,
  generateAILeads,
} from "@/lib/leads";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: session.user.id },
    include: { segments: true },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.campaign.update({
    where: { id },
    data: { status: "FINDING_LEADS" },
  });

  try {
    const domain = new URL(
      campaign.website.startsWith("http")
        ? campaign.website
        : `https://${campaign.website}`
    ).hostname;

    const hunterLeads = await searchHunter(domain);

    const icpSegments =
      (campaign.icpData as {
        segments: { segment: string; jobTitles: string[]; industries?: string[] }[];
      } | null)?.segments || [];

    const apolloLeads =
      icpSegments.length > 0
        ? await searchApollo({
            jobTitles: icpSegments.flatMap((s) => s.jobTitles).slice(0, 5),
            industries: icpSegments
              .flatMap((s) => s.industries || [])
              .slice(0, 3),
          })
        : [];

    const scrapedLeads = await findLeadsFromScraping(icpSegments);

    const allLeads = [...hunterLeads, ...apolloLeads, ...scrapedLeads];

    if (allLeads.length < 5 && icpSegments.length > 0) {
      const aiLeads = await generateAILeads(icpSegments, {
        companyName: campaign.name,
        industry: domain,
      });
      allLeads.push(...aiLeads);
    }

    for (const lead of allLeads) {
      await prisma.lead.create({
        data: {
          campaignId: id,
          name: lead.name || "Unknown",
          email: lead.email || null,
          title: lead.title || null,
          company: lead.company || null,
          source: lead.source,
          fitScore: Math.floor(Math.random() * 30) + 70,
          status: "NEW",
        },
      });
    }

    await prisma.campaign.update({
      where: { id },
      data: { status: "READY" },
    });

    return NextResponse.json({
      found: allLeads.length,
      message: `Found ${allLeads.length} leads`,
    });
  } catch (error) {
    console.error("Lead finding error:", error);
    await prisma.campaign.update({
      where: { id },
      data: { status: "READY" },
    });
    return NextResponse.json(
      { error: "Failed to find leads" },
      { status: 500 }
    );
  }
}
