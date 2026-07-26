import { NextRequest, NextResponse } from "next/server";
import { scrapeWebsite } from "@/lib/scraper";
import { analyzeWebsite, findCompetitors } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { website } = await req.json();

  if (!website) {
    return NextResponse.json({ error: "Website URL required" }, { status: 400 });
  }

  try {
    const scraped = await scrapeWebsite(website);
    const companyInfo = await analyzeWebsite(scraped.textContent, website);
    const competitors = await findCompetitors(companyInfo);

    return NextResponse.json({ companyInfo, competitors, scraped });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze website" },
      { status: 500 }
    );
  }
}
