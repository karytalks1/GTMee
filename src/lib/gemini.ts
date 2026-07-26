import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const gemini = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function analyzeWebsite(content: string, url: string) {
  const prompt = `Analyze this company website and extract:
1. Company name
2. What they sell/offer (1-2 sentences)
3. Target market/industry
4. Key value propositions (3-5 bullet points)
5. Pricing model if visible
6. Company size estimate (startup/SMB/enterprise)

Website URL: ${url}
Website content: ${content}

Respond in JSON format:
{
  "companyName": "",
  "description": "",
  "industry": "",
  "valueProps": [],
  "pricingModel": "",
  "companySize": ""
}`;

  const result = await gemini.generateContent(prompt);
  const text = result.response.text();
  const json = text.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(json);
}

export async function findCompetitors(companyInfo: Record<string, unknown>) {
  const prompt = `Based on this company profile, identify 5-8 likely competitors:
${JSON.stringify(companyInfo)}

Return JSON array:
[{"name": "", "website": "", "similarity": "high/medium/low"}]`;

  const result = await gemini.generateContent(prompt);
  const text = result.response.text();
  const json = text.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(json);
}

export async function generateICP(
  companyInfo: Record<string, unknown>,
  competitors: unknown[]
) {
  const prompt = `Based on this company and their competitors, generate ideal customer profiles (ICP segments):

Company: ${JSON.stringify(companyInfo)}
Competitors: ${JSON.stringify(competitors)}

Generate 5 ICP segments with fit scores. Return JSON:
[{"segment": "", "fitScore": 85, "description": "", "jobTitles": [], "industries": []}]`;

  const result = await gemini.generateContent(prompt);
  const text = result.response.text();
  const json = text.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(json);
}

export async function writeEmail(
  senderCompany: Record<string, unknown>,
  lead: { name: string; title?: string; company?: string },
  context?: string
) {
  const prompt = `Write a personalized cold outreach email.

Sender company: ${JSON.stringify(senderCompany)}
Recipient: ${lead.name}, ${lead.title || "Unknown role"} at ${lead.company || "Unknown company"}
${context ? `Additional context: ${context}` : ""}

Rules:
- Keep it under 120 words
- Make the first line about THEIR company, not yours
- No generic "I hope this email finds you well"
- Include a specific observation about their business
- End with a soft CTA (quick chat, not a hard sell)
- Sound human, not like a template

Return JSON:
{"subject": "", "body": ""}`;

  const result = await gemini.generateContent(prompt);
  const text = result.response.text();
  const json = text.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(json);
}

export async function handleReply(
  originalEmail: string,
  reply: string,
  companyInfo: Record<string, unknown>
) {
  const prompt = `A prospect replied to our cold email. Analyze and draft a response.

Our original email: ${originalEmail}
Their reply: ${reply}
Our company: ${JSON.stringify(companyInfo)}

Analyze the sentiment and draft a reply. Return JSON:
{
  "sentiment": "positive/neutral/negative",
  "intent": "interested/question/objection/not_interested/out_of_office",
  "suggestedReply": "",
  "shouldBookMeeting": false
}`;

  const result = await gemini.generateContent(prompt);
  const text = result.response.text();
  const json = text.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(json);
}
