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
