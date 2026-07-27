import { NextRequest, NextResponse } from "next/server";
import { writeEmail } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { companyInfo, lead } = await req.json();

  if (!companyInfo || !lead) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  try {
    const result = await writeEmail(companyInfo, lead);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Email writing error:", error);
    return NextResponse.json(
      { error: "Failed to write email" },
      { status: 500 }
    );
  }
}
