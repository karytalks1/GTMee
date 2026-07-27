import * as cheerio from "cheerio";

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

const FETCH_OPTS = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  },
  signal: undefined as AbortSignal | undefined,
};

function fetchWithTimeout(url: string, ms = 10000) {
  return fetch(url, {
    ...FETCH_OPTS,
    signal: AbortSignal.timeout(ms),
  });
}

async function searchDDG(query: string) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetchWithTimeout(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  const results: { title: string; url: string; snippet: string }[] = [];

  $(".result").each((_, el) => {
    const title = $(el).find(".result__title").text().trim();
    const link = $(el).find(".result__url").text().trim();
    const snippet = $(el).find(".result__snippet").text().trim();
    if (title && link) {
      results.push({
        title,
        url: link.startsWith("http") ? link : `https://${link}`,
        snippet,
      });
    }
  });

  return results.slice(0, 10);
}

function extractEmails(text: string): string[] {
  const pattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(pattern) || [];
  return [...new Set(matches)].filter(
    (e) =>
      !e.endsWith(".png") &&
      !e.endsWith(".jpg") &&
      !e.endsWith(".gif") &&
      !e.includes("example.com") &&
      !e.includes("sentry.io") &&
      !e.includes("wixpress") &&
      !e.includes("@2x")
  );
}

function guessEmail(name: string, domain: string): string {
  const parts = name
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim()
    .split(/\s+/);
  if (parts.length < 2) return "";
  const first = parts[0];
  const last = parts[parts.length - 1];
  return `${first}.${last}@${domain}`;
}

async function scrapeTeamPage(
  baseUrl: string
): Promise<{ name: string; title: string; email: string }[]> {
  const people: { name: string; title: string; email: string }[] = [];
  const domain = new URL(baseUrl).hostname;

  const teamPaths = [
    "/about",
    "/team",
    "/about-us",
    "/our-team",
    "/people",
    "/leadership",
    "/company",
    "/about/team",
    "/company/team",
  ];

  for (const path of teamPaths) {
    try {
      const url = `${baseUrl.replace(/\/$/, "")}${path}`;
      const res = await fetchWithTimeout(url, 8000);
      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);
      const emails = extractEmails(html);
      const pageText = $("body").text();

      const titlePatterns = [
        /CEO/i, /CTO/i, /COO/i, /CFO/i, /CMO/i, /VP/i,
        /Director/i, /Head of/i, /Manager/i, /Lead/i,
        /Founder/i, /Co-founder/i, /President/i, /Partner/i,
      ];

      $("h2, h3, h4, strong, .team-member, .person, [class*='team'], [class*='member'], [class*='person']").each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 2 && text.length < 60 && /^[A-Z]/.test(text)) {
          const nextText = $(el).next().text().trim();
          const parentText = $(el).parent().text().trim();

          let title = "";
          for (const pat of titlePatterns) {
            if (pat.test(nextText)) {
              title = nextText.slice(0, 80);
              break;
            }
            if (pat.test(parentText) && parentText.length < 200) {
              const match = parentText.match(
                /(CEO|CTO|COO|CFO|CMO|VP|Director|Head of|Manager|Lead|Founder|Co-founder|President|Partner)[^,.\n]*/i
              );
              if (match) title = match[0].trim();
              break;
            }
          }

          const nameParts = text.split(/\s+/);
          if (
            nameParts.length >= 2 &&
            nameParts.length <= 4 &&
            !text.includes("@") &&
            !/\d/.test(text) &&
            !/^(About|Our|The|Meet|Team|Staff|Contact|Join)/i.test(text)
          ) {
            const email =
              emails.find((e) =>
                e.toLowerCase().includes(nameParts[0].toLowerCase())
              ) || guessEmail(text, domain);

            people.push({ name: text, title, email });
          }
        }
      });

      if (people.length > 0) break;
    } catch {
      continue;
    }
  }

  return people.slice(0, 15);
}

async function findPeopleFromSearch(
  segments: { segment: string; jobTitles: string[] }[]
): Promise<
  { name: string; title: string; company: string; email: string; source: string }[]
> {
  const leads: {
    name: string;
    title: string;
    company: string;
    email: string;
    source: string;
  }[] = [];
  const seen = new Set<string>();

  for (const seg of segments.slice(0, 3)) {
    for (const jobTitle of seg.jobTitles.slice(0, 2)) {
      try {
        const results = await searchDDG(
          `"${jobTitle}" ${seg.segment} site:linkedin.com/in`
        );

        for (const r of results.slice(0, 5)) {
          const nameMatch = r.title
            .replace(/ [-–|].*$/, "")
            .replace(/ - LinkedIn.*$/i, "")
            .trim();
          const parts = nameMatch.split(/\s+/);

          if (
            parts.length >= 2 &&
            parts.length <= 4 &&
            /^[A-Z]/.test(nameMatch) &&
            !/linkedin/i.test(nameMatch)
          ) {
            const key = nameMatch.toLowerCase();
            if (seen.has(key)) continue;
            seen.add(key);

            const companyMatch =
              r.snippet.match(
                /(?:at|@)\s+([A-Z][A-Za-z0-9\s&.'-]+?)(?:\s*[-–·|,.]|\s+\d|$)/
              ) || r.title.match(/[-–|]\s*([A-Z][A-Za-z0-9\s&.'-]+?)(?:\s*[-–|]|$)/);

            leads.push({
              name: nameMatch,
              title: jobTitle,
              company: companyMatch?.[1]?.trim() || "",
              email: "",
              source: "linkedin-search",
            });
          }
        }
      } catch {
        continue;
      }

      try {
        const results = await searchDDG(
          `"${jobTitle}" ${seg.segment} email contact`
        );

        for (const r of results.slice(0, 3)) {
          const emails = extractEmails(r.snippet);
          for (const email of emails.slice(0, 1)) {
            const namePart = email.split("@")[0].replace(/[._]/g, " ");
            const key = email.toLowerCase();
            if (seen.has(key)) continue;
            seen.add(key);

            leads.push({
              name:
                namePart
                  .split(" ")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ") || "",
              title: jobTitle,
              company: r.url.replace(/https?:\/\/(www\.)?/, "").split("/")[0],
              email,
              source: "web-search",
            });
          }
        }
      } catch {
        continue;
      }
    }
  }

  return leads;
}

async function scrapeCompanyContacts(
  domain: string,
  competitors: { website?: string; name?: string }[]
): Promise<
  { name: string; title: string; company: string; email: string; source: string }[]
> {
  const leads: {
    name: string;
    title: string;
    company: string;
    email: string;
    source: string;
  }[] = [];

  const domains = [
    domain,
    ...competitors
      .slice(0, 4)
      .map((c) => c.website?.replace(/https?:\/\/(www\.)?/, "").replace(/\/$/, ""))
      .filter(Boolean),
  ] as string[];

  for (const d of domains) {
    try {
      const people = await scrapeTeamPage(`https://${d}`);
      for (const p of people) {
        leads.push({
          name: p.name,
          title: p.title,
          company: d,
          email: p.email,
          source: "company-site",
        });
      }
    } catch {
      continue;
    }
  }

  return leads;
}

export async function findLeadsFromScraping(
  segments: { segment: string; jobTitles: string[] }[]
) {
  return findPeopleFromSearch(segments);
}

export async function findLeadsFromCompanySites(
  domain: string,
  competitors: { website?: string; name?: string }[]
) {
  return scrapeCompanyContacts(domain, competitors);
}
