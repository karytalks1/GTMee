import { NextRequest, NextResponse } from "next/server";
import { generateICP } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { companyInfo, competitors } = await req.json();

  try {
    const segments = await generateICP(companyInfo, competitors);
    return NextResponse.json({ segments });
  } catch (error) {
    console.error("ICP generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate ICP" },
      { status: 500 }
    );
  }
}
