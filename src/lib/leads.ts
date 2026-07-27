import { chat } from "./gemini";

export async function searchHunter(domain: string) {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) return [];

  const res = await fetch(
    `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${apiKey}&limit=10`
  );

  if (!res.ok) return [];

  const data = await res.json();
  return (data.data?.emails || []).map(
    (e: {
      value: string;
      first_name: string;
      last_name: string;
      position: string;
      department: string;
      linkedin: string;
    }) => ({
      email: e.value,
      name: `${e.first_name || ""} ${e.last_name || ""}`.trim(),
      title: e.position || "",
      department: e.department || "",
      linkedIn: e.linkedin || "",
      source: "hunter",
    })
  );
}

export async function searchApollo(query: {
  jobTitles?: string[];
  industries?: string[];
  location?: string;
}) {
  const apiKey = process.env.APOLLO_API_KEY;
  if (!apiKey) return [];

  const res = await fetch("https://api.apollo.io/v1/mixed_people/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({
      person_titles: query.jobTitles || [],
      person_locations: query.location ? [query.location] : [],
      per_page: 10,
    }),
  });

  if (!res.ok) return [];

  const data = await res.json();
  return (data.people || []).map(
    (p: {
      name: string;
      email: string;
      title: string;
      organization?: { name: string };
      linkedin_url: string;
    }) => ({
      name: p.name,
      email: p.email,
      title: p.title,
      company: p.organization?.name || "",
      linkedIn: p.linkedin_url || "",
      source: "apollo",
    })
  );
}

export async function findLeadsFromScraping(
  segments: { segment: string; jobTitles: string[] }[]
) {
  const leads: {
    name: string;
    title: string;
    company: string;
    email: string;
    source: string;
  }[] = [];

  for (const seg of segments.slice(0, 3)) {
    for (const title of seg.jobTitles.slice(0, 2)) {
      const query = `${title} ${seg.segment} email contact`;
      try {
        const { searchGoogle } = await import("./scraper");
        const results = await searchGoogle(query);
        for (const r of results.slice(0, 3)) {
          leads.push({
            name: r.title.split(/[-|–]/).pop()?.trim() || r.title,
            title: title,
            company: r.url.replace(/https?:\/\/(www\.)?/, "").split("/")[0],
            email: "",
            source: "scraping",
          });
        }
      } catch {
        continue;
      }
    }
  }

  return leads;
}

export async function generateAILeads(
  segments: { segment: string; jobTitles: string[]; industries?: string[] }[],
  companyInfo?: { companyName?: string; industry?: string }
) {
  const segmentDescriptions = segments
    .slice(0, 5)
    .map(
      (s) =>
        `Segment: ${s.segment}, Job Titles: ${s.jobTitles.join(", ")}${s.industries ? `, Industries: ${s.industries.join(", ")}` : ""}`
    )
    .join("\n");

  const prompt = `Generate 10 realistic B2B prospect profiles that would match these ICP segments.
${companyInfo ? `The selling company is "${companyInfo.companyName || "Unknown"}" in the "${companyInfo.industry || "technology"}" space.` : ""}

ICP Segments:
${segmentDescriptions}

For each prospect create a realistic profile with:
- A realistic full name
- A job title from the segments above
- A plausible company name in a relevant industry
- A constructed email using the pattern firstname@companydomain.com (lowercase, no spaces)
- A LinkedIn URL placeholder

Return JSON:
{
  "leads": [
    {
      "name": "First Last",
      "title": "Job Title",
      "company": "Company Name",
      "email": "first@company.com",
      "linkedIn": ""
    }
  ]
}

Generate between 8 and 15 leads. Make them diverse across the segments. Use realistic but fictional names and companies.`;

  try {
    const result = JSON.parse(await chat(prompt));
    const leads = result.leads || [];
    return leads.map(
      (l: {
        name: string;
        title: string;
        company: string;
        email: string;
        linkedIn?: string;
      }) => ({
        name: l.name || "Unknown",
        title: l.title || "",
        company: l.company || "",
        email: l.email || "",
        linkedIn: l.linkedIn || "",
        source: "ai-generated",
      })
    );
  } catch (error) {
    console.error("AI lead generation failed:", error);
    return [];
  }
}
