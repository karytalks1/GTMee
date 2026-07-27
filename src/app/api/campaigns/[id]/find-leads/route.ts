import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  searchHunter,
  searchApollo,
  findLeadsFromScraping,
  findLeadsFromCompanySites,
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

    const icpSegments =
      (campaign.icpData as {
        segments: { segment: string; jobTitles: string[]; industries?: string[] }[];
      } | null)?.segments || [];

    const competitors =
      (campaign.competitorData as { name: string; website?: string }[] | null) || [];

    const [hunterLeads, apolloLeads, scrapedLeads, siteLeads] =
      await Promise.all([
        searchHunter(domain),
        icpSegments.length > 0
          ? searchApollo({
              jobTitles: icpSegments.flatMap((s) => s.jobTitles).slice(0, 5),
              industries: icpSegments
                .flatMap((s) => s.industries || [])
                .slice(0, 3),
            })
          : Promise.resolve([]),
        findLeadsFromScraping(icpSegments),
        findLeadsFromCompanySites(domain, competitors),
      ]);

    const seen = new Set<string>();
    const allLeads: typeof hunterLeads = [];

    for (const lead of [
      ...hunterLeads,
      ...apolloLeads,
      ...siteLeads,
      ...scrapedLeads,
    ]) {
      const key = (lead.email || lead.name || "").toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      allLeads.push(lead);
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
