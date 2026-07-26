import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeEmail } from "@/lib/gemini";
import { sendEmail } from "@/lib/email";

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
    include: {
      leads: { where: { status: "NEW", email: { not: null } } },
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (campaign.leads.length === 0) {
    return NextResponse.json(
      { error: "No leads with emails to contact" },
      { status: 400 }
    );
  }

  await prisma.campaign.update({
    where: { id },
    data: { status: "SENDING" },
  });

  const companyInfo = {
    name: campaign.name,
    description: campaign.description,
    website: campaign.website,
  };

  let sent = 0;

  for (const lead of campaign.leads.slice(0, 10)) {
    try {
      const emailContent = await writeEmail(companyInfo, {
        name: lead.name,
        title: lead.title || undefined,
        company: lead.company || undefined,
      });

      const email = await prisma.email.create({
        data: {
          campaignId: id,
          leadId: lead.id,
          subject: emailContent.subject,
          body: emailContent.body,
          status: "DRAFT",
        },
      });

      if (lead.email && process.env.RESEND_API_KEY) {
        const result = await sendEmail({
          to: lead.email,
          subject: emailContent.subject,
          body: emailContent.body,
        });

        if (result.data?.id) {
          await prisma.email.update({
            where: { id: email.id },
            data: {
              status: "SENT",
              sentAt: new Date(),
              resendId: result.data.id,
            },
          });

          await prisma.lead.update({
            where: { id: lead.id },
            data: { status: "CONTACTED" },
          });

          sent++;
        }
      } else {
        await prisma.email.update({
          where: { id: email.id },
          data: { status: "QUEUED" },
        });
      }
    } catch (error) {
      console.error(`Failed to process lead ${lead.id}:`, error);
    }
  }

  await prisma.campaign.update({
    where: { id },
    data: { status: sent > 0 ? "SENDING" : "READY" },
  });

  return NextResponse.json({ sent, message: `Sent ${sent} emails` });
}
